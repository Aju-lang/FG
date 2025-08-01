'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-toastify'
import {
  User,
  GraduationCap, 
  MapPin,
  Mail,
  Phone,
  Calendar, 
  QrCode,
  LogOut,
  Home,
  Download,
  Edit3,
  Save,
  X,
  Trophy,
  Star,
  BookOpen,
  Users,
  Zap,
  Heart,
  Target,
  Clock,
  Award
} from 'lucide-react'
import { getPrimaryDataById, PrimaryDataStudent } from '@/lib/primaryDataStorage'
import { generateStudentLoginQR } from '@/lib/qrCodeUtils'
// Removed Firebase auth imports

export default function StudentAboutMePage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.studentId as string
  
  const [student, setStudent] = useState<PrimaryDataStudent | null>(null)
  const [authStudent, setAuthStudent] = useState<any>(null)
  const [qrCode, setQrCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    bio: '',
    mission: '',
    skills: [] as string[],
    phone: '',
    location: ''
  })

const SKILL_CATEGORIES = [
  { label: 'Programming', color: 'bg-blue-500', icon: '💻' },
  { label: 'Design', color: 'bg-purple-500', icon: '🎨' },
  { label: 'Leadership', color: 'bg-orange-500', icon: '👑' },
  { label: 'Communication', color: 'bg-green-500', icon: '💬' },
  { label: 'Mathematics', color: 'bg-red-500', icon: '🔢' },
  { label: 'Science', color: 'bg-cyan-500', icon: '🔬' },
  { label: 'Arts', color: 'bg-pink-500', icon: '🎭' },
  { label: 'Sports', color: 'bg-yellow-500', icon: '⚽' }
]

  useEffect(() => {
    loadStudentData()
  }, [studentId])

  const loadStudentData = async () => {
    setIsLoading(true)
    try {
      // Try to get from localStorage first (if logged in)
      const storedStudent = localStorage.getItem('currentStudent')
      if (storedStudent) {
        const parsedStudent = JSON.parse(storedStudent)
        
        // Check if it's from auth system or primary data
        if (parsedStudent.studentId === studentId || parsedStudent.id === studentId) {
          if (parsedStudent.uid) {
            // This is from auth system
            setAuthStudent(parsedStudent)
            generateQRCode(parsedStudent)
          } else {
            // This is from primary data
            setStudent(parsedStudent)
            generateQRCode(parsedStudent)
          }
          setIsLoading(false)
          return
        }
      }

      // Auth system removed - only use primary data

      // Try to fetch from primary data as fallback
      const studentData = await getPrimaryDataById(studentId)
      if (studentData) {
        setStudent(studentData)
        generateQRCode(studentData)
        
        // Store in localStorage for session
        localStorage.setItem('currentStudent', JSON.stringify(studentData))
      } else {
        toast.error('Student not found')
        router.push('/login')
      }
    } catch (error) {
      console.error('Error loading student:', error)
      toast.error('Error loading student data')
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const generateQRCode = async (studentData: PrimaryDataStudent | any) => {
    setIsGeneratingQR(true)
    try {
      // For auth students, we need to get password from primary data
      let password = 'password' in studentData ? studentData.password : ''
      
      if (!password && 'uid' in studentData) {
        // Try to get password from primary data
        const primaryData = await getPrimaryDataById(studentData.studentId)
        if (primaryData) {
          password = primaryData.password
        }
      }
      
      const qr = await generateStudentLoginQR(
        studentData.username,
        password,
        'uid' in studentData ? studentData.studentId : studentData.id,
        studentData.name,
        studentData.class,
        studentData.division
      )
      setQrCode(qr)
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Failed to generate QR code')
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentStudent')
    localStorage.removeItem('userProfile')
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const downloadQRCode = () => {
    if (!qrCode) return
    
    const link = document.createElement('a')
    link.download = `${student?.name}_login_qr.png`
    link.href = qrCode
    link.click()
  }

  const toggleSkill = (skill: any) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleSaveProfile = async () => {
    try {
      if (authStudent) {
        // Update auth student profile (local storage only)
        const updatedAuthStudent = {
          ...authStudent,
          bio: editForm.bio,
          mission: editForm.mission,
          skills: editForm.skills,
          phone: editForm.phone
        }
        setAuthStudent(updatedAuthStudent)
        localStorage.setItem('currentStudent', JSON.stringify(updatedAuthStudent))
        
      } else if (student) {
        // Update primary data student
        const updatedStudent = {
          ...student,
          bio: editForm.bio,
          mission: editForm.mission,
          skills: editForm.skills,
          phone: editForm.phone,
          location: editForm.location,
          updatedAt: new Date().toISOString()
        }
        
        // Store updated data in localStorage
        localStorage.setItem('currentStudent', JSON.stringify(updatedStudent))
        setStudent(updatedStudent)
      }
      
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error updating profile')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student profile...</p>
        </div>
      </div>
    )
  }

  if (!student && !authStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Student Not Found</h1>
          <p className="text-gray-600 mb-6">The requested student profile could not be found.</p>
            <Button onClick={() => router.push('/login')}>
            Return to Login
            </Button>
        </Card>
      </div>
    )
  }

  // Use the active student data
  const activeStudent = authStudent || student
  
  if (!activeStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Student Not Found</h1>
          <p className="text-gray-600 mb-6">The requested student profile could not be found.</p>
          <Button onClick={() => router.push('/login')}>
            Return to Login
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">About Me Lab</h1>
                <p className="text-sm text-gray-600">FG School Portal</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
            </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold">{activeStudent.name}</h2>
                <p className="text-blue-100">Student at FG School</p>
                    </div>
                    
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-5 h-5" />
                    <span className="font-semibold">Academic Details</span>
                  </div>
                  <p>Class: {activeStudent.class}-{activeStudent.division}</p>
                  {activeStudent.rollNumber && <p>Roll Number: {activeStudent.rollNumber}</p>}
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5" />
                    <span className="font-semibold">Parent/Guardian</span>
                  </div>
                  <p>{activeStudent.parentName}</p>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5" />
                    <span className="font-semibold">Location</span>
                  </div>
                  <p>{activeStudent.place}</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5" />
                    <span className="font-semibold">Contact</span>
                  </div>
                  <p className="text-sm break-all">{activeStudent.email}</p>
                  {activeStudent.phone && <p>{activeStudent.phone}</p>}
                    </div>
                  </div>
              </Card>

            {/* Personal Bio & Highlights */}
            <Card className="p-6 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Personal Bio & Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* About Me */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    About Me
                  </h4>
                  {editing ? (
                    <textarea
                      placeholder="Tell us about yourself..."
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg resize-none"
                      rows={4}
                    />
                  ) : (
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {activeStudent.bio || "No bio available yet. Click edit to add your story!"}
                  </p>
                  )}
                </div>

                {/* Skills & Interests */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Skills & Interests
                  </h4>
                  {editing ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {SKILL_CATEGORIES.map(skill => (
                        <Button
                          key={skill.label}
                          variant={editForm.skills.includes(skill.label) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSkill(skill.label)}
                          className="justify-start"
                        >
                          <span className="mr-2">{skill.icon}</span>
                          {skill.label}
                        </Button>
                      ))}
                    </div>
                  ) : (
                  <div className="flex flex-wrap gap-2">
                      {(activeStudent.skills || []).map(skill => {
                      const skillConfig = SKILL_CATEGORIES.find(s => s.label === skill)
                      return (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                          <span>{skillConfig?.icon || '🎯'}</span>
                          {skill}
                        </Badge>
                      )
                    })}
                      {(!activeStudent.skills || activeStudent.skills.length === 0) && (
                        <p className="text-slate-500 text-sm">No skills added yet. Click edit to add your skills!</p>
                      )}
                  </div>
                  )}
                </div>

                {/* Mission Statement */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    My Mission
                  </h4>
                  {editing ? (
                    <textarea
                      placeholder="What drives you? What are your goals?"
                      value={editForm.mission}
                      onChange={(e) => setEditForm(prev => ({ ...prev, mission: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg resize-none"
                      rows={3}
                    />
                  ) : (
                  <p className="text-slate-600 dark:text-slate-400 italic">
                      {activeStudent.mission || "No mission statement yet. Click edit to add your goals!"}
                    </p>
                  )}
                </div>

                {editing && (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)} className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Login Information Card */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Login Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Username</h4>
                  <p className="font-mono text-sm bg-white px-3 py-2 rounded border">
                    {activeStudent.username}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Password</h4>
                  <p className="font-mono text-sm bg-white px-3 py-2 rounded border">
                    {'password' in activeStudent ? activeStudent.password : '******'}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Use these credentials to login to the FG School Portal. 
                  You can also use the QR code below for quick login.
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code Card */}
            <Card className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5" />
                Quick Login QR Code
              </h3>
              
              {isGeneratingQR ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      </div>
              ) : qrCode ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <img 
                      src={qrCode} 
                      alt="Login QR Code" 
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <Button 
                    onClick={downloadQRCode}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download QR
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  <p>Failed to generate QR code</p>
                </div>
              )}
              
              <p className="text-sm text-gray-600 mt-4">
                Scan this QR code with your phone to login quickly to the FG School Portal.
              </p>
            </Card>

            {/* Status Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Account Status</h3>
                <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={'isActive' in activeStudent && activeStudent.isActive ? "default" : "secondary"}>
                    {'isActive' in activeStudent && activeStudent.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Sent</span>
                  <Badge variant={'emailSent' in activeStudent && activeStudent.emailSent ? "default" : "destructive"}>
                    {'emailSent' in activeStudent && activeStudent.emailSent ? "Yes" : "Pending"}
                  </Badge>
                        </div>
                
                {activeStudent.lastLogin && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Login</span>
                    <span className="text-sm">
                      {new Date(activeStudent.lastLogin).toLocaleDateString()}
                    </span>
                    </div>
                  )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Joined</span>
                  <span className="text-sm">
                    {new Date(activeStudent.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Edit Profile Button */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Actions</h3>
              <div className="space-y-3">
                <Button 
                  onClick={() => setEditing(!editing)}
                  variant={editing ? "destructive" : "default"}
                  className="w-full flex items-center gap-2"
                >
                  {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  {editing ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 