'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ShieldCheckIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import { onAuthStateChanged } from 'firebase/auth'

// Internal imports
import { auth } from '@/lib/firebase'
import { signInWithEmail, signInWithGoogle, getUserProfile, getRedirectPath } from '@/lib/auth'
import { useAuthStore, useDarkMode } from '@/lib/store'
import { loginSchema, type LoginFormData } from '@/lib/validationSchemas'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  
  // Zustand store hooks
  const { setUser, setLoading, rememberedEmail, rememberedUserType, setRememberedCredentials, clearRememberedCredentials } = useAuthStore()
  const { darkMode, toggleDarkMode } = useDarkMode()

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'student',
      rememberMe: false
    }
  })

  const watchedRole = watch('role')
  const watchedRememberMe = watch('rememberMe')

  // Load remembered credentials on component mount
  useEffect(() => {
    if (rememberedEmail) {
      setValue('email', rememberedEmail)
      setValue('role', rememberedUserType)
      setValue('rememberMe', true)
    }
  }, [rememberedEmail, rememberedUserType, setValue])

  // Check if user is already authenticated
  useEffect(() => {
    if (!auth) return

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid)
          if (userProfile) {
            setUser(userProfile)
            const redirectPath = getRedirectPath(userProfile.role)
            router.push(redirectPath)
          }
        } catch (error) {
          console.error('Error checking user role:', error)
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, setUser, setLoading])

  // Form submission handler
  const onSubmit = async (data: LoginFormData) => {
    if (!auth) {
      toast.error('Authentication service not available')
      return
    }

    setLoading(true)

    try {
      const result = await signInWithEmail(data.email, data.password, data.role)

      // Handle remember me functionality
      if (data.rememberMe) {
        setRememberedCredentials(data.email, data.role)
      } else {
        clearRememberedCredentials()
      }

      // Update Zustand store
      setUser(result.profile)

      // Redirect based on role
      const redirectPath = getRedirectPath(result.profile.role)
      router.push(redirectPath)

    } catch (error: any) {
      console.error('Auth error:', error)
      // Error handling is done in the auth functions via toast
    } finally {
      setLoading(false)
    }
  }

  // Google login handler
  const handleGoogleLogin = async () => {
    if (!auth) {
      toast.error('Authentication service not available')
      return
    }

    setIsGoogleLoading(true)

    try {
      const result = await signInWithGoogle(watchedRole)
      setUser(result.profile)

      const redirectPath = getRedirectPath(result.profile.role)
      router.push(redirectPath)

    } catch (error: any) {
      console.error('Google login error:', error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500'
    } flex items-center justify-center p-4 relative overflow-hidden`}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute -top-40 -right-32 w-80 h-80 ${
            darkMode ? 'bg-blue-400' : 'bg-white'
          } rounded-full mix-blend-multiply filter blur-xl opacity-70`}
        />
        <motion.div 
          animate={{ 
            x: [0, -120, 0],
            y: [0, 100, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute -bottom-40 -left-32 w-80 h-80 ${
            darkMode ? 'bg-purple-400' : 'bg-yellow-300'
          } rounded-full mix-blend-multiply filter blur-xl opacity-70`}
        />
        <motion.div 
          animate={{ 
            x: [0, 80, 0],
            y: [0, -80, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute top-40 left-40 w-60 h-60 ${
            darkMode ? 'bg-pink-400' : 'bg-blue-300'
          } rounded-full mix-blend-multiply filter blur-xl opacity-70`}
        />
      </div>

      {/* Dark Mode Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
      >
        {darkMode ? '☀️' : '🌙'}
      </motion.button>

      {/* Login Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-300">
          
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <AcademicCapIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 font-inter">
              FG School
            </h1>
            <p className="text-white/80 font-roboto">
              Professional Learning Management System
            </p>
          </motion.div>

          {/* User Type Toggle */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex bg-white/10 rounded-2xl p-1 backdrop-blur-sm border border-white/20">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setValue('role', 'student')}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-300 ${
                  watchedRole === 'student'
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm transform scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserIcon className="h-5 w-5 mr-2" />
                Student
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setValue('role', 'controller')}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-300 ${
                  watchedRole === 'controller'
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm transform scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Administrator
              </motion.button>
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2 font-inter">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm font-roboto"
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-300 text-sm mt-2 font-roboto"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2 font-inter">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm font-roboto"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </motion.button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-300 text-sm mt-2 font-roboto"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Remember Me */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center"
            >
              <input
                {...register('rememberMe')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/10"
              />
              <label className="ml-3 block text-sm text-white/90 font-roboto">
                Remember my email and role
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 ${
                watchedRole === 'student'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'} focus:outline-none focus:ring-2 focus:ring-white/30 font-inter`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Signing in...
                </div>
              ) : (
                `Sign in as ${watchedRole === 'student' ? 'Student' : 'Administrator'}`
              )}
            </motion.button>
          </motion.form>

          {/* Google Login */}
          <motion.div
            variants={itemVariants}
            className="mt-6"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/70 font-roboto">Or continue with</span>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white font-medium transition-all duration-300 flex items-center justify-center space-x-3 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm font-inter"
            >
              {isGoogleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Demo Notice */}
          <motion.div
            variants={itemVariants}
            className="mt-6 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10"
          >
            <p className="text-white/80 text-xs text-center mb-2 font-inter font-semibold">
              🚀 Demo System Active
            </p>
            <p className="text-white/70 text-xs text-center font-roboto">
              Use any valid email and password to test the system, or sign in with Google for quick access.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
} 