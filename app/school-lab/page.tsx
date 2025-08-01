'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AcademicCapIcon,
  TrophyIcon,
  FireIcon,
  UserIcon,
  ClockIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  GiftIcon,
  CalendarIcon,
  StarIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { Switch } from '@headlessui/react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table'

// Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import BottomNavBar from '@/components/ui/BottomNavBar'

// Store and utilities
import { useAuthStore } from '@/lib/store'
// Removed Firebase auth import
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'

// Enhanced School Lab utilities
import {
  getUserBonusPoints,
  claimDailyBonus,
  getLeaderboardByCategory,
  getClassSchedule,
  getSchoolAchievements,
  getEnhancedTeamPoints,
  initializeEnhancedDemoData,
  getUserDailyRewards,
  claimDailyReward,
  getABMICourses,
  getSpecialEvents,
  getStaffMembers,
  toggleEventRSVP,
  type BonusPoints,
  type LeaderboardEntry,
  type ClassSchedule,
  type Achievement,
  type TeamPoints,
  type DailyReward,
  type ABMICourse,
  type SpecialEvent,
  type StaffMember
} from '@/lib/schoolLab'

export default function EnhancedSchoolLabPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  // State management
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bonusPoints, setBonusPoints] = useState<BonusPoints | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [classSchedule, setClassSchedule] = useState<ClassSchedule[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [teamPoints, setTeamPoints] = useState<TeamPoints[]>([])
  const [dailyRewards, setDailyRewards] = useState<DailyReward[]>([])
  const [abmiCourses, setAbmiCourses] = useState<ABMICourse[]>([])
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)

  // Popup states
  const [showDailyRewardPopup, setShowDailyRewardPopup] = useState(false)
  const [showLeaderboardPopup, setShowLeaderboardPopup] = useState(false)
  const [selectedLeaderboardCategory, setSelectedLeaderboardCategory] = useState<'Overall' | 'HS' | 'UP' | 'LP'>('Overall')
  const [showStaffBioPopup, setShowStaffBioPopup] = useState(false)
  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null)
  const [achievementSlideIndex, setAchievementSlideIndex] = useState(0)

  // Combined authentication check and data loading
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }

    // Start loading data immediately after auth check
    if (user?.uid) {
      loadEnhancedSchoolLabData()
    }
  }, [isAuthenticated, user, router])

  const loadEnhancedSchoolLabData = async () => {
    if (!user?.uid) return
    
    try {
      // Show loading only briefly
      setLoading(true)
      
      // Initialize enhanced demo data first (without await to not block UI)
      initializeEnhancedDemoData().catch(console.error)
      
      // Load critical data first (bonus points and leaderboard)
      const [bonusData, leaderboardData] = await Promise.all([
        getUserBonusPoints(user.uid),
        getLeaderboardByCategory('Overall', 3)
      ])
      
      setBonusPoints(bonusData)
      setLeaderboard(leaderboardData)
      setLoading(false) // Show UI with critical data first
      
      // Load remaining data in background
      const [
        scheduleData, 
        achievementsData, 
        teamsData,
        rewardsData,
        coursesData,
        eventsData,
        staffData
      ] = await Promise.all([
        getClassSchedule(),
        getSchoolAchievements(),
        getEnhancedTeamPoints(),
        getUserDailyRewards(user.uid),
        getABMICourses(user.uid),
        getSpecialEvents(),
        getStaffMembers()
      ])
      
      // Update UI with remaining data
      setClassSchedule(scheduleData)
      setAchievements(achievementsData)
      setTeamPoints(teamsData)
      setDailyRewards(rewardsData)
      setAbmiCourses(coursesData)
      setSpecialEvents(eventsData)
      setStaffMembers(staffData)
    } catch (error) {
      console.error('Error loading enhanced school lab data:', error)
      toast.error('Error loading data')
      setLoading(false)
    }
  }

  const handleClaimBonus = async () => {
    if (!user?.uid || !user?.email || !user?.name) return
    
    const success = await claimDailyBonus(user.uid, user.email, user.name)
    if (success) {
      // Reload bonus points after claiming
      const updatedBonus = await getUserBonusPoints(user.uid)
      setBonusPoints(updatedBonus)
      
      // Reload leaderboard to reflect changes
      const updatedLeaderboard = await getLeaderboardByCategory('Overall', 3)
      setLeaderboard(updatedLeaderboard)
      
      // Close the popup after claiming
      setTimeout(() => {
        setShowDailyRewardPopup(false)
      }, 2000) // Close after 2 seconds to show success
      
      // Show success toast
      toast.success('🎉 Daily bonus claimed successfully!')
    }
  }

  const handleClaimDailyReward = async (day: number) => {
    if (!user?.uid) return
    
    const success = await claimDailyReward(user.uid, day)
    if (success) {
      const updatedRewards = await getUserDailyRewards(user.uid)
      setDailyRewards(updatedRewards)
      
      const updatedBonus = await getUserBonusPoints(user.uid)
      setBonusPoints(updatedBonus)
      
      toast.success(`🎉 Day ${day} reward claimed!`)
    }
  }

  const handleLeaderboardCategoryChange = async (category: 'Overall' | 'HS' | 'UP' | 'LP') => {
    setSelectedLeaderboardCategory(category)
    const categoryLeaderboard = await getLeaderboardByCategory(category, 10)
    setLeaderboard(categoryLeaderboard)
  }

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

  const handleEventRSVP = async (eventId: string) => {
    if (!user?.uid) return
    
    const isRSVPed = await toggleEventRSVP(user.uid, eventId)
    const updatedEvents = specialEvents.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            isRSVPed,
            rsvpCount: isRSVPed ? event.rsvpCount + 1 : event.rsvpCount - 1
          }
        : event
    )
    setSpecialEvents(updatedEvents)
    
    toast.success(isRSVPed ? '✅ RSVP Confirmed!' : '❌ RSVP Cancelled')
  }

  // Table setup for class schedule
  const columnHelper = createColumnHelper<ClassSchedule>()
  const columns = [
    columnHelper.accessor('class', {
      header: 'Class',
      cell: (info) => (
        <div className="font-medium text-slate-900 dark:text-slate-100">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('time', {
      header: 'Time',
      cell: (info) => (
        <div className="flex items-center text-slate-600 dark:text-slate-400">
          <ClockIcon className="h-4 w-4 mr-2" />
          {info.getValue()}
      </div>
      ),
    }),
    columnHelper.accessor('subject', {
      header: 'Subject',
      cell: (info) => (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('mentor', {
      header: 'Mentor',
      cell: (info) => (
        <div className="flex items-center text-slate-700 dark:text-slate-300">
          <UserIcon className="h-4 w-4 mr-2" />
          {info.getValue()}
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: classSchedule,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className={cn("min-h-screen transition-colors duration-300", isDarkMode ? "dark bg-slate-900" : "bg-slate-50")}>
      {/* Enhanced Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="h-6 w-6 text-white" />
            </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">FG School Lab</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-6">
                <Button variant="ghost" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                  School Lab
                </Button>
                <Button variant="ghost" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Student Lab
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowLeaderboardPopup(true)}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Leadership Board
                </Button>
                <Button variant="ghost" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Certificates
                </Button>
              </nav>
              
              {/* Dark Mode Toggle */}
              <Switch
                checked={isDarkMode}
                onChange={setIsDarkMode}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  isDarkMode ? "bg-blue-600" : "bg-slate-200"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    isDarkMode ? "translate-x-6" : "translate-x-1"
                  )}
                />
                {isDarkMode ? (
                  <MoonIcon className="absolute right-1 h-3 w-3 text-white" />
                ) : (
                  <SunIcon className="absolute left-1 h-3 w-3 text-slate-600" />
                )}
              </Switch>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700"
            >
              <div className="px-4 py-6 space-y-4">
                <Button variant="ghost" className="w-full justify-start">School Lab</Button>
                <Button variant="ghost" className="w-full justify-start">Student Lab</Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowLeaderboardPopup(true)}
                  className="w-full justify-start"
                >
                  Leadership Board
                </Button>
                <Button variant="ghost" className="w-full justify-start">Certificates</Button>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Dark Mode</span>
                  <Switch checked={isDarkMode} onChange={setIsDarkMode} />
                </div>
                <Button onClick={handleLogout} variant="outline" className="w-full">
                  Logout
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-24">
        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Your comprehensive learning journey continues here. Explore, learn, and achieve greatness!
          </p>
        </motion.section>

        {/* Daily Bonus Button */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          {bonusPoints?.lastClaimedDate !== new Date().toDateString() && (
            <motion.button
              onClick={() => setShowDailyRewardPopup(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl flex items-center gap-3 text-lg"
            >
              <GiftIcon className="h-8 w-8" />
              🎁 Redeem Daily Bonus Points
            </motion.button>
          )}
        </motion.section>

        {/* ABMI Classes & Certificates */}
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              🎓 ABMI Skill Enhancement Classes
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Unlock professional certificates and enhance your skills with industry-recognized courses
            </p>
              </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {abmiCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className={cn(
                  "h-full transition-all duration-300",
                  course.isUnlocked ? "hover:shadow-lg" : "opacity-60"
                )}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={course.difficulty === 'Beginner' ? 'secondary' : course.difficulty === 'Intermediate' ? 'default' : 'destructive'}>
                        {course.difficulty}
                      </Badge>
                      {course.isUnlocked ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <LockClosedIcon className="h-5 w-5 text-slate-400" />
                      )}
              </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Instructor: {course.instructor}</span>
                        <span>{course.duration}</span>
            </div>
                      <div className="flex justify-between text-sm">
                        <span>Points Required:</span>
                        <span className="font-medium">{course.pointsRequired}</span>
                      </div>
                    </div>
                    
                    {course.certificate && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-2">Certificate Available:</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{course.certificate.name}</p>
                        <p className="text-xs text-slate-500">Requires {course.certificate.pointsRequired} points</p>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full" 
                      disabled={!course.isUnlocked}
                      variant={course.isUnlocked ? "default" : "secondary"}
                    >
                      {course.isUnlocked ? "Start Course" : `Unlock with ${course.pointsRequired} points`}
                    </Button>
                  </CardContent>
                </Card>
          </motion.div>
            ))}
          </div>
        </motion.section>

        {/* School Achievements with Slider */}
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          >
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              🏆 School Achievements & Competitions
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Celebrating our excellence in LSS, USS, TIP, Kalolsavam, and more
            </p>
              </div>
          
          <div className="relative">
            <div className="overflow-hidden rounded-xl">
              <motion.div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${achievementSlideIndex * 100}%)` }}
              >
                {achievements.map((achievement, index) => (
                  <div key={achievement.id} className="w-full flex-shrink-0">
                    <Card className="mx-2">
                      <CardContent className="p-0">
                        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-t-lg flex items-center justify-center">
                          <span className="text-6xl">{achievement.title.split(' ')[0]}</span>
              </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                            {achievement.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {achievement.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline">{achievement.category}</Badge>
                            <span className="text-sm text-slate-500">{achievement.date}</span>
            </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
          </motion.div>
            </div>
            
            {/* Slider Controls */}
            <Button
              variant="outline"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-slate-800/80"
              onClick={() => setAchievementSlideIndex(prev => prev > 0 ? prev - 1 : achievements.length - 1)}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-slate-800/80"
              onClick={() => setAchievementSlideIndex(prev => prev < achievements.length - 1 ? prev + 1 : 0)}
            >
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
            
            {/* Slide Indicators */}
            <div className="flex justify-center mt-4 space-x-2">
              {achievements.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === achievementSlideIndex ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                  )}
                  onClick={() => setAchievementSlideIndex(index)}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Special Programmes & Events */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              🎉 Special Programmes & Events
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Join our upcoming quizzes, celebrations, and special events
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialEvents.map((event, index) => (
          <motion.div
                key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-t-lg flex items-center justify-center">
                      <span className="text-4xl">
                        {event.type === 'Quiz' ? '🧠' : 
                         event.type === 'Celebration' ? '🎊' : 
                         event.type === 'Competition' ? '🏆' : '🔬'}
                      </span>
              </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {event.description}
                        </p>
              </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {event.date} at {event.time}
            </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <UserGroupIcon className="h-4 w-4 mr-2" />
                          {event.rsvpCount} registered
                          {event.maxParticipants && ` / ${event.maxParticipants} max`}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleEventRSVP(event.id)}
                        className={cn(
                          "w-full",
                          event.isRSVPed 
                            ? "bg-green-600 hover:bg-green-700" 
                            : "bg-blue-600 hover:bg-blue-700"
                        )}
                      >
                        {event.isRSVPed ? '✅ RSVP Confirmed' : '📝 RSVP Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
          </motion.div>
            ))}
          </div>
        </motion.section>

        {/* About School & Staff Bios */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              👨‍🏫 About School & Staff
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Meet our dedicated faculty and staff members
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {staffMembers.map((staff, index) => (
          <motion.div
                key={staff.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSelectedStaffMember(staff)
                  setShowStaffBioPopup(true)
                }}
                className="cursor-pointer"
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 text-center space-y-4">
                    <Avatar className="w-20 h-20 mx-auto">
                      <AvatarImage src={staff.image} />
                      <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                        {staff.name}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        {staff.role}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {staff.department}
                      </p>
                    </div>
                    
                    <div className="text-sm">
                      <p className="text-slate-600 dark:text-slate-400 mb-2">
                        {staff.experience}
                      </p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {staff.qualifications.slice(0, 2).map((qual, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {qual}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      View Full Bio
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Enhanced Team Competition */}
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          >
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              🏆 Live Team Leaderboard
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Real-time standings in arts, sports, and Kalolsavam competitions
            </p>
              </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {teamPoints.map((team, index) => (
              <motion.div
                key={team.teamName}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Team {team.teamName}</span>
                      <Badge className={cn(
                        "text-white",
                        team.color === 'red-500' && "bg-red-500",
                        team.color === 'green-500' && "bg-green-500",
                        team.color === 'yellow-500' && "bg-yellow-500"
                      )}>
                        {Math.round((team.points / team.maxPoints) * 100)}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">{team.points}</div>
                      <div className="text-sm text-slate-500">/ {team.maxPoints} points</div>
              </div>
                    
                    <Progress 
                      value={(team.points / team.maxPoints) * 100} 
                      className="h-4"
                    />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">🎨 Arts</span>
                        <span className="font-medium">{team.arts}</span>
            </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">⚽ Sports</span>
                        <span className="font-medium">{team.sports}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">🎭 Kalolsavam</span>
                        <span className="font-medium">{team.kalolsavam}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
          </motion.div>
            ))}
        </div>
        </motion.section>

        {/* Class Schedule Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>📚 ABMI Class Schedule</CardTitle>
              <CardDescription>Your weekly class timetable and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-200 dark:border-slate-700">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="font-semibold">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No schedule available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Mini Leadership Board Preview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrophyIcon className="h-6 w-6 text-yellow-600" />
                  <span>Leadership Board Preview</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowLeaderboardPopup(true)}
                >
                  View Full Board
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </Button>
              </CardTitle>
              <CardDescription>Top performers across all categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {leaderboard.slice(0, 3).map((leader, index) => (
          <motion.div
                  key={leader.uid}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
          >
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold",
                      index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-400"
                    )}>
                      {index + 1}
                    </div>
                    </div>
                  <Avatar>
                    <AvatarImage src={leader.avatar} />
                    <AvatarFallback>{leader.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{leader.name}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{leader.class} • {leader.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{leader.totalPoints}</div>
                    <div className="text-xs text-slate-500">points</div>
                </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.section>
      </main>

      {/* Game-Style Daily Reward Popup */}
      <AnimatePresence>
        {showDailyRewardPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowDailyRewardPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white/20 dark:bg-slate-900/30 backdrop-blur-xl rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated Header */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <GiftIcon className="h-10 w-10 text-white" />
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-white mb-2"
                >
                  🎉 Daily Bonus!
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-300"
                >
                  You've earned <span className="font-bold text-yellow-400">50 points</span> today!
                </motion.p>
              </div>

              {/* Weekly Progress Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mb-6"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">Weekly Progress</span>
                  <span className="text-yellow-400 font-bold">{bonusPoints?.weeklyPoints || 0}/1000</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((bonusPoints?.weeklyPoints || 0) / 1000) * 100, 100)}%` }}
                    transition={{ delay: 0.7, duration: 1.5, ease: "easeOut" }}
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
                  />
            </div>
          </motion.div>

              {/* Current Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center bg-blue-500/20 rounded-xl p-3"
                >
                  <div className="text-2xl font-bold text-blue-400">{bonusPoints?.totalPoints || 0}</div>
                  <div className="text-xs text-slate-400">Total Points</div>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center bg-purple-500/20 rounded-xl p-3"
                >
                  <div className="text-2xl font-bold text-purple-400">Level {bonusPoints?.level || 1}</div>
                  <div className="text-xs text-slate-400">Current Level</div>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
                  className="text-center bg-orange-500/20 rounded-xl p-3"
          >
                  <div className="text-2xl font-bold text-orange-400">{bonusPoints?.currentStreak || 1}</div>
                  <div className="text-xs text-slate-400">Day Streak</div>
                </motion.div>
              </div>

              {/* Action Buttons */}
            <div className="space-y-3">
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleClaimBonus()
                    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                      navigator.vibrate(100)
                    }
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
                >
                  ✅ Claim Bonus Points
                </motion.button>
                
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDailyRewardPopup(false)}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all"
                >
                  Close
                </motion.button>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Leadership Board Popup */}
      <AnimatePresence>
        {showLeaderboardPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowLeaderboardPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white/10 dark:bg-slate-900/20 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Animated Background */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <TrophyIcon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                      🏆 Leadership Board
                    </h2>
                  </motion.div>
                  <motion.button
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowLeaderboardPopup(false)}
                    className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </motion.button>
        </div>

                {/* Animated Category Tabs */}
        <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex space-x-2 mt-6"
                >
                  {(['Overall', 'HS', 'UP', 'LP'] as const).map((category, index) => (
                    <motion.button
                      key={category}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLeaderboardCategoryChange(category)}
                      className={cn(
                        "px-4 py-2 rounded-xl font-medium transition-all",
                        selectedLeaderboardCategory === category
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-white/10 text-slate-300 hover:bg-white/20"
                      )}
                    >
                      {category === 'Overall' ? 'Overall' : 
                       category === 'HS' ? 'High School' :
                       category === 'UP' ? 'Upper Primary' : 'Lower Primary'}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
              
              {/* Leaderboard Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <motion.div
                  key={selectedLeaderboardCategory}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="space-y-4"
                >
                  {leaderboard.map((leader, index) => (
                    <motion.div
                      key={leader.uid}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                    >
                      {/* Rank Badge */}
                      <div className="flex-shrink-0">
                        <motion.div 
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg",
                            index === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" : 
                            index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-600" : 
                            index === 2 ? "bg-gradient-to-r from-orange-400 to-orange-600" : "bg-gradient-to-r from-blue-400 to-blue-600"
                          )}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {index + 1}
                        </motion.div>
                      </div>
                      
                      {/* Avatar */}
                      <Avatar className="w-14 h-14 border-2 border-white/20">
                        <AvatarImage src={leader.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold">
                          {leader.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* User Info */}
                      <div className="flex-1">
                        <div className="font-bold text-white text-lg">{leader.name}</div>
                        <div className="text-sm text-slate-300">{leader.class} • {leader.category}</div>
                        {leader.bio && (
                          <div className="text-xs text-slate-400 mt-1 line-clamp-2">{leader.bio}</div>
                        )}
                        {leader.achievements && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {leader.achievements.slice(0, 3).map((achievement, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                                {achievement}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Points Display */}
                      <div className="text-right">
                        <motion.div 
                          className="font-bold text-yellow-400 text-xl"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 * index, type: "spring" }}
                        >
                          {leader.totalPoints}
                        </motion.div>
                        <div className="text-xs text-slate-400">total points</div>
                        {leader.redeemedPoints && (
                          <div className="text-xs text-green-400">{leader.redeemedPoints} redeemed</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff Bio Popup */}
      <AnimatePresence>
        {showStaffBioPopup && selectedStaffMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowStaffBioPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={selectedStaffMember.image} />
                  <AvatarFallback>{selectedStaffMember.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {selectedStaffMember.name}
                </h2>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">
                  {selectedStaffMember.role}
                </p>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {selectedStaffMember.department}
                </p>
              </div>
              
          <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Experience</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{selectedStaffMember.experience}</p>
            </div>
                
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Qualifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStaffMember.qualifications.map((qual, i) => (
                      <Badge key={i} variant="outline">{qual}</Badge>
                    ))}
          </div>
                </div>
                
                {selectedStaffMember.specializations && (
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStaffMember.specializations.map((spec, i) => (
                        <Badge key={i} variant="secondary">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">About</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{selectedStaffMember.bio}</p>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowStaffBioPopup(false)}
                className="w-full mt-6"
              >
                Close
              </Button>
        </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-slate-800 dark:bg-slate-900 border-t border-slate-700 mt-16 pb-20"
      >
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <AcademicCapIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">FG School</span>
              </div>
              <p className="text-slate-400 mb-4">
                Empowering students with innovative learning experiences, comprehensive skill development, and cutting-edge technology for a brighter future.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  About Us
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  Contact
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  Privacy
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white">
                  Student Portal
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white">
                  ABMI Courses
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white">
                  Certificates
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white">
                  Events
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white">
                  Help Center
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white">
                  Technical Support
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white">
                  Community
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white">
                  Staff Directory
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-700 text-center">
            <p className="text-slate-400 text-sm">
              © 2024 FG School. All rights reserved. Built with ❤️ for educational excellence.
            </p>
          </div>
        </div>
      </motion.footer>

      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </div>
  )
} 