// src/lib/firebase.ts
import { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider, type User } from 'firebase/auth';
// NOTE: Analytics intentionally NOT imported to avoid 403 errors with restricted API keys
// If needed in production, ensure API key has unrestricted permissions and import getAnalytics

// Only attempt client initialization when running in the browser and a
// non-placeholder API key is present.
const isBrowser = typeof window !== 'undefined';
const hasClientApiKey = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('your-');

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

if (isBrowser && hasClientApiKey) {
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      // measurementId is included but analytics will not be initialized
      // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (e) {
    // Keep auth null if initialization fails
    console.warn('Firebase client initialization warning:', e instanceof Error ? e.message : String(e));
    app = null;
    auth = null;
  }
}

export { auth };

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!!auth && isBrowser);

  useEffect(() => {
    if (!isBrowser || !auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u as User | null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { user, loading };
}

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase auth not configured');
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signOut() {
  if (!auth) return;
  return firebaseSignOut(auth);
}