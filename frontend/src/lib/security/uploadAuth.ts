import admin from 'firebase-admin'

const SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT || ''
const UPLOAD_API_KEYS = (process.env.UPLOAD_API_KEYS || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean)
const ALLOWED_ORIGINS = (process.env.ALLOWED_UPLOAD_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const isProduction = process.env.NODE_ENV === 'production'

function initFirebase() {
  try {
    if (!admin.apps.length) {
      const cred = SERVICE_ACCOUNT ? JSON.parse(SERVICE_ACCOUNT) : undefined
      if (cred) admin.initializeApp({ credential: admin.credential.cert(cred) })
    }
  } catch (e) {
    // initialization may fail in environments without credentials
    console.warn('Firebase admin init failed:', e instanceof Error ? e.message : String(e))
  }
}

/**
 * Check if the origin is allowed for uploads.
 * In production, ALLOWED_UPLOAD_ORIGINS must be configured.
 * In development, allows all origins if not configured.
 */
export function isOriginAllowed(origin?: string): boolean {
  // In production, require explicit origin configuration
  if (isProduction) {
    if (!ALLOWED_ORIGINS.length) {
      console.warn('[Security] ALLOWED_UPLOAD_ORIGINS not configured in production - blocking all origins');
      return false;
    }
    if (!origin) return false;
    return ALLOWED_ORIGINS.includes(origin);
  }
  
  // In development, be permissive if not configured
  if (!ALLOWED_ORIGINS.length) return true;
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

export async function verifyFirebaseIdToken(idToken: string) {
  initFirebase()
  if (!admin.apps.length) throw new Error('Firebase admin not initialized')
  return admin.auth().verifyIdToken(idToken)
}

export function checkApiKey(key?: string) {
  if (!key) return false
  return UPLOAD_API_KEYS.includes(key)
}

export function getAllowedOriginsList() {
  return ALLOWED_ORIGINS
}
