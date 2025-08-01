'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Home, 
  User, 
  BookOpen, 
  Award, 
  Settings, 
  LogOut,
  Menu,
  X,
  QrCode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-toastify'

interface StudentNavigationProps {
  activeSection: string
  onSectionChange: (section: string) => void
  onLogout: () => void
  studentId: string
  studentName: string
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    description: 'Main dashboard and overview'
  },
  {
    id: 'about-me-lab',
    label: 'About Me Lab',
    icon: User,
    description: 'Personal profile and achievements'
  },
  {
    id: 'certificates',
    label: 'Certificates',
    icon: BookOpen,
    description: 'View and manage certificates'
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: Award,
    description: 'Track your achievements'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Account settings'
  }
]

export default function StudentNavigation({ 
  activeSection, 
  onSectionChange, 
  onLogout,
  studentId,
  studentName
}: StudentNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      onLogout()
      toast.success('Logged out successfully')
    }
  }

  const handleAboutMeLab = () => {
    router.push(`/about-me/${studentId}`)
  }

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                FG School
              </h1>
              <p className="text-xs text-gray-500">Student Portal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'about-me-lab') {
                        handleAboutMeLab()
                      } else {
                        onSectionChange(item.id)
                      }
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* User Info and Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{studentName}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="ghost"
              size="sm"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'about-me-lab') {
                      handleAboutMeLab()
                    } else {
                      onSectionChange(item.id)
                    }
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center gap-3 ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              )
            })}
            
            {/* Mobile User Info */}
            <div className="px-3 py-2 border-t mt-4">
              <p className="text-sm font-medium text-gray-900">{studentName}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
            
            {/* Mobile Logout */}
            <button
              onClick={() => {
                handleLogout()
                setIsMobileMenuOpen(false)
              }}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-3"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
} 