import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/server/firebaseAdmin';
import { analyzeImageWithGemini } from '@/lib/asesor-estilo/ai/gemini';
import { appendLog } from '@/lib/asesor-estilo/ai/logger';
import { enforceRateLimit, getRequestIdentifier } from '@/lib/asesor-estilo/rate-limit';
import { enforceCredits, consumeCredits, getActionCost } from '@/lib/asesor-estilo/credits';
import { validateImageUrl } from '@/lib/asesor-estilo/validation/image';
import { getCached, setCached, generateAnalysisCacheKey } from '@/lib/asesor-estilo/cache';
import { getImageBuffer, calculateImageHash } from '@/lib/asesor-estilo/validation/image';
import { extractErrorInfo } from '@/lib/asesor-estilo/errors';
import { APP_CONFIG } from '@/lib/asesor-estilo/config/app.config';

export async function POST(req: Request): Promise<Response> {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const { imageUrl, locale, sessionId } = await req.json();

    const auth = req.headers.get('authorization') || '';
    let userId: string | undefined;
    let emailVerified = false;

    if (auth.startsWith('Bearer ')) {
      try {
        const idToken = auth.split('Bearer ')[1];
        const decoded = await verifyIdToken(idToken);
        userId = decoded.uid;
        emailVerified = !!decoded.email_verified;
      } catch {
        // ignore invalid token
      }
    }
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'MISSING_IMAGE_URL', message: 'imageUrl is required' },
        { status: 400 }
      );
    }

    const effectiveLocale = locale || 'es';
    const effectiveSessionId = sessionId || getRequestIdentifier(req);

    await appendLog({
      phase: 'api.analyze.received',
      imageUrl: APP_CONFIG.compliance.PRIVACY_MODE ? '[redacted]' : imageUrl,
      locale: effectiveLocale,
      sessionId: effectiveSessionId,
      timestamp: Date.now(),
    });

    // 1. Rate limiting
    await enforceRateLimit(effectiveSessionId, 'analyze');

    // 2. Validate image
    const validation = await validateImageUrl(imageUrl);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'INVALID_IMAGE',
          message: validation.error,
          details: validation.details,
        },
        { status: 400 }
      );
    }

    // 3. Check cache
    const imageBuffer = await getImageBuffer(imageUrl);
    const imageHash = calculateImageHash(imageBuffer);
    const cacheKey = generateAnalysisCacheKey(imageHash, effectiveLocale);
    
    const cached = await getCached(cacheKey);
    if (cached) {
      await appendLog({
        phase: 'api.analyze.cache_hit',
        imageHash: imageHash.substring(0, 16),
        durationMs: Date.now() - startTime,
        timestamp: Date.now(),
      });

      return NextResponse.json({
        analysis: cached,
        workingUrl: imageUrl,
        cached: true,
      });
    }

    // 4. Check credits (but don't consume yet - only on success)
    if (userId && !emailVerified) {
      return NextResponse.json(
        {
          error: 'EMAIL_NOT_VERIFIED',
          message: 'Debes verificar tu correo electrónico para realizar análisis.',
        },
        { status: 403 }
      );
    }
    await enforceCredits(userId, 'analyze');

    // 5. Perform analysis
    const analysis = await analyzeImageWithGemini(imageUrl, effectiveLocale);

    // 6. Consume credits on success
    const cost = getActionCost('analyze');
    if (cost > 0) {
      await consumeCredits(userId, cost, 'analyze');
    }

    // 7. Cache the result
    await setCached(cacheKey, analysis);

    // 8. Log success
    await appendLog({
      phase: 'api.analyze.result',
      imageUrl: APP_CONFIG.compliance.PRIVACY_MODE ? '[redacted]' : imageUrl,
      success: true,
      durationMs: Date.now() - startTime,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      analysis,
      workingUrl: imageUrl,
      cached: false,
    });

  } catch (error: unknown) {
    // Extract error information
    const errorInfo = extractErrorInfo(error);

    // Log error
    await appendLog({
      phase: 'api.analyze.error',
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
