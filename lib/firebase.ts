// lib/firebase.ts - Firebase configuration and initialization

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyAm-KVkBx3axR4p27z6t73fF49kATTH1I0",
  authDomain: "fg-school-f28b2.firebaseapp.com",
  projectId: "fg-school-f28b2",
  storageBucket: "fg-school-f28b2.firebasestorage.app",
  messagingSenderId: "1016391940159",
  appId: "1:1016391940159:web:32e11c0a3df04e44d8608a",
  measurementId: "G-JEJK06T48B"
}

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

// Initialize Firebase app (prevent multiple initializations)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase services
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

// Initialize Analytics (only in browser and if supported)
let analytics: any = null

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app)
    }
  })
}

// ============================================================================
// EXPORTS
// ============================================================================

export { app, db, auth, storage, analytics }
export default app 