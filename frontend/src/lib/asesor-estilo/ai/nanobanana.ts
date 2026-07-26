import { uploadToStorage } from '../storage'
import { appendLog } from './logger'
import type { EditIntent } from '../types/ai'

type UnknownRecord = Record<string, unknown>

const NANOBANANA_URL = process.env.NANOBANANA_URL || ''
const NANOBANANA_KEY = process.env.NANOBANANA_API_KEY || process.env.GEMINI_API_KEY_CLOTHING || process.env.GEMINI_API_KEY || ''

const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image'
const FALLBACK_IMAGE_MODEL = 'gemini-2.5-flash-image'
const GEMINI_API_KEY_VAR = process.env.GEMINI_API_KEY_CLOTHING || process.env.GEMINI_API_KEY || ''
const GEMINI_REST_URL = process.env.GEMINI_REST_URL || ''

// Timeout configurations with progressive timeouts
const GENERATION_TIMEOUT = parseInt(process.env.AI_GENERATION_TIMEOUT || '120000', 10) // 120s for generation/editing

// Rate limiting configuration
const MAX_RETRIES = 3
const BASE_RETRY_DELAY = 1000 // 1 second base delay
const MAX_RETRY_DELAY = 8000 // Maximum 8 seconds delay

async function uploadIfNeeded(result: unknown, filenameBase = 'nanobanana') {
  if (!result || typeof result !== 'object') throw new Error('NanoBanana returned no result')
  const r = result as UnknownRecord
  if (typeof r.url === 'string') return { url: r.url, public_id: (r.publicId as string) || null }
  if (typeof r.base64 === 'string') {
    const buf = Buffer.from(r.base64 as string, 'base64')
    const uploaded = await uploadToStorage(buf, `${filenameBase}_${Date.now()}`)
    return { url: uploaded.url, public_id: uploaded.public_id }
  }
  throw new Error('NanoBanana returned no url or base64')
}

