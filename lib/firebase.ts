'use client'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAm-KVkBx3axR4p27z6t73fF49kATTH1I0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fg-school-f28b2.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fg-school-f28b2",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fg-school-f28b2.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1016391940159",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1016391940159:web:32e11c0a3df04e44d8608a",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-JEJK06T48B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
let analytics: any = null;
let auth: any = null;
let db: any = null;

// Only initialize client-side services in the browser
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db, analytics };

// Getter functions that ensure client-side only execution
export const getFirebaseAuth = () => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth can only be used on the client side')
  }
  return auth
}

export const getFirebaseDb = () => {
  if (typeof window === 'undefined') {
    throw new Error('Firestore can only be used on the client side')
  }
  return db
}

export const getFirebaseApp = () => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase App can only be used on the client side')
  }
  return app
} 