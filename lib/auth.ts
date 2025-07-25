'use client'

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { auth, db } from './firebase'

export interface UserProfile {
  uid: string
  email: string
  name: string
  role: 'student' | 'controller'
  createdAt: string
  lastLogin: string
}

// Optimized user profile creation - faster with minimal data
export const createUserProfile = async (user: User, role: 'student' | 'controller', additionalData?: any) => {
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    name: user.displayName || user.email?.split('@')[0] || '',
    role,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    ...additionalData
  }

  try {
    // Quick database write
    await setDoc(doc(db, 'users', user.uid), userProfile)
    
    // Fast local storage update
    localStorage.setItem('userProfile', JSON.stringify(userProfile))
    localStorage.setItem('currentUser', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: userProfile.name
    }))

    return userProfile
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

// Optimized user profile retrieval - faster caching
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    // Check local cache first for speed
    const cachedProfile = localStorage.getItem('userProfile')
    if (cachedProfile) {
      const profile = JSON.parse(cachedProfile)
      if (profile.uid === uid) {
        return profile
      }
    }

    // Quick database read if not cached
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      const profile = userDoc.data() as UserProfile
      // Cache for next time
      localStorage.setItem('userProfile', JSON.stringify(profile))
      return profile
    }
    
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Faster email sign-in with optimized error handling
export const signInWithEmail = async (email: string, password: string, role: 'student' | 'controller') => {
  try {
    // Quick authentication
    const result = await signInWithEmailAndPassword(auth, email, password)
    
    // Fast profile retrieval
    let userProfile = await getUserProfile(result.user.uid)
    
    if (!userProfile) {
      // Quick profile creation if not exists
      userProfile = await createUserProfile(result.user, role)
    } else {
      // Quick role verification
      if (userProfile.role !== role) {
        toast.error(`Please select the correct role. You are registered as a ${userProfile.role}.`)
        throw new Error('Role mismatch')
      }
      
      // Quick last login update
      userProfile.lastLogin = new Date().toISOString()
      localStorage.setItem('userProfile', JSON.stringify(userProfile))
    }

    // Quick success notification
    toast.success(`Welcome back, ${userProfile.name}!`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
    
    return { user: result.user, profile: userProfile }
  } catch (error: any) {
    // Quick error handling
    let errorMessage = 'Login failed. Please check your credentials.'
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email. Please check your email or create an account.'
        break
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.'
        break
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address format.'
        break
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.'
        break
      case 'auth/invalid-credential':
        errorMessage = 'Invalid credentials. Please check your email and password.'
        break
    }

    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
    
    throw error
  }
}

// Optimized Google sign-in
export const signInWithGoogle = async (role: 'student' | 'controller') => {
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    
    let userProfile = await getUserProfile(result.user.uid)
    
    if (!userProfile) {
      userProfile = await createUserProfile(result.user, role)
    }

    toast.success(`Welcome, ${userProfile.name}!`, {
      position: "top-right",
      autoClose: 2000,
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
        errorMessage = 'An account already exists with the same email address but different sign-in credentials.'
        break
    }

    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
    
    throw error
  }
}

// Fast user registration
export const registerWithEmail = async (email: string, password: string, name: string, role: 'student' | 'controller') => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    
    // Quick profile update
    await updateProfile(result.user, { displayName: name })
    
    // Quick profile creation
    const userProfile = await createUserProfile(result.user, role, { name })

    toast.success(`Account created successfully! Welcome, ${name}!`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
    
    return { user: result.user, profile: userProfile }
  } catch (error: any) {
    let errorMessage = 'Registration failed. Please try again.'
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists.'
        break
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address format.'
        break
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters long.'
        break
    }

    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
    
    throw error
  }
}

// Fast role-based redirection
export const getRedirectPath = (role: 'student' | 'controller'): string => {
  // Role-based redirection for the new routing system
  switch (role) {
    case 'student':
      return '/school-lab'        // Students go to School Lab
    case 'controller':
      return '/control-dashboard' // Admins go to Control Dashboard
    default:
      return '/login'             // Fallback to login
  }
}

// Quick demo user creation for testing
export const createDemoUsers = async () => {
  try {
    const demoUsers = [
      { email: 'student@test.com', password: 'password123', role: 'student' as const },
      { email: 'admin@test.com', password: 'password123', role: 'controller' as const }
    ]

    for (const demo of demoUsers) {
      try {
        await registerWithEmail(demo.email, demo.password, demo.email.split('@')[0], demo.role)
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`Demo user ${demo.email} already exists`)
        } else {
          throw error
        }
      }
    }

    toast.success('Demo accounts are ready!', {
      position: "top-right",
      autoClose: 2000,
    })
  } catch (error) {
    console.error('Error creating demo users:', error)
    toast.error('Failed to create demo accounts')
  }
}

// Fast sign out
export const signOutUser = async () => {
  try {
    await signOut(auth)
    
    // Quick cleanup
    localStorage.removeItem('userProfile')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('rememberedEmail')
    localStorage.removeItem('rememberedUserType')
    
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
} 