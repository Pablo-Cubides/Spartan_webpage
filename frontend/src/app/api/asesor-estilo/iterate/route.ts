import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/server/firebaseAdmin';
import { mapUserTextToIntent } from '@/lib/asesor-estilo/ai/gemini';
import { editWithNanoBanana } from '@/lib/asesor-estilo/ai/nanobanana';
import { applyWatermark } from '@/lib/asesor-estilo/watermark';
import { uploadToStorage, deleteFromStorage } from '@/lib/asesor-estilo/storage';
import { moderateImage } from '@/lib/asesor-estilo/moderation';
import { appendLog } from '@/lib/asesor-estilo/ai/logger';
import { enforceRateLimit, getRequestIdentifier } from '@/lib/asesor-estilo/rate-limit';
import { enforceCredits, consumeCredits, getActionCost } from '@/lib/asesor-estilo/credits';
import { validateImageUrl } from '@/lib/asesor-estilo/validation/image';
import { getCached, setCached, generateGenerationCacheKey } from '@/lib/asesor-estilo/cache';
import { getImageBuffer, calculateImageHash } from '@/lib/asesor-estilo/validation/image';
import { extractErrorInfo, ModerationError } from '@/lib/asesor-estilo/errors';
import { APP_CONFIG } from '@/lib/asesor-estilo/config/app.config';
import fs from 'fs/promises';
import path from 'path';
import type { EditIntent, IteratePayload, FaceAnalysis } from '@/lib/asesor-estilo/types/ai';

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await req.json() as Partial<IteratePayload & { sessionId?: string | null }>;
    
    const auth = req.headers.get('authorization') || '';
    let userId: string | undefined;
    if (auth.startsWith('Bearer ')) {
      try {
        const idToken = auth.split('Bearer ')[1];
        const decoded = await verifyIdToken(idToken);
        userId = decoded.uid;
      } catch {
        // ignore
      }
    }

    const originalImageUrl = body.originalImageUrl;
    const userText = body.userText;
    const prevPublicId = body.prevPublicId;
  const analysis = body.analysis as unknown;

    // Get effective session ID
    const effectiveSessionId = body.sessionId || getRequestIdentifier(req);

    // Temporary debug: capture the sanitized incoming body so we can inspect payloads that cause 503s.
    // We redact the originalImageUrl when privacy mode is enabled to avoid leaking images into logs.
    try {
      const sanitized: Record<string, unknown> = { ...(body as Record<string, unknown>) };
      if (APP_CONFIG.compliance.PRIVACY_MODE && sanitized.originalImageUrl) {
        sanitized.originalImageUrl = '[redacted]';
      }
      // keep the entry small; include a timestamp
      await appendLog({ phase: 'api.iterate.received_raw', sessionId: effectiveSessionId, body: sanitized, timestamp: Date.now() });
    } catch (e) {
      // don't let logging failures break the request flow
      // eslint-disable-next-line no-console
      console.error('appendLog failed for iterate incoming body', e);
    }

    // userText may be empty if we are using analysis.suggestedText as the initial instruction
    const effectiveText = (analysis && typeof analysis === 'object' && (analysis as Record<string, unknown>).suggestedText)
      ? String((analysis as Record<string, unknown>).suggestedText)
      : userText;

    if (!originalImageUrl || !effectiveText) {
      return NextResponse.json(
        {
          error: 'MISSING_PARAMETERS',
          message: 'originalImageUrl and userText (or analysis.suggestedText) are required',
        },
        { status: 400 }
      );
    }

    await appendLog({
      phase: 'api.iterate.received',
      sessionId: effectiveSessionId,
      originalImageUrl: APP_CONFIG.compliance.PRIVACY_MODE ? '[redacted]' : originalImageUrl,
      instruction: effectiveText.substring(0, 100) + '...',
      timestamp: Date.now(),
    });

    // 1. Rate limiting
    await enforceRateLimit(effectiveSessionId, 'iterate');

    // 2. Validate image
    const validation = await validateImageUrl(originalImageUrl);
    if (!validation.valid) {
      await appendLog({
        phase: 'api.iterate.original_image_invalid',
        sessionId: effectiveSessionId,
        error: validation.error,
        details: validation.details,
        timestamp: Date.now(),
      });
      return NextResponse.json(
        {
          error: 'INVALID_IMAGE',
          message: validation.error,
          details: validation.details,
        },
        { status: 400 }
      );
    }

    // 3. Moderation check
    if (APP_CONFIG.features.MODERATION_ENABLED) {
      const mod = await moderateImage(originalImageUrl);
      if (!mod.ok) {
        throw new ModerationError('Image blocked by moderation', mod.reason);
      }
    }

    // 4. Check cache
    const imageBuffer = await getImageBuffer(originalImageUrl);
    const imageHash = calculateImageHash(imageBuffer);
    const cacheKey = generateGenerationCacheKey(imageHash, effectiveText);

    const cached = await getCached(cacheKey);
    if (cached) {
      await appendLog({
        phase: 'api.iterate.cache_hit',
        sessionId: effectiveSessionId,
        imageHash: imageHash.substring(0, 16),
        durationMs: Date.now() - startTime,
        timestamp: Date.now(),
      });

      return NextResponse.json({
        ...cached,
        cached: true,
      });
    }

    // 5. Check credits (but don't consume yet - only on success)
    await enforceCredits(userId, 'generate');

    // 6. Determine if this is the first iteration
    // First iteration = when prevPublicId is null/undefined (no previous edit)
    // This controls whether to use Gemini's recommendedChanges or only user text
    const isFirstIteration = !prevPublicId;

    // 7. Map user text to intent - PASS ANALYSIS WITH RECOMMENDED CHANGES (only used on first iteration)
    const intent: EditIntent = mapUserTextToIntent(effectiveText, 'es', analysis as FaceAnalysis | undefined, isFirstIteration);
    
    await appendLog({
      phase: 'api.iterate.intent',
      sessionId: effectiveSessionId,
      isFirstIteration,
      originalImageUrl: APP_CONFIG.compliance.PRIVACY_MODE ? '[redacted]' : originalImageUrl,
      intent,
      timestamp: Date.now(),
    });

    // 9. Generate edited image
    let out;
    try {
      // encode URL to ensure spaces and other characters don't break remote calls
      const safeOriginal = encodeURI(originalImageUrl);
      out = await editWithNanoBanana(safeOriginal, intent);
    } catch (err: unknown) {
      // If the editor service is unavailable, propagate a clean 503 JSON response
      const e = err;
      if (typeof e === 'object' && e !== null) {
        const obj = e as Record<string, unknown>;
        const status = obj.status;
        if (typeof status === 'number' && status === 503) {
          const msg = typeof obj.message === 'string' ? obj.message : 'AI image service unavailable. Please try again later.';
          return NextResponse.json({ error: msg }, { status: 503 });
        }
      }
      // rethrow other errors
      throw err;
    }

    await appendLog({
      phase: 'api.iterate.nanobanana_result',
      sessionId: effectiveSessionId,
      originalImageUrl: APP_CONFIG.compliance.PRIVACY_MODE ? '[redacted]' : originalImageUrl,
      out,
      timestamp: Date.now(),
    });

    // 10. Fetch, watermark and upload edited image
    let uploaded;
    try {
      const safeEdited = encodeURI(out.editedUrl);
      const fetchRes = await fetch(safeEdited);
      if (!fetchRes.ok) throw new Error(`failed to fetch edited image ${fetchRes.status}`);
      
      const arrayBuffer = await fetchRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Validate the edited image before processing
      if (buffer.length === 0) {
        throw new Error('Edited image is empty - Gemini may have failed to generate');
      }
      
      const withMark = APP_CONFIG.features.WATERMARK_ENABLED
        ? await applyWatermark(buffer)
        : buffer;
      
      const filename = `edited_iter_${Date.now()}`;
      uploaded = await uploadToStorage(withMark, filename);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      await appendLog({ 
        phase: 'api.iterate.fetch_edited_failed', 
        error: msg, 
        out, 
        timestamp: Date.now() 
      });
      
      // If it's an empty image error, suggest trying again with simpler changes
      if (msg.includes('empty') || msg.includes('failed to generate')) {
        return NextResponse.json({ 
          error: 'GENERATION_FAILED', 
          message: 'Image generation failed. Try requesting fewer changes at once, or simpler modifications.',
          suggestion: 'The AI may have trouble with very extreme edits. Try one change at a time.'
        }, { status: 503 });
      }
      
      return NextResponse.json({ error: 'failed_to_fetch_edited_image', detail: msg }, { status: 502 });
    }

    // 9. Consume credits on success
    const cost = getActionCost('generate');
    if (cost > 0) {
      await consumeCredits(userId, cost, 'generate');
    }

    // 10. Cache the result
    const result = {
      editedUrl: uploaded.url,
      publicId: uploaded.public_id,
      note: out.note,
      instruction: intent.instruction,
    };
    await setCached(cacheKey, result, 3600); // Cache for 1 hour

    // 11. Register generated image
    try {
      const registryPath = path.join(process.cwd(), 'data', 'generated_images.json');
      const txt = await fs.readFile(registryPath, 'utf8').catch(() => '[]');
      const arr = JSON.parse(txt || '[]');
      arr.push({
        publicId: uploaded.public_id,
        url: uploaded.url,
        createdAt: Date.now(),
        sessionId: effectiveSessionId,
      });
      await fs.writeFile(registryPath, JSON.stringify(arr, null, 2), 'utf8');
    } catch (e) {
      // best-effort
      console.error('register-generated-image error', e);
    }

    // 12. Try delete previous generated image (best-effort)
    if (prevPublicId) {
      try {
        await deleteFromStorage(prevPublicId);
      } catch {
        // ignore
      }
      try {
        // Also try a sanitized variant in case older uploads contained spaces or unsafe chars
        const safePrev = prevPublicId.replace(/\s+/g, '_');
        if (safePrev !== prevPublicId) await deleteFromStorage(safePrev);
      } catch {
        // ignore
      }
    }

    // 13. Log success
    await appendLog({
      phase: 'api.iterate.success',
      sessionId: effectiveSessionId,
      durationMs: Date.now() - startTime,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      ...result,
      cached: false,
    });

  } catch (error: unknown) {
    // Extract error information
    const errorInfo = extractErrorInfo(error);

    // Log error
    await appendLog({
      phase: 'api.iterate.error',
      error: errorInfo.message,
      code: errorInfo.code,
      statusCode: errorInfo.statusCode,
      durationMs: Date.now() - startTime,
      timestamp: Date.now(),
    });

    // Return error response
    return NextResponse.json(
      {
        error: errorInfo.code,
        message: errorInfo.message,
        ...errorInfo.details,
      },
      { status: errorInfo.statusCode }
    );
  }
}

