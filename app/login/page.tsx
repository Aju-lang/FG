'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { useAuthStore } from '@/lib/store'
import { authAPI, saveToken } from '@/lib/api'
import { loginSchema, validateLoginInput, type LoginFormData } from '@/lib/validationSchemas'
import QRScanner from '@/components/QRScanner'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setLoading } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isClient, setIsClient] = useState(false)

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
  const watchedEmail = watch('email')

  // Handle hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Auto-detect if input is email or username
  const isEmailFormat = (input: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(input)
  }

  const getInputType = () => {
    if (watchedRole === 'primary') return 'text'
    return isEmailFormat(watchedEmail) ? 'email' : 'text'
  }

  const getInputLabel = () => {
    if (watchedRole === 'primary') return 'Controller ID'
    return 'Username'
  }

  const getInputPlaceholder = () => {
    if (watchedRole === 'primary') return 'Enter your controller ID'
    return 'Enter your username'
  }

  // Reset loginType when role changes to primary
  useEffect(() => {
    if (watchedRole === 'primary') {
      setValue('email', '') // Clear email/username when primary role is selected
    }
  }, [watchedRole, setValue])

  // Form submission handler
  const onSubmit = async (data: LoginFormData) => {
    if (isLoading) return
    
    setIsLoading(true)
    setError('')

    try {
      // Login with API (both student and primary controller)
      const response = await authAPI.login(data.email, data.password, data.role)
      
      // Save token and user data
      saveToken(response.token)
      setUser(response.user)
      
      // Store in localStorage if remember me is checked
      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email)
        localStorage.setItem('rememberedUserType', data.role)
      }
      
      toast.success(`🎉 Welcome back, ${response.user.name}!`)
      
      // Redirect based on role
      if (data.role === 'primary') {
        router.replace('/primary-controller')
      } else {
        router.replace('/school-lab')
      }
    } catch (error: any) {
      setError(error.message || 'Login failed')
      toast.error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  // QR Code login handler
  const handleQRCodeLogin = async (qrData: string) => {
    try {
      // Parse QR data
      const qrInfo = JSON.parse(qrData)
      
      if (qrInfo.type !== 'login') {
        throw new Error('Invalid QR code type')
      }
      
      // Extract QR token and role from QR data
      const qrToken = qrInfo.qrToken || qrInfo.token
      const role = qrInfo.role || 'student'
      
      if (!qrToken) {
        throw new Error('Invalid QR code - no token found')
      }
      
      // Login with QR token
      const response = await authAPI.loginQR(qrToken, role)
      
      // Save token and user data
      saveToken(response.token)
      setUser(response.user)
      
      toast.success(`🎉 QR Login successful! Welcome, ${response.user.name}!`)
      
      // Redirect based on role
      if (role === 'primary') {
        router.replace('/primary-controller')
      } else {
        router.replace('/school-lab')
      }
    } catch (error: any) {
      console.error('QR login error:', error)
      toast.error(error.message || 'QR login failed')
    }
  }

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 104 0 2 2 0 00-4 0z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FG School Portal</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 104 0 2 2 0 00-4 0z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FG School Portal</h1>
          <p className="text-gray-600">Welcome back! Please sign in to your account.</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('role', 'student')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  watchedRole === 'student'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                suppressHydrationWarning
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">👨‍🎓</div>
                  <div className="font-medium">Student</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setValue('role', 'primary')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  watchedRole === 'primary'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                suppressHydrationWarning
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🎛️</div>
                  <div className="font-medium">P.C.</div>
                </div>
              </button>
            </div>
            
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getInputLabel()}
              </label>
              <input
                {...register('email')}
                type={getInputType()}
                placeholder={getInputPlaceholder()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                suppressHydrationWarning
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  suppressHydrationWarning
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                {...register('rememberMe')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                suppressHydrationWarning
              />
              <label className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              suppressHydrationWarning
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* QR Code Scanner */}
          <div className="mt-6">
            <QRScanner 
              trigger={
                <button
                  type="button"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all"
                  suppressHydrationWarning
                >
                  📱 Scan QR Code to Login
                </button>
              }
              onSuccess={handleQRCodeLogin}
            />
          </div>

          {/* Information Notice */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-lg">ℹ️</div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Login Information</h4>
                <p className="text-sm text-blue-700">
                  Only students registered by the Primary Controller can login. 
                  If you don't have credentials, please contact your school administrator.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 FG School. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
} 