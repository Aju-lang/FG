'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  AcademicCapIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export default function LoginPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'student' | 'controller'>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, redirect to appropriate page
          checkUserRoleAndRedirect(user.uid)
        }
      })
      return () => unsubscribe()
    }
  }, [])

  const checkUserRoleAndRedirect = async (uid: string) => {
    try {
      if (db) {
        const userDoc = await getDoc(doc(db, 'users', uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData.role === 'student') {
            router.push('/school-lab')
          } else {
            router.push('/dashboard')
          }
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error)
    }
  }

  const createUserProfile = async (user: any, role: string) => {
    try {
      if (db) {
        const userProfile = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          role: role,
          createdAt: new Date(),
          lastLogin: new Date()
        }

        await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true })
        
        // Save to localStorage for app state
        localStorage.setItem('userProfile', JSON.stringify(userProfile))
        
        return userProfile
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    if (!auth) {
      toast.error('Firebase not initialized')
      return
    }

    setIsLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await createUserProfile(user, userType)

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
        localStorage.setItem('rememberedUserType', userType)
      }

      toast.success(`Welcome back!`)

      // Redirect based on role
      if (userType === 'student') {
        router.push('/school-lab')
      } else {
        router.push('/dashboard')
      }

    } catch (error: any) {
      console.error('Login error:', error)
      
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email')
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password')
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address')
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Please try again later.')
      } else {
        toast.error('Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!auth) {
      toast.error('Firebase not initialized')
      return
    }

    setIsLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      await createUserProfile(user, userType)

      toast.success(`Welcome, ${user.displayName}!`)

      // Redirect based on role
      if (userType === 'student') {
        router.push('/school-lab')
      } else {
        router.push('/dashboard')
      }

    } catch (error: any) {
      console.error('Google login error:', error)
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelled')
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blocked. Please allow popups and try again.')
      } else {
        toast.error('Google login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                  <AcademicCapIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                FG SCHOOL
              </h1>
              <p className="text-blue-100 text-sm">
                Excellence in Education, Innovation in Learning
              </p>
            </motion.div>

            {/* User Type Toggle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <div className="flex bg-white/10 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setUserType('student')}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all duration-200 ${
                    userType === 'student'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-blue-100 hover:text-white'
                  }`}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('controller')}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all duration-200 ${
                    userType === 'controller'
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'text-blue-100 hover:text-white'
                  }`}
                >
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  Controller
                </button>
              </div>
            </motion.div>

            {/* Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-blue-100">
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                  userType === 'student'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  `Sign in as ${userType === 'student' ? 'Student' : 'Controller'}`
                )}
              </motion.button>
            </form>

            {/* Google Login */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Test Instructions */}
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <p className="text-blue-100 text-xs mb-2">Demo Instructions:</p>
              <p className="text-blue-200 text-xs">Use any valid email/password combination to test the authentication system.</p>
              <p className="text-blue-200 text-xs">Or click "Continue with Google" for OAuth login.</p>
            </div>

            {/* Navigation */}
            <div className="mt-6 text-center">
              <a href="/" className="text-blue-300 hover:text-white underline text-sm">
                Back to Home
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 