// Primary exported function used by API routes
export async function editWithNanoBanana(imageUrl: string, intent: EditIntent): Promise<{ editedUrl: string; note?: string; publicId?: string | null }> {
  await appendLog({ phase: 'nanobanana.start', imageUrl, intent: intent?.instruction || 'N/A' })

  // Helper: call a Gemini-style REST editor (expects JSON { imageUrl, intent })
  async function callGeminiEditorViaRest(url: string, apiKey: string | undefined) {
    try {
      await appendLog({ phase: 'nanobanana.request.rest', url, imageUrl, intent })
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`
      const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ imageUrl, intent }) })
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '')
        throw new Error(`remote editor error ${resp.status} ${txt}`)
      }
      const data = await resp.json()
      const uploaded = await uploadIfNeeded(data, 'nanobanana')
      const maybeNote = (data as UnknownRecord).note
      const noteStr = typeof maybeNote === 'string' ? maybeNote : JSON.stringify(maybeNote ?? 'Edited via Gemini editor')
      const result = { editedUrl: uploaded.url, note: noteStr, publicId: uploaded.public_id }
      await appendLog({ phase: 'nanobanana.response.rest', request: { url, imageUrl, intent }, result })
      return result
    } catch (e: unknown) {
      await appendLog({ phase: 'nanobanana.call_error.rest', error: String(e), url })
      throw e
    }
  }

  // Helper: call Google Gemini 2.5 Flash Image via REST API for image editing
  async function callGoogleImageEdit(apiKey: string) {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await appendLog({ phase: 'nanobanana.request.gemini25', imageUrl, instruction: intent?.instruction, attempt, maxRetries: MAX_RETRIES });

        // Fetch original image and convert to base64
        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) throw new Error(`Failed to fetch original image: ${imgRes.status}`);
        const imgBuffer = await imgRes.arrayBuffer();
        const base64Image = Buffer.from(imgBuffer).toString('base64');
        const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

        // Build editing prompt
        const instruction = intent && intent.instruction
          ? String(intent.instruction)
          : 'Edit this image professionally';

        // Build structured changes details
        let changeDetails = '';
        if (intent?.change && intent.change.length > 0) {
          changeDetails = '\nChanges requested:\n';
          for (const change of intent.change) {
            changeDetails += `- ${change.value}\n`;
          }
        }

        // Check if this is a clothing edit based on analysisType in intent
        // The analysisType is set by the respective tool (clothing or face)
        const isClothingEdit = intent?.analysisType === 'clothing';

        // Build context-aware prompt - completely separate for each tool
        let prompt: string;
        if (isClothingEdit) {
          // CLOTHING TOOL: Only change clothes, NEVER touch face/hair/beard
          prompt = intent.locale === 'es'
            ? `Edita esta foto cambiando ÚNICAMENTE la ROPA de la persona. ${changeDetails}${instruction}. 
REGLAS ESTRICTAS:
- NO cambies el rostro, pelo, barba o cualquier parte de la cara
- Mantén exactamente la misma pose, expresión y fondo
- Solo modifica las prendas de vestir
- Alta calidad, fotorealista.`
            : `Edit this photo changing ONLY the person's CLOTHING. ${changeDetails}${instruction}. 
STRICT RULES:
- DO NOT change face, hair, beard or any facial features
- Keep exactly the same pose, expression and background
- Only modify the clothing/outfit
- High quality, photorealistic.`;
        } else {
          // FACE TOOL: Only change face/hair/beard, NEVER touch clothing
          prompt = intent.locale === 'es'
            ? `Edita esta foto modificando ÚNICAMENTE el ROSTRO, PELO o BARBA de la persona. ${changeDetails}${instruction}. 
REGLAS ESTRICTAS:
- NO cambies la ropa ni el outfit
- Mantén exactamente la misma pose y fondo
- Solo modifica pelo, barba o rasgos faciales según las indicaciones
- Alta calidad, fotorealista.`
            : `Edit this photo changing ONLY the person's FACE, HAIR or BEARD. ${changeDetails}${instruction}. 
STRICT RULES:
- DO NOT change clothing or outfit
- Keep exactly the same pose and background
- Only modify hair, beard or facial features as indicated
- High quality, photorealistic.`;
        }

        // Use GEMINI_IMAGE_MODEL (gemini-3.1-flash-image) with fallback to gemini-2.5-flash-image
        const primaryModel = GEMINI_IMAGE_MODEL;
        const modelsToTry = [primaryModel];
        if (primaryModel !== FALLBACK_IMAGE_MODEL) {
          modelsToTry.push(FALLBACK_IMAGE_MODEL);
        }

        for (const modelName of modelsToTry) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

            const payload = {
              contents: [{
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Image
                    }
                  }
                ]
              }],
              generationConfig: {
                responseModalities: ["TEXT", "IMAGE"]
              }
            };

            await appendLog({ phase: 'nanobanana.gemini_image.calling', model: modelName, promptLength: prompt.length, attempt });

            const resp = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (!resp.ok) {
              const txt = await resp.text().catch(() => '');
              throw new Error(`Gemini Image API (${modelName}) error: ${resp.status} ${txt}`);
            }

            const data = await resp.json() as UnknownRecord;

            // Extract image from response
            const candidates = data.candidates as UnknownRecord[];
            if (candidates && candidates.length > 0) {
              const content = candidates[0].content as UnknownRecord;
              const parts = content?.parts as UnknownRecord[];
              if (parts && Array.isArray(parts)) {
                for (const part of parts) {
                  const inlineData = part.inlineData as UnknownRecord | undefined;
                  if (inlineData && inlineData.data) {
                    const base64 = inlineData.data as string;
                    const uploaded = await uploadIfNeeded({ base64 }, `nanobanana_${modelName.replace(/[^a-zA-Z0-9]/g, '_')}`);

                    const result = {
                      editedUrl: uploaded.url,
                      note: intent.locale === 'es' ? `Editado con ${modelName}` : `Edited with ${modelName}`,
                      publicId: uploaded.public_id
                    };

                    await appendLog({ phase: 'nanobanana.response.gemini_image', model: modelName, result, attempt });
                    return result;
                  }
                }
              }
            }

            throw new Error(`No image data in ${modelName} response`);
          } catch (modelErr: unknown) {
            await appendLog({ phase: 'nanobanana.model_error', model: modelName, error: String(modelErr), attempt });
            if (modelName === modelsToTry[modelsToTry.length - 1]) {
              throw modelErr;
            }
          }
        }

        throw new Error('No image editing models succeeded');
      } catch (e: unknown) {
        lastError = e as Error;
        await appendLog({ phase: 'nanobanana.call_error.gemini_image', error: String(e), attempt });

        if (attempt === MAX_RETRIES) throw lastError;

        const delayMs = Math.min(BASE_RETRY_DELAY * Math.pow(2, attempt - 1), MAX_RETRY_DELAY);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    throw lastError || new Error('Gemini 2.5 image edit failed');
  }

  // Try in preferred order: GOOGLE_API_KEY (Gemini), GEMINI_REST_URL (custom proxy), then NANOBANANA_URL
  if (GEMINI_API_KEY_VAR) {
    try {
      return await callGoogleImageEdit(GEMINI_API_KEY_VAR)
    } catch (geminiError: unknown) {
      const error = geminiError as Error
      await appendLog({
        phase: 'nanobanana.google_failed',
        error: String(geminiError).substring(0, 200),
        errorType: error?.name || 'Unknown',
        message: error?.message || 'No message'
      })
      // continue to other options
    }
  }

  if (GEMINI_REST_URL) {
    try {
      return await callGeminiEditorViaRest(GEMINI_REST_URL, undefined)
    } catch (restError: unknown) {
      const error = restError as Error
      await appendLog({
        phase: 'nanobanana.rest_failed',
        error: String(restError).substring(0, 200),
        errorType: error?.name || 'Unknown',
        message: error?.message || 'No message'
      })
      // continue to other options
    }
  }

  if (NANOBANANA_URL && NANOBANANA_KEY) {
    try {
      await appendLog({ phase: 'nanobanana.request.legacy', imageUrl, intent })
      const body = { imageUrl, intent }
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT)

      const resp = await fetch(NANOBANANA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NANOBANANA_KEY}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!resp.ok) {
        const txt = await resp.text().catch(() => '')
        throw new Error(`NanoBanana error: ${resp.status} ${txt}`)
      }
      const data = await resp.json()
      const uploaded = await uploadIfNeeded(data, 'nanobanana')
      const result = { editedUrl: uploaded.url, note: 'Edited with NanoBanana', publicId: uploaded.public_id }
      await appendLog({ phase: 'nanobanana.response.legacy', request: { imageUrl, intent }, result })
      return result
    } catch (legacyError: unknown) {
      const error = legacyError as Error
      await appendLog({
        phase: 'nanobanana.call_error.legacy',
        error: String(legacyError),
        errorType: error?.name || 'Unknown',
        message: error?.message || 'No message'
      })
      console.warn('NanoBanana call failed', legacyError)
      // fall through to simulated path
    }
  }

  // No local image-editing fallback is supported anymore. If all external
  // editors failed (Gemini SDK, REST editor, legacy service), return a
  // clear service-unavailable error by throwing.

  const failureInfo = {
    geminiSdk: GEMINI_API_KEY_VAR ? 'Failed or unauthorized' : 'Not configured',
    restApi: GEMINI_REST_URL ? 'Failed' : 'Not configured',
    legacyService: (NANOBANANA_URL && NANOBANANA_KEY) ? 'Failed' : 'Not configured'
  };

  await appendLog({
    phase: 'nanobanana.service_unavailable',
    imageUrl,
    intent,
    failureReasons: failureInfo,
    note: 'No remote image editor available'
  });

  const err = new Error('AI image service unavailable (Imagen 3/Gemini failed). Verify API permissions.') as Error & { status?: number };
  err.status = 503;
  throw err;
}
