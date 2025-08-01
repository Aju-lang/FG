'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
// Removed Firebase auth import
import { toast } from 'react-toastify'

export default function ControlDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  // Instant authentication check - no loading
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }

    if (user.role !== 'controller') {
      toast.error('Access denied. Admin privileges required.')
      router.replace('/login')
      return
    }
  }, [isAuthenticated, user, router])

  const handleLogout = async () => {
    try {
      // Clear user from store
      const { clearUser } = useAuthStore.getState()
      clearUser()
      
      // Clear localStorage
      localStorage.removeItem('userProfile')
      localStorage.removeItem('currentStudent')
      localStorage.removeItem('rememberedEmail')
      localStorage.removeItem('rememberedUserType')
      localStorage.removeItem('primaryController')
      
      toast.success('Signed out successfully')
      router.replace('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error signing out')
    }
  }

  // Don't show anything if not authenticated
  if (!isAuthenticated || !user || user.role !== 'controller') {
    return null
  }

  return (
    <div className="min-h-screen bg-black font-sans">
      {/* Header */}
      <header className="bg-blue-900 border-b border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">
                FG School Control Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-blue-200">
                  {user?.name || user?.email} (Admin)
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome to Control Dashboard
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            You have successfully logged in as an administrator. 
            This is your centralized control panel for managing the FG School platform.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* System Status */}
          <div className="bg-blue-900 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">System Status</h3>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <p className="text-blue-200 text-sm">All systems operational</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-300">Database</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-300">Authentication</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-300">Storage</span>
                <span className="text-green-400">Available</span>
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-blue-900 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">User Management</h3>
            <p className="text-blue-200 text-sm mb-4">Manage students and administrators</p>
            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-300">
                View All Users
              </button>
              <button className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-300">
                Add New User
              </button>
            </div>
          </div>

          {/* School Lab Management */}
          <div className="bg-blue-900 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">School Lab</h3>
            <p className="text-blue-200 text-sm mb-4">Monitor and manage lab activities</p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/school-lab')}
                className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-300"
              >
                Visit School Lab
              </button>
              <button className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-300">
                Lab Settings
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-900 rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Administrator Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="py-4 px-6 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105">
              System Settings
            </button>
            <button className="py-4 px-6 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105">
              User Reports
            </button>
            <button className="py-4 px-6 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105">
              Security Logs
            </button>
            <button className="py-4 px-6 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105">
              Backup & Restore
            </button>
          </div>
        </div>

        {/* Admin Info */}
        <div className="mt-8 text-center">
          <div className="bg-blue-800 rounded-xl p-4 inline-block">
            <p className="text-blue-200 text-sm">
              Logged in as: <span className="text-white font-medium">{user?.email}</span>
            </p>
            <p className="text-blue-300 text-xs mt-1">
              Role: Administrator | Access Level: Full Control
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 