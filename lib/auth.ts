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
  
  // Store in both localStorage keys for compatibility
  localStorage.setItem('userProfile', JSON.stringify(userProfile))
  localStorage.setItem('currentUser', JSON.stringify(userProfile))
  
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
    
    toast.success(`Welcome back, ${userProfile.name}! 👋`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
    
    return { user: userCredential.user, profile: userProfile }
  } catch (error: any) {
    let errorMessage = 'Login failed. Please try again.'
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address'
        break
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.'
        break
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address'
        break
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.'
        break
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled'
        break
      case 'auth/invalid-credential':
        errorMessage = 'Invalid credentials. Try: student@test.com / password123 or create an account in Firebase Console'
        break
      default:
        errorMessage = `Login failed: ${error.message || 'Please try again.'}`
        break
    }
    
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
    
    throw error
  }
}

export const signInWithGoogle = async (role: 'student' | 'controller') => {
  if (!auth) {
    throw new Error('Auth not initialized')
  }

  try {
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    
    const result = await signInWithPopup(auth, provider)
    const userProfile = await createUserProfile(result.user, role)
    
    toast.success(`Welcome to FG School, ${userProfile.name}! 🎉`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
    
    return { user: result.user, profile: userProfile }
  } catch (error: any) {
    let errorMessage = 'Google sign-in failed. Please try again.'
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in was cancelled'
        break
      case 'auth/popup-blocked':
        errorMessage = 'Popup blocked. Please allow popups and try again.'
        break
      case 'auth/cancelled-popup-request':
        errorMessage = 'Sign-in request was cancelled'
        break
      case 'auth/account-exists-with-different-credential':
        errorMessage = 'An account already exists with the same email address'
        break
    }
    
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
    
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
    
    toast.success(`Welcome to FG School, ${userProfile.name}! 🎓`, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
    
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
        errorMessage = 'Please enter a valid email address'
        break
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password accounts are not enabled'
        break
    }
    
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
    
    throw error
  }
}

export const signOutUser = async () => {
  if (!auth) {
    throw new Error('Auth not initialized')
  }

  try {
    await signOut(auth)
    
    // Clear all localStorage items
    localStorage.removeItem('userProfile')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('rememberedEmail')
    localStorage.removeItem('rememberedUserType')
    
    toast.success('Successfully signed out. See you soon! 👋', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  } catch (error) {
    console.error('Sign out error:', error)
    toast.error('Error signing out. Please try again.', {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
    throw error
  }
}

export const getRedirectPath = (role: 'student' | 'controller'): string => {
  // Updated redirect paths as requested
  switch (role) {
    case 'student':
      return '/school-lab'  // Updated from school-lab.html to Next.js route
    case 'controller':
      return '/dashboard'   // Updated from dashboard.html to Next.js route
    default:
      return '/'
  }
}

// Utility function to get current user from localStorage
export const getCurrentUser = (): UserProfile | null => {
  try {
    const stored = localStorage.getItem('currentUser') || localStorage.getItem('userProfile')
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser() && !!auth?.currentUser
}

// Quick utility to create demo users for testing
export const createDemoUsers = async () => {
  if (!auth) {
    throw new Error('Auth not initialized')
  }

  const demoUsers = [
    { email: 'student@test.com', password: 'password123', role: 'student' as const },
    { email: 'admin@test.com', password: 'password123', role: 'controller' as const }
  ]

  const results = []
  
  for (const user of demoUsers) {
    try {
      const result = await signUpWithEmail(user.email, user.password, user.role)
      results.push({ success: true, email: user.email, role: user.role })
      console.log(`✅ Created demo user: ${user.email} (${user.role})`)
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        results.push({ success: true, email: user.email, role: user.role, message: 'Already exists' })
        console.log(`ℹ️ Demo user already exists: ${user.email}`)
      } else {
        results.push({ success: false, email: user.email, error: error.message })
        console.error(`❌ Failed to create demo user: ${user.email}`, error)
      }
    }
  }
  
  return results
} 