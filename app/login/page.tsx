'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { signInWithEmail, signInWithGoogle, getUserProfile, getRedirectPath } from '@/lib/auth'

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
      const userProfile = await getUserProfile(uid)
      if (userProfile) {
        const redirectPath = getRedirectPath(userProfile.role)
        router.push(redirectPath)
      }
    } catch (error) {
      console.error('Error checking user role:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    if (!auth) {
      toast.error('Authentication not available')
      return
    }

    setIsLoading(true)

    try {
      const result = await signInWithEmail(email, password, userType)

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
        localStorage.setItem('rememberedUserType', userType)
      }

      // Redirect based on role
      const redirectPath = getRedirectPath(result.profile.role)
      router.push(redirectPath)

    } catch (error: any) {
      console.error('Auth error:', error)
      // Error handling is done in the auth functions
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!auth) {
      toast.error('Authentication not available')
      return
    }

    setIsLoading(true)

    try {
      const result = await signInWithGoogle(userType)
      
      // Redirect based on role
      const redirectPath = getRedirectPath(result.profile.role)
      router.push(redirectPath)

    } catch (error: any) {
      console.error('Google login error:', error)
      // Error handling is done in the auth function
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-400 flex items-center justify-center p-4">
      {/* Animated Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse-glow animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/10 glass-backdrop rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Logo and Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="mb-4">
              <span className="text-6xl">🏫</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              FG School
            </h1>
            <p className="text-white/80">
              Welcome back! Please sign in to continue.
            </p>
          </motion.div>

          {/* User Type Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex bg-white/10 rounded-2xl p-1 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setUserType('student')}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-300 ${
                  userType === 'student'
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserIcon className="h-5 w-5 mr-2" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setUserType('controller')}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-300 ${
                  userType === 'controller'
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Controller
              </button>
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm input-glow"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm input-glow"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
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
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-white/30 rounded bg-white/10"
              />
              <label className="ml-3 block text-sm text-white/90">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 ${
                userType === 'student'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
              } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'} focus:outline-none focus:ring-2 focus:ring-white/30`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Signing in...
                </div>
              ) : (
                `Sign in as ${userType === 'student' ? 'Student' : 'Controller'}`
              )}
            </motion.button>
          </motion.form>

          {/* Google Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/70">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="mt-4 w-full py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white font-medium transition-all duration-300 flex items-center justify-center space-x-3 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </motion.div>

          {/* Demo Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 p-4 bg-white/5 rounded-2xl backdrop-blur-sm"
          >
            <p className="text-white/80 text-xs text-center mb-2">
              <span className="font-semibold">Demo Instructions:</span>
            </p>
            <p className="text-white/70 text-xs text-center">
              Use any valid email and password to test the system, or sign in with Google for quick access.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
} 