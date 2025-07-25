'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MdSchedule, 
  MdStar, 
  MdPeople, 
  MdOpenInNew, 
  MdCheck, 
  MdUndo,
  MdTrendingUp,
  MdVerified,
  MdSchool
} from 'react-icons/md'
import { CertificateCourse, UserCertificate } from '@/lib/certificatesData'
import { markCourseCompleted, unmarkCourseCompleted } from '@/lib/certificateUtils'

interface CertificateCardProps {
  course: CertificateCourse
  userCertificates: UserCertificate[]
  uid: string
  onCertificateUpdate: () => void
}

export default function CertificateCard({ 
  course, 
  userCertificates, 
  uid, 
  onCertificateUpdate 
}: CertificateCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  
  const completedCert = userCertificates.find(cert => cert.courseId === course.id)
  const isCompleted = !!completedCert

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500'
      case 'Intermediate': return 'bg-yellow-500'
      case 'Advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getProviderColor = (provider: string) => {
    const colors: { [key: string]: string } = {
      'Google': 'bg-blue-500',
      'IBM': 'bg-blue-700',
      'Harvard': 'bg-red-600',
      'Stanford': 'bg-red-500',
      'Meta': 'bg-blue-600',
      'Microsoft': 'bg-blue-500',
      'Amazon': 'bg-orange-500'
    }
    return colors[provider] || 'bg-purple-500'
  }

  const handleMarkCompleted = async () => {
    if (isCompleting) return
    
    setIsCompleting(true)
    try {
      await markCourseCompleted(
        uid, 
        course.id, 
        course.title, 
        course.provider, 
        course.points, 
        course.skills
      )
      onCertificateUpdate()
    } catch (error) {
      console.error('Error marking course completed:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleUnmarkCompleted = async () => {
    if (!completedCert || isCompleting) return
    
    setIsCompleting(true)
    try {
      await unmarkCourseCompleted(uid, completedCert.id)
      onCertificateUpdate()
    } catch (error) {
      console.error('Error unmarking course:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleEnrollClick = () => {
    // Add some vibration feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    window.open(course.enrollLink, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`relative bg-slate-800 rounded-2xl p-6 shadow-xl border transition-all duration-300 ${
        isCompleted 
          ? 'border-green-500/50 bg-gradient-to-br from-slate-800 to-green-900/20' 
          : 'border-slate-700 hover:border-slate-600'
      }`}
    >
      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {course.trending && (
          <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
            <MdTrendingUp className="w-3 h-3" />
            Trending
          </span>
        )}
        {course.editorsPick && (
          <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
            <MdVerified className="w-3 h-3" />
            Editor's Pick
          </span>
        )}
        {course.free && (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
            Free
          </span>
        )}
        {isCompleted && (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
            <MdCheck className="w-3 h-3" />
            Completed
          </span>
        )}
      </div>

      {/* Course Image/Icon */}
      <div className="relative mb-4">
        <div className="w-full h-32 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center">
          <MdSchool className="w-12 h-12 text-slate-400" />
        </div>
        
        {/* Provider Badge */}
        <div className={`absolute top-2 left-2 ${getProviderColor(course.provider)} px-2 py-1 rounded-lg`}>
          <span className="text-white text-xs font-medium">{course.provider}</span>
        </div>

        {/* Difficulty Badge */}
        <div className={`absolute top-2 right-2 ${getDifficultyColor(course.difficulty)} px-2 py-1 rounded-lg`}>
          <span className="text-white text-xs font-medium">{course.difficulty}</span>
        </div>
      </div>

      {/* Course Info */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight">
          {course.title}
        </h3>
        
        <p className="text-slate-400 text-sm line-clamp-2">
          {course.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <MdSchedule className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <MdStar className="w-4 h-4 text-yellow-400" />
            <span>{course.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <MdPeople className="w-4 h-4" />
            <span>{(course.studentsEnrolled / 1000).toFixed(0)}k</span>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {course.skills.slice(0, 3).map((skill, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-md"
            >
              {skill}
            </span>
          ))}
          {course.skills.length > 3 && (
            <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-md">
              +{course.skills.length - 3} more
            </span>
          )}
        </div>

        {/* Points */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold">+{course.points} points</span>
            {isCompleted && completedCert && (
              <span className="text-green-400 text-sm">
                (Earned {new Date(completedCert.dateCompleted).toLocaleDateString()})
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEnrollClick}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <MdOpenInNew className="w-4 h-4" />
            Enroll
          </motion.button>

          {!isCompleted ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMarkCompleted}
              disabled={isCompleting}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              {isCompleting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MdCheck className="w-4 h-4" />
              )}
              {isCompleting ? 'Marking...' : 'Complete'}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUnmarkCompleted}
              disabled={isCompleting}
              className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-600/50 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              {isCompleting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MdUndo className="w-4 h-4" />
              )}
              Undo
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
} 