import admin from 'firebase-admin'

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY

if (!admin.apps.length) {
  if (privateKey && clientEmail && privateKey.includes('-----BEGIN')) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      })
    } catch (err) {
      // If the provided private key is invalid or parsing fails, avoid throwing
      // during build/collect-phase — log and fall back to default initialization
      // which may still work if running in a GCP environment.
      // eslint-disable-next-line no-console
      console.warn('Firebase admin initialization skipped due to invalid key:', err instanceof Error ? err.message : String(err))
      try {
        admin.initializeApp()
      } catch {
        // ignore
      }
    }
  } else {
    try {
      admin.initializeApp()
    } catch {
      // ignore
    }
  }
}

export async function verifyIdToken(idToken: string) {
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    return decoded
  } catch (err) {
    throw err
  }
}

export default admin
