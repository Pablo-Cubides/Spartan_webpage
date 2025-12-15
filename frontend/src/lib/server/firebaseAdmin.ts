import admin from 'firebase-admin'

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY

// Flag to track if Admin SDK is properly initialized
let adminInitialized = false

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
      adminInitialized = true
      console.log('✅ Firebase Admin SDK initialized with service account')
    } catch (err) {
      console.warn('Firebase admin initialization failed:', err instanceof Error ? err.message : String(err))
    }
  } else {
    console.warn('⚠️ Firebase Admin SDK: Missing FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY')
    console.warn('   Token verification will use REST API fallback')
  }
}

// Fallback: Verify token using Firebase REST API (works without Admin SDK)
async function verifyTokenWithRestApi(idToken: string): Promise<{
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_FIREBASE_API_KEY')
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    console.error('Token verification failed:', error)
    throw new Error(error.error?.message || 'Token verification failed')
  }

  const data = await response.json()
  const user = data.users?.[0]

  if (!user) {
    throw new Error('No user found for token')
  }

  return {
    uid: user.localId,
    email: user.email,
    email_verified: user.emailVerified,
    name: user.displayName,
    picture: user.photoUrl,
  }
}

export async function verifyIdToken(idToken: string) {
  // If Admin SDK is initialized, use it (more secure)
  if (adminInitialized && admin.apps.length > 0) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken)
      return decoded
    } catch (err) {
      console.error('Admin SDK verification failed, trying REST API fallback:', err)
    }
  }

  // Fallback to REST API verification
  return verifyTokenWithRestApi(idToken)
}

export default admin
