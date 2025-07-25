'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import {
  User,
  Trophy,
  Clock,
  Edit3,
  Award,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Camera,
  Save,
  X,
  Eye,
  EyeOff,
  Star,
  BookOpen,
  Users,
  Zap,
  Heart,
  Target,
  Upload,
  Download
} from 'lucide-react'

// Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import BottomNavBar from '@/components/ui/BottomNavBar'

// Store and utilities
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'
import { 
  getUserProfile, 
  updateUserProfile, 
  getUserActivity, 
  getUserContributions,
  type UserProfile,
  type UserActivity,
  type UserContribution,
  type TimelineEvent
} from '@/lib/aboutMeUtils'

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

const TIMELINE_COLORS = {
  certificate: 'bg-blue-500',
  achievement: 'bg-yellow-500',
  event: 'bg-green-500',
  project: 'bg-purple-500',
  recognition: 'bg-red-500'
}

export default function AboutMeLab() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State management
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null)
  const [userContributions, setUserContributions] = useState<UserContribution[]>([])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    bio: '',
    mission: '',
    skills: [] as string[],
    phone: '',
    location: ''
  })

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }
    loadProfileData()
  }, [isAuthenticated, user, router])

  const loadProfileData = async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      
      const [profile, activity, contributions] = await Promise.all([
        getUserProfile(user.uid),
        getUserActivity(user.uid),
        getUserContributions(user.uid)
      ])
      
      setUserProfile(profile)
      setUserActivity(activity)
      setUserContributions(contributions)
      setTimelineEvents(activity?.timeline || [])
      setIsPrivate(profile?.isPrivate || false)
      
      // Initialize edit form
      if (profile) {
        setEditForm({
          bio: profile.bio || '',
          mission: profile.mission || '',
          skills: profile.skills || [],
          phone: profile.phone || '',
          location: profile.location || ''
        })
        setProfileImage(profile.profileImage || '')
      }
      
      // Generate QR Code
      const dashboardUrl = `${window.location.origin}/student-dashboard/${user.uid}`
      const qrUrl = await QRCode.toDataURL(dashboardUrl)
      setQrCodeUrl(qrUrl)
      
    } catch (error) {
      console.error('Error loading profile data:', error)
      toast.error('Error loading profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setProfileImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    if (!user?.uid) return
    
    try {
      const updatedProfile = {
        ...userProfile,
        ...editForm,
        profileImage,
        isPrivate,
        updatedAt: new Date().toISOString()
      }
      
      await updateUserProfile(user.uid, updatedProfile)
      setUserProfile(updatedProfile as UserProfile)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error updating profile')
    }
  }

  const toggleSkill = (skill: string) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  }

  if (!isAuthenticated || !user || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <User className="h-8 w-8 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                👤 About Me Lab
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Your personal profile and achievement hub
              </p>
            </div>
            
            {/* Privacy Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPrivate(!isPrivate)}
                className="flex items-center gap-2"
              >
                {isPrivate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {isPrivate ? 'Private' : 'Public'}
              </Button>
              
              <Button
                variant={editing ? "destructive" : "default"}
                size="sm"
                onClick={() => editing ? setEditing(false) : setEditing(true)}
                className="flex items-center gap-2"
              >
                {editing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                {editing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Profile Card Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Card
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Image */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-32 h-32 mx-auto border-4 border-white shadow-xl">
                      <AvatarImage src={profileImage || userProfile?.profileImage} />
                      <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {editing && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Basic Info */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {user?.name || 'Student Name'}
                  </h2>
                  <Badge variant="secondary" className="text-sm">
                    {userProfile?.role || 'Student'} • {userProfile?.grade || 'Grade 10'}
                  </Badge>
                  <div className="flex items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user?.email}
                    </div>
                  </div>
                  
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Phone number"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {userProfile?.phone && (
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <Phone className="h-4 w-4" />
                          {userProfile.phone}
                        </div>
                      )}
                      {userProfile?.location && (
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <MapPin className="h-4 w-4" />
                          {userProfile.location}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* QR Code */}
                {qrCodeUrl && (
                  <div className="text-center">
                    <h4 className="font-semibold mb-2 text-sm">My Dashboard QR</h4>
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={qrCodeUrl}
                      alt="Profile QR Code"
                      className="w-24 h-24 mx-auto border rounded-lg shadow-md"
                    />
                  </div>
                )}

                {editing && (
                  <Button onClick={handleSaveProfile} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{userActivity?.totalPoints || 0}</div>
                      <div className="text-xs text-slate-600">Total Points</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{userActivity?.certificates || 0}</div>
                      <div className="text-xs text-slate-600">Certificates</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Last Login
                      </span>
                      <span className="text-slate-600">{userActivity?.lastLogin || 'Today'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        Rewards Available
                      </span>
                      <span className="text-orange-600 font-medium">{userActivity?.rewardPoints || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
            {/* Personal Bio & Highlights */}
            <Card>
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
                      {userProfile?.bio || "No bio available yet. Click edit to add your story!"}
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
                      {(userProfile?.skills || []).map(skill => {
                        const skillConfig = SKILL_CATEGORIES.find(s => s.label === skill)
                        return (
                          <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                            <span>{skillConfig?.icon || '🎯'}</span>
                            {skill}
                          </Badge>
                        )
                      })}
                      {(!userProfile?.skills || userProfile.skills.length === 0) && (
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
                      {userProfile?.mission || "No mission statement yet. Click edit to add your goals!"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* My Contributions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  My Contributions
                </CardTitle>
                <CardDescription>
                  Events, projects, and achievements you've been part of
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="events" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="leadership">Leadership</TabsTrigger>
                    <TabsTrigger value="recognition">Recognition</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="events" className="mt-4">
                    <div className="space-y-3">
                      {userContributions.filter(c => c.type === 'event').map(contribution => (
                        <motion.div
                          key={contribution.id}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                        >
                          <Calendar className="h-5 w-5 text-blue-500" />
                          <div className="flex-1">
                            <h5 className="font-medium">{contribution.title}</h5>
                            <p className="text-sm text-slate-600">{contribution.description}</p>
                          </div>
                          <span className="text-xs text-slate-500">{contribution.date}</span>
                        </motion.div>
                      ))}
                      {userContributions.filter(c => c.type === 'event').length === 0 && (
                        <p className="text-center text-slate-500 py-8">No events attended yet</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="projects" className="mt-4">
                    <div className="space-y-3">
                      {userContributions.filter(c => c.type === 'project').map(contribution => (
                        <motion.div
                          key={contribution.id}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                        >
                          <BookOpen className="h-5 w-5 text-purple-500" />
                          <div className="flex-1">
                            <h5 className="font-medium">{contribution.title}</h5>
                            <p className="text-sm text-slate-600">{contribution.description}</p>
                          </div>
                          <span className="text-xs text-slate-500">{contribution.date}</span>
                        </motion.div>
                      ))}
                      {userContributions.filter(c => c.type === 'project').length === 0 && (
                        <p className="text-center text-slate-500 py-8">No projects submitted yet</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="leadership" className="mt-4">
                    <div className="space-y-3">
                      {userContributions.filter(c => c.type === 'leadership').map(contribution => (
                        <motion.div
                          key={contribution.id}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                        >
                          <Trophy className="h-5 w-5 text-yellow-500" />
                          <div className="flex-1">
                            <h5 className="font-medium">{contribution.title}</h5>
                            <p className="text-sm text-slate-600">{contribution.description}</p>
                          </div>
                          <span className="text-xs text-slate-500">{contribution.date}</span>
                        </motion.div>
                      ))}
                      {userContributions.filter(c => c.type === 'leadership').length === 0 && (
                        <p className="text-center text-slate-500 py-8">No leadership positions yet</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="recognition" className="mt-4">
                    <div className="space-y-3">
                      {userContributions.filter(c => c.type === 'recognition').map(contribution => (
                        <motion.div
                          key={contribution.id}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                        >
                          <Award className="h-5 w-5 text-red-500" />
                          <div className="flex-1">
                            <h5 className="font-medium">{contribution.title}</h5>
                            <p className="text-sm text-slate-600">{contribution.description}</p>
                          </div>
                          <span className="text-xs text-slate-500">{contribution.date}</span>
                        </motion.div>
                      ))}
                      {userContributions.filter(c => c.type === 'recognition').length === 0 && (
                        <p className="text-center text-slate-500 py-8">No recognitions yet</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Activity Timeline
                </CardTitle>
                <CardDescription>
                  Your learning journey and milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {timelineEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 relative"
                    >
                      {/* Timeline Line */}
                      {index < timelineEvents.length - 1 && (
                        <div className="absolute left-4 top-8 w-0.5 h-16 bg-slate-200 dark:bg-slate-700" />
                      )}
                      
                      {/* Event Icon */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm relative z-10",
                        TIMELINE_COLORS[event.type as keyof typeof TIMELINE_COLORS] || 'bg-slate-500'
                      )}>
                        {event.type === 'certificate' && '🎓'}
                        {event.type === 'achievement' && '🏆'}
                        {event.type === 'event' && '📅'}
                        {event.type === 'project' && '📚'}
                        {event.type === 'recognition' && '⭐'}
                      </div>
                      
                      {/* Event Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-slate-900 dark:text-white">{event.title}</h5>
                          <span className="text-xs text-slate-500">{event.date}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{event.description}</p>
                        {event.points && (
                          <Badge variant="secondary" className="mt-2">
                            +{event.points} points
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {timelineEvents.length === 0 && (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No activity timeline yet</p>
                      <p className="text-sm text-slate-400">Start earning certificates and participating in events!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  )
} 