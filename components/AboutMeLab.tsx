'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Award,
  BarChart3,
  Certificate,
  Crown
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { authAPI, removeToken } from '@/lib/api'
import { Student } from '@/lib/api'

export default function AboutMeLab() {
  const router = useRouter()
  const { user, setUser, clearUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    bio: '',
    mission: '',
    skills: [] as string[],
    interests: [] as string[],
    academicGoals: [] as string[],
    favoriteSubjects: [] as string[],
    phone: '',
    place: ''
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
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      const response = await authAPI.getProfile()
      setUser(response.user)
      setEditForm({
        bio: response.user.bio || '',
        mission: response.user.mission || '',
        skills: response.user.skills || [],
        interests: response.user.interests || [],
        academicGoals: response.user.academicGoals || [],
        favoriteSubjects: response.user.favoriteSubjects || [],
        phone: response.user.phone || '',
        place: response.user.place || ''
      })
    } catch (error: any) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    removeToken()
    clearUser()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const downloadQRCode = () => {
    if (!user?.qrCodeImage) {
      toast.error('QR code not available')
      return
    }

    const link = document.createElement('a')
    link.href = user.qrCodeImage
    link.download = `${user.name}-qr-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code downloaded!')
  }

  const toggleSkill = (skill: string) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleSaveProfile = async () => {
    try {
      const response = await authAPI.updateProfile({
        bio: editForm.bio,
        mission: editForm.mission,
        skills: editForm.skills,
        interests: editForm.interests,
        academicGoals: editForm.academicGoals,
        favoriteSubjects: editForm.favoriteSubjects,
        phone: editForm.phone,
        place: editForm.place
      })
      
      setUser(response.user)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Not Logged In</h1>
          <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
          <Button onClick={() => router.push('/login')}>
            Go to Login
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
                <h1 className="text-xl font-semibold text-gray-900">About Me Lab</h1>
                <p className="text-sm text-gray-600">Your personal profile and achievements</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push('/school-lab')}>
                <Home className="w-4 h-4 mr-2" />
                Back to Lab
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {user.name}
                    </CardTitle>
                    <CardDescription>
                      {user.class} • {user.division} • {user.role}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} variant="outline">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button onClick={handleSaveProfile}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={() => setIsEditing(false)} variant="outline">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{user.place}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Parent: {user.parentName}</span>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    About Me
                  </h4>
                  {isEditing ? (
                    <textarea
                      placeholder="Tell us about yourself..."
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-700">{user.bio || "No bio yet. Click edit to add your story!"}</p>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Skills
                  </h4>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {SKILL_CATEGORIES.map((category) => (
                          <button
                            key={category.label}
                            onClick={() => toggleSkill(category.label)}
                            className={`p-2 rounded-lg border-2 transition-all ${
                              editForm.skills.includes(category.label)
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-lg mb-1">{category.icon}</div>
                              <div className="text-xs font-medium">{category.label}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(user.skills || []).map(skill => {
                        const skillConfig = SKILL_CATEGORIES.find(s => s.label === skill)
                        return (
                          <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                            <span>{skillConfig?.icon || '🎯'}</span>
                            {skill}
                          </Badge>
                        )
                      })}
                      {(!user.skills || user.skills.length === 0) && (
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
                  {isEditing ? (
                    <textarea
                      placeholder="What drives you? What are your goals?"
                      value={editForm.mission}
                      onChange={(e) => setEditForm(prev => ({ ...prev, mission: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400 italic">
                      {user.mission || "No mission statement yet. Click edit to add your goals!"}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Login Information Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Login Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Username</h4>
                  <p className="font-mono text-sm bg-white px-3 py-2 rounded border">
                    {user.username}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Password</h4>
                  <p className="font-mono text-sm bg-white px-3 py-2 rounded border">
                    ******
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Use these credentials to login to the FG School Portal. 
                  You can also use the QR code for quick login.
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
              
              {user.qrCodeImage ? (
                <div className="space-y-4">
                  <img 
                    src={user.qrCodeImage} 
                    alt="QR Code" 
                    className="w-48 h-48 mx-auto border rounded-lg"
                  />
                  <Button onClick={downloadQRCode} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">QR code not available</p>
                </div>
              )}
            </Card>

            {/* Stats Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Your Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Points</span>
                  <span className="font-semibold">{user.totalPoints || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Certificates</span>
                  <span className="font-semibold">{user.certificates || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reward Points</span>
                  <span className="font-semibold">{user.rewardPoints || 0}</span>
                </div>
              </div>
            </Card>

            {/* Achievements Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Achievements
              </h3>
              {user.achievements && user.achievements.length > 0 ? (
                <div className="space-y-3">
                  {user.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No achievements yet</p>
                  <p className="text-xs text-gray-400">Keep learning to earn achievements!</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 