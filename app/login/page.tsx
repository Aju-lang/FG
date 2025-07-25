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
import { useAuthStore } from '@/lib/store'
import { loginSchema, type LoginFormData } from '@/lib/validationSchemas'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  
  // Zustand store hooks
  const { setUser } = useAuthStore()

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

  // Instant authentication check - no loading
  useEffect(() => {
    if (!auth) return

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
    try {
          const userProfile = await getUserProfile(user.uid)
      if (userProfile) {
            setUser(userProfile)
        const redirectPath = getRedirectPath(userProfile.role)
            router.replace(redirectPath)
      }
    } catch (error) {
      console.error('Error checking user role:', error)
    }
  }
    })

    return () => unsubscribe()
  }, [router, setUser])

  // Instant form submission - no loading states
  const onSubmit = async (data: LoginFormData) => {
    if (!auth) {
      toast.error('Authentication service not available')
      return
    }

    try {
      const result = await signInWithEmail(data.email, data.password, data.role)
      setUser(result.profile)
      const redirectPath = getRedirectPath(result.profile.role)
      router.replace(redirectPath)
    } catch (error: any) {
      console.error('Auth error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-blue-900 rounded-2xl shadow-xl p-6">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-blue-200">Sign in to your FG School account</p>
      </div>

          {/* Role Toggle */}
          <div className="mb-6">
            <div className="flex bg-blue-800 rounded-xl p-1">
                <button
                  type="button"
                onClick={() => setValue('role', 'student')}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-300 ${
                  watchedRole === 'student'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-200 hover:text-white hover:bg-blue-700'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                onClick={() => setValue('role', 'controller')}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-300 ${
                  watchedRole === 'controller'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-200 hover:text-white hover:bg-blue-700'
                  }`}
                >
                Admin
                </button>
              </div>
          </div>

            {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
              {/* Email Input */}
              <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                  <input
                {...register('email')}
                id="email"
                    type="email"
                    placeholder="Enter your email"
                className={`w-full px-4 py-3 bg-blue-800 border rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 ${
                  errors.email 
                    ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                    : 'border-blue-600 hover:border-blue-500'
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
              </div>

              {/* Password Input */}
              <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                  {...register('password')}
                  id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                  className={`w-full px-4 py-3 pr-20 bg-blue-800 border rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 ${
                    errors.password 
                      ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                      : 'border-blue-600 hover:border-blue-500'
                  }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-white transition-all duration-300"
                  >
                  <span className="text-sm font-medium">
                    {showPassword ? 'Hide' : 'Show'}
                  </span>
                  </button>
                </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                {...register('rememberMe')}
                id="remember"
                  type="checkbox"
                className="w-4 h-4 text-blue-500 bg-blue-800 border-blue-600 rounded focus:ring-blue-400 focus:ring-2"
                />
              <label htmlFor="remember" className="ml-3 text-sm text-blue-200 cursor-pointer">
                Remember me for 30 days
                </label>
              </div>

            {/* Submit Button - No loading states */}
            <button
                type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-blue-700 hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Sign In
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-8 p-4 bg-blue-800 rounded-xl border border-blue-700">
            <div className="text-center mb-4">
              <h3 className="text-white text-sm font-semibold">Test Credentials</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 bg-blue-700 rounded-lg">
                <span className="text-blue-200 font-medium">Student:</span>
                <div className="text-right">
                  <div className="text-white font-mono">student@test.com</div>
                  <div className="text-blue-300 font-mono">password123</div>
                  </div>
              </div>
              <div className="flex justify-between p-3 bg-blue-700 rounded-lg">
                <span className="text-blue-200 font-medium">Admin:</span>
                <div className="text-right">
                  <div className="text-white font-mono">admin@test.com</div>
                  <div className="text-blue-300 font-mono">password123</div>
                </div>
              </div>
              </div>
            </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-blue-300 text-sm">
              Powered by FG School Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 