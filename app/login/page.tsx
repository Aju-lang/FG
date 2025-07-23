'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { onAuthStateChanged } from 'firebase/auth'

// Internal imports
import { auth } from '@/lib/firebase'
import { signInWithEmail, getUserProfile, getRedirectPath } from '@/lib/auth'
import { useAuthStore, useDarkMode } from '@/lib/store'
import { loginSchema, type LoginFormData } from '@/lib/validationSchemas'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  
  // Zustand store hooks
  const { setUser, setLoading } = useAuthStore()
  const { darkMode, toggleDarkMode } = useDarkMode()

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
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
      setUser(result.profile)

      const redirectPath = getRedirectPath(result.profile.role)
      router.push(redirectPath)

    } catch (error: any) {
      console.error('Auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800' 
        : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700'
    }`}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl animate-pulse ${
          darkMode ? 'bg-blue-500' : 'bg-white'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl animate-pulse delay-700 ${
          darkMode ? 'bg-purple-500' : 'bg-white'
        }`}></div>
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* Main Login Card */}
      <div className="relative w-full max-w-md">
        {/* Card Background with Glassmorphism */}
        <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">🏫</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/70 text-sm">Sign in to your FG School account</p>
          </div>

          {/* Role Toggle */}
          <div className="mb-6">
            <div className="flex p-1 bg-black/20 rounded-2xl backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setValue('role', 'student')}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-300 ${
                  watchedRole === 'student'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                👨‍🎓 Student
              </button>
              <button
                type="button"
                onClick={() => setValue('role', 'controller')}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-300 ${
                  watchedRole === 'controller'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                👨‍💼 Admin
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white/90">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-white/60 text-lg">📧</span>
                </div>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full pl-12 pr-4 py-4 bg-white/10 border backdrop-blur-sm rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 ${
                    errors.email 
                      ? 'border-red-400 focus:ring-red-400' 
                      : 'border-white/20 hover:border-white/30'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-white/90">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-white/60 text-lg">🔒</span>
                </div>
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-4 bg-white/10 border backdrop-blur-sm rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 ${
                    errors.password 
                      ? 'border-red-400 focus:ring-red-400' 
                      : 'border-white/20 hover:border-white/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition-colors duration-200"
                >
                  <span className="text-lg">{showPassword ? '🙈' : '👁️'}</span>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                {...register('rememberMe')}
                id="remember"
                type="checkbox"
                className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 rounded focus:ring-blue-400 focus:ring-2 backdrop-blur-sm"
              />
              <label htmlFor="remember" className="ml-3 text-sm text-white/90 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg ${
                isSubmitting
                  ? 'bg-gray-500 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>Sign In</span>
                  <span className="text-lg">🚀</span>
                </span>
              )}
            </button>
          </form>

          {/* Error Display */}
          {(errors.email || errors.password) && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <span className="text-red-400 text-lg">⚠️</span>
                <span className="text-red-300 text-sm font-medium">Please check your credentials and try again</span>
              </div>
            </div>
          )}

          {/* Test Credentials */}
          <div className="mt-8 p-6 bg-black/20 border border-white/10 rounded-xl backdrop-blur-sm">
            <div className="text-center mb-4">
              <span className="text-white/90 text-sm font-semibold flex items-center justify-center gap-2">
                🧪 Test Credentials
              </span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/70 font-medium">Student Account:</span>
                <div className="text-right">
                  <div className="text-white font-mono">student@test.com</div>
                  <div className="text-white/60 font-mono">password123</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/70 font-medium">Admin Account:</span>
                <div className="text-right">
                  <div className="text-white font-mono">admin@test.com</div>
                  <div className="text-white/60 font-mono">password123</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/50 text-xs">
              Powered by FG School Platform
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -z-10 top-4 left-4 w-full h-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
        <div className="absolute -z-20 top-8 left-8 w-full h-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl"></div>
      </div>
    </div>
  )
} 