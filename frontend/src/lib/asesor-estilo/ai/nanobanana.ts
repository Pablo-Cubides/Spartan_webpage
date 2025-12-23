import fetch from 'node-fetch'
import { uploadToStorage } from '../storage'
import { appendLog } from './logger'
import type { EditIntent } from '../types/ai'

type UnknownRecord = Record<string, unknown>

const NANOBANANA_URL = process.env.NANOBANANA_URL || ''
const NANOBANANA_KEY = process.env.NANOBANANA_API_KEY || process.env.GEMINI_API_KEY || ''

// Accept different environment variable names used in this project
const GEMINI_API_KEY_VAR = process.env.GEMINI_API_KEY || ''
const GEMINI_REST_URL = process.env.GEMINI_REST_URL || ''
const GOOGLE_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || process.env.GOOGLE_IMAGE_MODEL || 'imagen-3.0-generate-001'

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

  // Helper: call Google Gemini (Imagen 3) via REST API
  async function callGoogleImageEdit(apiKey: string) {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await appendLog({ phase: 'nanobanana.request.google_rest', imageUrl, instruction: intent?.instruction, attempt, maxRetries: MAX_RETRIES })

        // Build prompt
        const instruction = intent && intent.instruction
          ? String(intent.instruction)
          : 'Generate a professional portrait';

        // Build structured changes details
        let changeDetails = '';
        if (intent?.change && intent.change.length > 0) {
          changeDetails = 'with these features:\n';
          for (const change of intent.change) {
            changeDetails += `- ${change.value}\n`;
          }
        }

        const prompt = intent.locale === 'es'
          ? `Retrato profesional de hombre, ${changeDetails}, ${instruction}. Fotorealista, alta calidad, iluminación de estudio, 8k.`
          : `Professional portrait of a man, ${changeDetails}, ${instruction}. Photorealistic, high quality, studio lighting, 8k.`;

        const modelName = GOOGLE_IMAGE_MODEL;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${apiKey}`;

        const payload = {
          instances: [
            { prompt: prompt }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1"
          }
        };

        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!resp.ok) {
          const txt = await resp.text().catch(() => '');
          throw new Error(`Google Imagen API error: ${resp.status} ${txt}`);
        }

        const data = await resp.json() as UnknownRecord;

        // Extract image from response (Base64)
        // Response format: { predictions: [ { bytesBase64Encoded: "..." } ] }
        const predictions = data.predictions as UnknownRecord[];
        if (predictions && predictions.length > 0 && predictions[0].bytesBase64Encoded) {
          const base64 = predictions[0].bytesBase64Encoded as string;
          const uploaded = await uploadIfNeeded({ base64 }, 'nanobanana_imagen3');

          const result = {
            editedUrl: uploaded.url,
            note: intent.locale === 'es' ? 'Generado con Imagen 3' : 'Generated with Imagen 3',
            publicId: uploaded.public_id
          };

          await appendLog({ phase: 'nanobanana.response.google_rest', result, attempt });
          return result;
        }

        throw new Error('No image data in Google Imagen response');

      } catch (e: unknown) {
        lastError = e as Error;
        await appendLog({ phase: 'nanobanana.call_error.google_rest', error: String(e), attempt });

        if (attempt === MAX_RETRIES) throw lastError;

        const delayMs = Math.min(BASE_RETRY_DELAY * Math.pow(2, attempt - 1), MAX_RETRY_DELAY);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    throw lastError || new Error('Google Imagen failed');
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

  // If all attempts fail, FAIL GRACEFULLY by returning the original image
  // This ensures the user flow is not broken even if image generation service is down/unauthorized
  console.warn('[NanoBanana] All image generation methods failed, falling back to original image');

  await appendLog({
    phase: 'nanobanana.fallback_original',
    imageUrl,
    note: 'Image generation unavailable, using original',
    failureReasons: {
      geminiSdk: GEMINI_API_KEY_VAR ? 'Failed or unauthorized' : 'Not configured',
      restApi: GEMINI_REST_URL ? 'Failed' : 'Not configured',
      legacyService: (NANOBANANA_URL && NANOBANANA_KEY) ? 'Failed' : 'Not configured'
    }
  });

  return {
    editedUrl: imageUrl, // Return original URL
    note: intent.locale === 'es'
      ? 'Nota: Servicio de edición no disponible actualmente. Se muestra la imagen original.'
      : 'Note: Editing service currently unavailable. Showing original image.',
    publicId: null // No new upload
  };
}
