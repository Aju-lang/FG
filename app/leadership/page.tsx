'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  TrophyIcon,
  FireIcon,
  StarIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  SparklesIcon,
  CalendarIcon,
  QuestionMarkCircleIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import {
  FaAward,
  FaCrown,
  FaMedal,
  FaStar,
  FaRocket,
  FaGem,
  FaHeart,
  FaLightbulb,
  FaUsers,
  FaGraduationCap
} from 'react-icons/fa'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

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
import { getLeadershipData, getUserProfile, type LeadershipUser, type SchoolData, type UserActivity } from '@/lib/leadershipUtils'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

const REGIONS = ['All', 'North', 'South', 'East', 'West']

const BADGE_CONFIG = {
  'Rising Star': { icon: FaRocket, color: 'bg-blue-500', description: 'Top 10% weekly growth' },
  'Top Contributor': { icon: FaCrown, color: 'bg-yellow-500', description: 'Most helpful to peers' },
  'Hall of Fame': { icon: FaAward, color: 'bg-purple-500', description: 'Legendary achievement' },
  'Quick Learner': { icon: FaLightbulb, color: 'bg-green-500', description: 'Fast course completion' },
  'Team Player': { icon: FaUsers, color: 'bg-orange-500', description: 'Excellent collaboration' },
  'Perfect Attendance': { icon: FaGraduationCap, color: 'bg-red-500', description: '100% attendance rate' },
  'Problem Solver': { icon: FaStar, color: 'bg-indigo-500', description: 'Challenge champion' },
  'Mentor': { icon: FaHeart, color: 'bg-pink-500', description: 'Outstanding peer support' }
}

