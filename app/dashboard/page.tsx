'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  AcademicCapIcon,
  UserGroupIcon,
  TrophyIcon,
  BookOpenIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon as CogIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
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

export default function DashboardPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalCertificates: 0,
    totalPoints: 0
  })

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = () => {
    const savedProfile = localStorage.getItem('userProfile')
    if (!savedProfile) {
      toast.error('Please log in to access the dashboard')
      router.push('/login')
      return
    }

    try {
      const profile = JSON.parse(savedProfile) as UserProfile
      if (profile.role !== 'controller') {
        toast.error('Access denied. This page is for administrators only.')
        router.push('/login')
        return
      }
      setUserProfile(profile)
      loadDashboardStats()
    } catch (error) {
      toast.error('Invalid session. Please log in again.')
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const loadDashboardStats = async () => {
    try {
      // Simulate loading dashboard statistics
      // In a real app, you'd fetch this from your Firebase services
      setStats({
        totalStudents: 500,
        totalClasses: 25,
        totalCertificates: 150,
        totalPoints: 12500
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
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
          <p className="text-gray-600">Loading admin dashboard...</p>
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
              <span className="text-xl font-bold text-gray-900">FG School Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-green-100 rounded-full">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-700">{userProfile?.name} (Admin)</span>
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
            Welcome to Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your school system, track student progress, and oversee all operations
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
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
                <BookOpenIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Classes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
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
                <TrophyIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Certificates Issued</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</p>
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
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Student Management */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Student Management</h2>
              <button className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <PlusIcon className="h-4 w-4" />
                <span>Add Student</span>
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">JS</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">John Smith</p>
                    <p className="text-sm text-gray-600">Grade 10 • 150 points</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 text-gray-400 hover:text-blue-600">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-green-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">MJ</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mary Johnson</p>
                    <p className="text-sm text-gray-600">Grade 11 • 220 points</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 text-gray-400 hover:text-blue-600">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-green-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button className="w-full text-center py-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Students
              </button>
            </div>
          </motion.div>

          {/* Class Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Class Management</h2>
              <button className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <PlusIcon className="h-4 w-4" />
                <span>Add Class</span>
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpenIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mathematics 101</p>
                    <p className="text-sm text-gray-600">25 students enrolled</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 text-gray-400 hover:text-blue-600">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-green-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpenIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Science Lab</p>
                    <p className="text-sm text-gray-600">18 students enrolled</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 text-gray-400 hover:text-blue-600">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-green-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button className="w-full text-center py-2 text-green-600 hover:text-green-700 text-sm font-medium">
                View All Classes
              </button>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <UserGroupIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-600">Add, edit, or remove users</p>
              </div>
            </button>
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BookOpenIcon className="h-6 w-6 text-green-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Course Management</p>
                <p className="text-sm text-gray-600">Create and manage courses</p>
              </div>
            </button>
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <TrophyIcon className="h-6 w-6 text-purple-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Certificates</p>
                <p className="text-sm text-gray-600">Issue and manage certificates</p>
              </div>
            </button>
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ChartBarIcon className="h-6 w-6 text-orange-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-600">View detailed reports</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-white p-6 rounded-lg shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">Database</p>
                <p className="text-sm text-gray-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">Firebase Auth</p>
                <p className="text-sm text-gray-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">API Services</p>
                <p className="text-sm text-gray-600">Operational</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
} 