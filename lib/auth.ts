'use client'

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { toast } from 'react-toastify'

export interface UserProfile {
  uid: string
  email: string
  name: string
  role: 'student' | 'controller'
  createdAt: Date
  lastLogin: Date
}

export const createUserProfile = async (user: User, role: 'student' | 'controller'): Promise<UserProfile> => {
  if (!db) {
    throw new Error('Database not initialized')
  }

  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    name: user.displayName || user.email?.split('@')[0] || 'User',
    role: role,
    createdAt: new Date(),
    lastLogin: new Date()
  }

  await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true })
  localStorage.setItem('userProfile', JSON.stringify(userProfile))
  
  return userProfile
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!db) {
    throw new Error('Database not initialized')
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export const signInWithEmail = async (email: string, password: string, role: 'student' | 'controller') => {
  if (!auth) {
    throw new Error('Auth not initialized')
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const userProfile = await createUserProfile(userCredential.user, role)
    
    toast.success(`Welcome back, ${userProfile.name}!`)
    return { user: userCredential.user, profile: userProfile }
  } catch (error: any) {
    let errorMessage = 'Login failed. Please try again.'
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email'
        break
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password'
        break
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address'
        break
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.'
        break
    }
    
    toast.error(errorMessage)
    throw error
  }
}

export const signInWithGoogle = async (role: 'student' | 'controller') => {
  if (!auth) {
    throw new Error('Auth not initialized')
  }

  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const userProfile = await createUserProfile(result.user, role)
    
    toast.success(`Welcome, ${userProfile.name}!`)
    return { user: result.user, profile: userProfile }
  } catch (error: any) {
    let errorMessage = 'Google login failed. Please try again.'
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Login cancelled'
        break
      case 'auth/popup-blocked':
        errorMessage = 'Popup blocked. Please allow popups and try again.'
        break
    }
    
    toast.error(errorMessage)
    throw error
  }
}

export const signUpWithEmail = async (email: string, password: string, role: 'student' | 'controller') => {
  if (!auth) {
    throw new Error('Auth not initialized')
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const userProfile = await createUserProfile(userCredential.user, role)
    
    toast.success(`Account created successfully! Welcome, ${userProfile.name}!`)
    return { user: userCredential.user, profile: userProfile }
  } catch (error: any) {
    let errorMessage = 'Account creation failed. Please try again.'
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists'
        break
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters'
        break
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address'
        break
    }
    
    toast.error(errorMessage)
    throw error
  }
}

export const signOutUser = async () => {
  if (!auth) {
    throw new Error('Auth not initialized')
  }

  try {
    await signOut(auth)
    localStorage.removeItem('userProfile')
    localStorage.removeItem('rememberedEmail')
    localStorage.removeItem('rememberedUserType')
    toast.success('Successfully signed out')
  } catch (error) {
    console.error('Sign out error:', error)
    toast.error('Error signing out')
    throw error
  }
}

export const getRedirectPath = (role: 'student' | 'controller'): string => {
  return role === 'student' ? '/school-lab' : '/'
} 