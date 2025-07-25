'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MdBadge, 
  MdTrendingUp, 
  MdVerified, 
  MdSchool,
  MdFilterList,
  MdViewModule,
  MdViewList,
  MdClose
} from 'react-icons/md'
import { useAuthStore } from '@/lib/store'
import BottomNavBar from '@/components/ui/BottomNavBar'
import CertificateCard from '@/components/ui/CertificateCard'
import CertificateFilters, { FilterState } from '@/components/ui/CertificateFilters'
import MyCertificates from '@/components/ui/MyCertificates'
import UploadCertificate from '@/components/ui/UploadCertificate'
import { 
  certificateCourses, 
  CertificateCourse, 
  UserCertificate 
} from '@/lib/certificatesData'
import { 
  getUserCertificates, 
  initializeDemoCertificates,
  isCourseCompleted,
  getUserCertificationLevel,
  calculateTotalPoints
} from '@/lib/certificateUtils'

export default function CertificateLabPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState<'browse' | 'my-certificates'>('browse')
  const [userCertificates, setUserCertificates] = useState<UserCertificate[]>([])
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(true)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  
  const [filters, setFilters] = useState<FilterState>({
    providers: [],
    skills: [],
    difficulty: [],
    duration: [],
    status: 'all',
    sortBy: 'trending',
    sortOrder: 'desc'
  })

  // Filter and sort courses
  const filteredCourses = certificateCourses
    .filter(course => {
      // Provider filter
      if (filters.providers.length > 0 && !filters.providers.includes(course.provider)) {
        return false
      }
      
      // Skills filter
      if (filters.skills.length > 0 && !filters.skills.some(skill => course.skills.includes(skill))) {
        return false
      }
      
      // Difficulty filter
      if (filters.difficulty.length > 0 && !filters.difficulty.includes(course.difficulty)) {
        return false
      }
      
      // Duration filter
      if (filters.duration.length > 0) {
        const matchesDuration = filters.duration.some(duration => {
          switch (duration) {
            case 'short': return course.durationWeeks < 4
            case 'medium': return course.durationWeeks >= 4 && course.durationWeeks <= 8
            case 'long': return course.durationWeeks > 8
            default: return true
          }
        })
        if (!matchesDuration) return false
      }
      
      // Status filter
      if (filters.status !== 'all') {
        const isCompleted = isCourseCompleted(userCertificates, course.id)
        if (filters.status === 'completed' && !isCompleted) return false
        if (filters.status === 'not_completed' && isCompleted) return false
      }
      
      return true
    })
    .sort((a, b) => {
      const multiplier = filters.sortOrder === 'asc' ? 1 : -1
      
      switch (filters.sortBy) {
        case 'trending':
          return (b.trending ? 1 : 0) - (a.trending ? 1 : 0)
        case 'title':
          return multiplier * a.title.localeCompare(b.title)
        case 'rating':
          return multiplier * (a.rating - b.rating)
        case 'duration':
          return multiplier * (a.durationWeeks - b.durationWeeks)
        case 'points':
          return multiplier * (a.points - b.points)
        case 'students':
          return multiplier * (a.studentsEnrolled - b.studentsEnrolled)
        default:
          return 0
      }
    })

  // Get featured courses (trending + editor's pick)
  const featuredCourses = certificateCourses.filter(course => 
    course.trending || course.editorsPick
  ).slice(0, 6)

  const loadCertificates = async () => {
    if (!user) return
    
    setIsLoadingCertificates(true)
    try {
      const certificates = await getUserCertificates(user.uid)
      setUserCertificates(certificates)
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setIsLoadingCertificates(false)
    }
  }

  const handleCertificateUpdate = () => {
    loadCertificates()
  }

  const initializeDemoData = async () => {
    if (!user) return
    
    try {
      await initializeDemoCertificates(user.uid)
      loadCertificates()
    } catch (error) {
      console.error('Error initializing demo certificates:', error)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }
    
    loadCertificates()
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user) {
    return null
  }

  const certificationLevel = getUserCertificationLevel(userCertificates.length)
  const totalPoints = calculateTotalPoints(userCertificates)

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <MdBadge className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">🎓 Certificate Lab</h1>
                <p className="text-xl text-green-100">
                  Earn industry-recognized certificates and build your skill profile
                </p>
              </div>
            </div>
            
            {/* User Stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 rounded-xl p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold">{userCertificates.length}</div>
                <div className="text-green-100 text-sm">Certificates</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-yellow-300">{totalPoints}</div>
                <div className="text-green-100 text-sm">Points</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-2 text-lg font-bold">
                  <span className="text-xl">{certificationLevel.badge}</span>
                  <span className="text-sm">{certificationLevel.name}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <main className="max-w-7xl mx-auto p-6 pb-24">
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'browse'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Browse Courses
            </button>
            <button
              onClick={() => setActiveTab('my-certificates')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'my-certificates'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              My Certificates ({userCertificates.length})
            </button>
          </div>

          {/* Upload Button */}
          <div className="w-full sm:w-auto">
            <UploadCertificate uid={user.uid} onCertificateUploaded={handleCertificateUpdate} />
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'browse' ? (
            <motion.div
              key="browse"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="lg:w-80 flex-shrink-0">
                  <CertificateFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    coursesCount={filteredCourses.length}
                    isOpen={isFiltersOpen}
                    onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
                  />
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-8">
                  {/* Featured Section */}
                  {filters.providers.length === 0 && 
                   filters.skills.length === 0 && 
                   filters.difficulty.length === 0 && 
                   filters.duration.length === 0 && 
                   filters.status === 'all' && (
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <MdTrendingUp className="w-6 h-6 text-orange-400" />
                        <h2 className="text-2xl font-bold text-white">🔥 Trending & Editor's Picks</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {featuredCourses.map(course => (
                          <CertificateCard
                            key={course.id}
                            course={course}
                            userCertificates={userCertificates}
                            uid={user.uid}
                            onCertificateUpdate={handleCertificateUpdate}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* All Courses */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">
                        All Courses ({filteredCourses.length})
                      </h2>
                      
                      {/* Demo Data Button */}
                      {userCertificates.length === 0 && (
                        <button
                          onClick={initializeDemoData}
                          className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          Add Demo Certificates
                        </button>
                      )}
                    </div>

                    {filteredCourses.length === 0 ? (
                      <div className="text-center py-12 bg-slate-800 rounded-2xl border border-slate-700">
                        <MdSchool className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Courses Found</h3>
                        <p className="text-slate-400">
                          Try adjusting your filters to see more courses.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredCourses.map(course => (
                          <CertificateCard
                            key={course.id}
                            course={course}
                            userCertificates={userCertificates}
                            uid={user.uid}
                            onCertificateUpdate={handleCertificateUpdate}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="my-certificates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {isLoadingCertificates ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400">Loading certificates...</span>
                  </div>
                </div>
              ) : (
                <MyCertificates
                  certificates={userCertificates}
                  uid={user.uid}
                  onCertificateUpdate={handleCertificateUpdate}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNavBar />
    </div>
  )
} 