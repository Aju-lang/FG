'use client'

// Firebase Web SDK only - no server-side imports
let firebaseApp: any = null
let firebaseAuth: any = null
let firebaseDb: any = null

// Dynamic import function to load Firebase only on client side
export const initializeFirebase = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized on the client side')
  }

  if (firebaseApp) {
    return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb }
  }

  try {
    // Dynamic imports to avoid SSR issues
    const { initializeApp, getApps } = await import('firebase/app')
    const { getAuth } = await import('firebase/auth')
    const { getFirestore } = await import('firebase/firestore')

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    // Initialize Firebase
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig)
    } else {
      firebaseApp = getApps()[0]
    }

    firebaseAuth = getAuth(firebaseApp)
    firebaseDb = getFirestore(firebaseApp)

    return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    throw new Error('Firebase initialization failed')
  }
}

// Helper functions that ensure client-side only execution
export const getFirebaseServices = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase services can only be used on the client side')
  }
  return await initializeFirebase()
} 