export default function LeadershipLab() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [leadershipData, setLeadershipData] = useState<LeadershipUser[]>([])
  const [schoolData, setSchoolData] = useState<SchoolData[]>([])
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null)
  const [selectedUser, setSelectedUser] = useState<LeadershipUser | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }
    loadLeadershipData()
  }, [isAuthenticated, user, router])

  const loadLeadershipData = async () => {
    try {
      setLoading(true)
      const [leadership, schools, activity] = await Promise.all([
        getLeadershipData(),
        // Mock school data for now
        Promise.resolve([
          { name: 'FG Scholars', totalPoints: 15420, region: 'North', color: '#3B82F6' },
          { name: 'Excellence Academy', totalPoints: 14850, region: 'South', color: '#10B981' },
          { name: 'Future Leaders', totalPoints: 13990, region: 'East', color: '#F59E0B' },
          { name: 'Innovation Hub', totalPoints: 13650, region: 'West', color: '#EF4444' }
        ]),
        user?.uid ? getUserProfile(user.uid) : Promise.resolve(null)
      ])
      
      setLeadershipData(leadership)
      setSchoolData(schools)
      setUserActivity(activity)
    } catch (error) {
      console.error('Error loading leadership data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredData = () => {
    let filtered = leadershipData

    if (activeTab !== 'all') {
      filtered = filtered.filter(user => {
        if (activeTab === 'hs') return user.category === 'HS'
        if (activeTab === 'up') return user.category === 'UP'
        if (activeTab === 'lp') return user.category === 'LP'
        return true
      })
    }

    if (selectedRegion !== 'All') {
      filtered = filtered.filter(user => user.region === selectedRegion)
    }

    return filtered.slice(0, 10)
  }

  const getUserRank = () => {
    if (!user?.uid) return null
    const userIndex = leadershipData.findIndex(u => u.uid === user.uid)
    return userIndex !== -1 ? userIndex + 1 : null
  }

  const isUserInTop3 = () => {
    const rank = getUserRank()
    return rank && rank <= 3
  }

  const getUserBadges = (userData: LeadershipUser) => {
    const badges = []
    
    if (userData.weeklyGrowth > 20) badges.push('Rising Star')
    if (userData.activities.help > 30) badges.push('Top Contributor')
    if (userData.totalPoints > 1000) badges.push('Hall of Fame')
    if (userData.activities.certs > 10) badges.push('Quick Learner')
    if (userData.activities.challenges > 15) badges.push('Problem Solver')
    if (userData.activities.attendance > 90) badges.push('Perfect Attendance')
    
    return badges
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

  if (!isAuthenticated || !user) {
    return null
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
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <TrophyIcon className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              🏆 Leadership Lab
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Celebrate excellence, inspire growth, and build tomorrow's leaders
            </p>
          </div>
        </div>
      </motion.header>

      {/* Top 3 Banner */}
      <AnimatePresence>
        {isUserInTop3() && (
          <motion.div
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -20 }}
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white py-4 px-4 mx-4 mt-4 rounded-2xl shadow-xl"
          >
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl font-bold flex items-center justify-center gap-2"
              >
                <SparklesIcon className="h-6 w-6" />
                🎉 Congratulations! You're Rank #{getUserRank()}! 🎉
                <SparklesIcon className="h-6 w-6" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Main Leaderboard */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrophyIcon className="h-6 w-6 text-yellow-600" />
                Top Performers Leaderboard
              </CardTitle>
              <CardDescription>
                Celebrating our most dedicated learners across all categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="all">All Students</TabsTrigger>
                  <TabsTrigger value="hs">High School</TabsTrigger>
                  <TabsTrigger value="up">Upper Primary</TabsTrigger>
                  <TabsTrigger value="lp">Lower Primary</TabsTrigger>
                </TabsList>

                {/* Region Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {REGIONS.map(region => (
                    <Button
                      key={region}
                      variant={selectedRegion === region ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRegion(region)}
                    >
                      {region}
                    </Button>
                  ))}
                </div>

                <TabsContent value={activeTab} className="mt-0">
                  <motion.div
                    variants={containerVariants}
                    className="space-y-4"
                  >
                    {getFilteredData().map((student, index) => (
                      <motion.div
                        key={student.uid}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedUser(student)
                          setIsProfileModalOpen(true)
                        }}
                        className="cursor-pointer"
                      >
                        <Card className="hover:shadow-lg transition-shadow duration-300">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              {/* Rank */}
                              <motion.div
                                className={cn(
                                  "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg",
                                  index === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" :
                                  index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-600" :
                                  index === 2 ? "bg-gradient-to-r from-orange-400 to-orange-600" :
                                  "bg-gradient-to-r from-blue-400 to-blue-600"
                                )}
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                              >
                                {index + 1}
                              </motion.div>

                              {/* Avatar */}
                              <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                                <AvatarImage src={student.avatar} />
                                <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                                  {student.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>

                              {/* User Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                    {student.name}
                                  </h3>
                                  {index < 3 && (
                                    <motion.div
                                      animate={{ rotate: [0, 10, -10, 0] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      {index === 0 ? <FaCrown className="text-yellow-500" /> :
                                       index === 1 ? <FaMedal className="text-gray-500" /> :
                                       <FaMedal className="text-orange-500" />}
                                    </motion.div>
                                  )}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                  {student.class} • {student.school} • {student.region}
                                </div>
                                
                                {/* Badges */}
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {getUserBadges(student).slice(0, 3).map(badge => {
                                    const config = BADGE_CONFIG[badge as keyof typeof BADGE_CONFIG]
                                    const Icon = config.icon
                                    return (
                                      <motion.div
                                        key={badge}
                                        whileHover={{ scale: 1.1 }}
                                        className={cn(
                                          "flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white",
                                          config.color
                                        )}
                                        title={config.description}
                                      >
                                        <Icon className="w-3 h-3" />
                                        {badge}
                                      </motion.div>
                                    )
                                  })}
                                </div>

                                {/* Growth Indicator */}
                                <div className="flex items-center gap-2 text-sm">
                                  <div className={cn(
                                    "flex items-center gap-1",
                                    student.weeklyGrowth > 0 ? "text-green-600" : "text-red-600"
                                  )}>
                                    <motion.div
                                      animate={{ y: student.weeklyGrowth > 0 ? [-2, 0, -2] : [2, 0, 2] }}
                                      transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                      {student.weeklyGrowth > 0 ? '↗️' : '↘️'}
                                    </motion.div>
                                    {student.weeklyGrowth > 0 ? '+' : ''}{student.weeklyGrowth}% this week
                                  </div>
                                </div>
                              </div>

                              {/* Points */}
                              <div className="text-right">
                                <motion.div
                                  className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.2 * index, type: "spring" }}
                                >
                                  {student.totalPoints.toLocaleString()}
                                </motion.div>
                                <div className="text-xs text-slate-500">total points</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.section>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* School Rankings */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  School Rankings
                </CardTitle>
                <CardDescription>Total points by institution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={schoolData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalPoints" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Regional Distribution */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserGroupIcon className="h-6 w-6 text-green-600" />
                  Regional Distribution
                </CardTitle>
                <CardDescription>Performance by region</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={schoolData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalPoints"
                    >
                      {schoolData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Growth Tracker */}
        {userActivity && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FireIcon className="h-6 w-6 text-orange-600" />
                  Your Growth Tracker
                </CardTitle>
                <CardDescription>Track your learning journey and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Progress Bars */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <AcademicCapIcon className="h-4 w-4" />
                          Certifications
                        </span>
                        <span className="text-sm text-slate-600">{userActivity.certs}/20</span>
                      </div>
                      <Progress value={(userActivity.certs / 20) * 100} className="h-3" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <HeartIcon className="h-4 w-4" />
                          Peer Help
                        </span>
                        <span className="text-sm text-slate-600">{userActivity.help}/50</span>
                      </div>
                      <Progress value={(userActivity.help / 50) * 100} className="h-3" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <QuestionMarkCircleIcon className="h-4 w-4" />
                          Challenges
                        </span>
                        <span className="text-sm text-slate-600">{userActivity.challenges}/25</span>
                      </div>
                      <Progress value={(userActivity.challenges / 25) * 100} className="h-3" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          Attendance
                        </span>
                        <span className="text-sm text-slate-600">{userActivity.attendance}%</span>
                      </div>
                      <Progress value={userActivity.attendance} className="h-3" />
                    </div>
                  </div>

                  {/* Weekly Growth Chart */}
                  <div>
                    <h4 className="text-sm font-medium mb-4">Weekly Point Growth</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={userActivity.weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="points" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Inspire Corner */}
        <motion.section variants={itemVariants}>
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StarIcon className="h-6 w-6 text-purple-600" />
                Inspire Corner
              </CardTitle>
              <CardDescription>Words of wisdom from our top performers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {getFilteredData().slice(0, 3).map((student, index) => (
                  <motion.div
                    key={student.uid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * index }}
                    className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl"
                  >
                    <Avatar className="w-16 h-16 mx-auto mb-4 border-4 border-white shadow-lg">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <blockquote className="text-sm italic text-slate-700 dark:text-slate-300 mb-2">
                      "Success is not final, failure is not fatal: it is the courage to continue that counts."
                    </blockquote>
                    <cite className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      — {student.name}, Rank #{index + 1}
                    </cite>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedUser && (
                <>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {selectedUser.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Detailed profile and achievements
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedUser.totalPoints}</div>
                  <div className="text-xs text-slate-600">Total Points</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedUser.activities.certs}</div>
                  <div className="text-xs text-slate-600">Certificates</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{selectedUser.activities.help}</div>
                  <div className="text-xs text-slate-600">Peer Help</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedUser.activities.challenges}</div>
                  <div className="text-xs text-slate-600">Challenges</div>
                </div>
              </div>

              {/* Badges */}
              <div>
                <h4 className="font-semibold mb-3">Achievements & Badges</h4>
                <div className="flex flex-wrap gap-2">
                  {getUserBadges(selectedUser).map(badge => {
                    const config = BADGE_CONFIG[badge as keyof typeof BADGE_CONFIG]
                    const Icon = config.icon
                    return (
                      <div
                        key={badge}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-full text-sm text-white",
                          config.color
                        )}
                        title={config.description}
                      >
                        <Icon className="w-4 h-4" />
                        {badge}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="font-semibold mb-3">Recent Activity</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <div className="flex items-center gap-2 text-sm p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <FaGem className="text-blue-500" />
                    Completed "Advanced React Patterns" certification
                    <span className="text-xs text-slate-500 ml-auto">2 days ago</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <FaHeart className="text-red-500" />
                    Helped 5 peers with their projects
                    <span className="text-xs text-slate-500 ml-auto">3 days ago</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <FaStar className="text-yellow-500" />
                    Solved "Algorithm Challenge #15"
                    <span className="text-xs text-slate-500 ml-auto">1 week ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  )
} 