'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StudentNavigation from '@/components/StudentNavigation'
import AboutMeLab from '@/components/AboutMeLab'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Home, 
  User, 
  BookOpen, 
  Award, 
  Settings,
  LogOut,
  Activity,
  TrendingUp,
  Star
} from 'lucide-react'
import { toast } from 'react-toastify'
import { getPrimaryDataById } from '@/lib/primaryDataStorage'

interface StudentDashboardProps {
  searchParams: { studentId?: string }
}

export default function StudentDashboard({ searchParams }: StudentDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [student, setStudent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setIsLoading(true)
        
        // Get student ID from URL params or localStorage
        const studentId = searchParams.studentId || localStorage.getItem('currentStudentId')
        
        if (!studentId) {
          toast.error('No student data found. Please login again.')
          router.push('/login')
          return
        }

        // Try to get student data from localStorage first
        const storedData = localStorage.getItem(`student_${studentId}`)
        if (storedData) {
          setStudent(JSON.parse(storedData))
        } else {
          // Fallback to database
          const dbData = await getPrimaryDataById(studentId)
          if (dbData) {
            setStudent(dbData)
            localStorage.setItem(`student_${studentId}`, JSON.stringify(dbData))
          } else {
            toast.error('Student data not found')
            router.push('/login')
            return
          }
        }
      } catch (error) {
        console.error('Error loading student data:', error)
        toast.error('Failed to load student data')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadStudentData()
  }, [searchParams.studentId, router])

  const handleLogout = () => {
    localStorage.removeItem('currentStudentId')
    localStorage.removeItem('currentStudentData')
    router.push('/login')
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h2>
          <p className="text-gray-600 mb-4">Please login again to access your dashboard.</p>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection student={student} />
      case 'about-me-lab':
        return <AboutMeLab studentId={student.id} isEditable={true} />
      case 'certificates':
        return <CertificatesSection student={student} />
      case 'achievements':
        return <AchievementsSection student={student} />
      case 'settings':
        return <SettingsSection student={student} />
      default:
        return <DashboardSection student={student} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavigation 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onLogout={handleLogout}
        studentId={student.id}
        studentName={student.name}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderSection()}
      </main>
    </div>
  )
}

// Dashboard Section Component
function DashboardSection({ student }: { student: any }) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {student.name}!</h1>
          <p className="text-gray-600">Here's your dashboard overview</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {student.class}-{student.division}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{student.totalPoints || 0}</p>
                <p className="text-sm text-gray-600">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{student.certificatesCompleted || 0}</p>
                <p className="text-sm text-gray-600">Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{student.eventsAttended || 0}</p>
                <p className="text-sm text-gray-600">Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{student.projectsSubmitted || 0}</p>
                <p className="text-sm text-gray-600">Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {student.timeline && student.timeline.length > 0 ? (
            <div className="space-y-4">
              {student.timeline.slice(0, 5).map((event: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    event.type === 'certificate' ? 'bg-blue-500' :
                    event.type === 'activity' ? 'bg-green-500' :
                    event.type === 'reward' ? 'bg-yellow-500' :
                    'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-500">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No recent activity</p>
              <p className="text-sm">Your activities will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Certificates Section Component
function CertificatesSection({ student }: { student: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Certificates</h2>
        <p className="text-gray-600">View and manage your certificates</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No certificates yet</p>
            <p className="text-sm">Your certificates will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Achievements Section Component
function AchievementsSection({ student }: { student: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
        <p className="text-gray-600">Track your achievements and progress</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No achievements yet</p>
            <p className="text-sm">Your achievements will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Settings Section Component
function SettingsSection({ student }: { student: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">Manage your account settings</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Name</Label>
            <p className="text-gray-600">{student.name}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <p className="text-gray-600">{student.email}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Class</Label>
            <p className="text-gray-600">{student.class}-{student.division}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Username</Label>
            <p className="text-gray-600">{student.username}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 