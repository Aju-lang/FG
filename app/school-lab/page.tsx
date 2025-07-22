'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  AcademicCapIcon,
  UserIcon,
  TrophyIcon,
  BookOpenIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon as CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
// import { getFirebaseServices } from '@/lib/firebase-client-only'

interface UserProfile {
  uid: string
  email: string
  name: string
  role: 'student' | 'controller'
  qrCode?: string
  studentId?: string
  grade?: string
  points?: number
  certificates?: string[]
  enrolledClasses?: string[]
}

export default function SchoolLabPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = () => {
    const savedProfile = localStorage.getItem('userProfile')
    if (!savedProfile) {
      toast.error('Please log in to access your student portal')
      router.push('/login')
      return
    }

    try {
      const profile = JSON.parse(savedProfile) as UserProfile
      if (profile.role !== 'student') {
        toast.error('Access denied. This page is for students only.')
        router.push('/login')
        return
      }
      setUserProfile(profile)
    } catch (error) {
      toast.error('Invalid session. Please log in again.')
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      // // Sign out from Firebase
      // const { auth } = await getFirebaseServices()
      // const { signOut } = await import('firebase/auth')
      // await signOut(auth)
      
      // Clear localStorage
      localStorage.removeItem('userProfile')
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error logging out')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your student portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">FG School Lab</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{userProfile?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile?.name}!
          </h1>
          <p className="text-gray-600">
            Student ID: {userProfile?.studentId} • Grade: {userProfile?.grade} • Points: {userProfile?.points || 0}
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Enrolled Classes</p>
                <p className="text-2xl font-bold text-gray-900">{userProfile?.enrolledClasses?.length || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrophyIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{userProfile?.certificates?.length || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">{userProfile?.points || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Grade Level</p>
                <p className="text-2xl font-bold text-gray-900">{userProfile?.grade || 'N/A'}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Classes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Classes</h2>
            <div className="space-y-4">
              {userProfile?.enrolledClasses?.length ? (
                userProfile.enrolledClasses.map((classId, index) => (
                  <div key={classId} className="flex items-center p-4 border border-gray-200 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpenIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-gray-900">Class {index + 1}</h3>
                      <p className="text-sm text-gray-600">ID: {classId}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No classes enrolled yet</p>
                  <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Browse Available Classes
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <BookOpenIcon className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-700">Browse Classes</span>
              </button>
              <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <TrophyIcon className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-gray-700">View Certificates</span>
              </button>
              <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <ChartBarIcon className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-gray-700">View Progress</span>
              </button>
              <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <CogIcon className="h-5 w-5 text-gray-600 mr-3" />
                <span className="text-gray-700">Settings</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-white p-6 rounded-lg shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="text-center py-8">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent activity</p>
              <p className="text-sm text-gray-500 mt-1">Your activity will appear here once you start participating in classes</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
} 