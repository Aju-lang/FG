'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/store'
import BottomNavBar from '@/components/ui/BottomNavBar'
import { MdPerson, MdEdit, MdSchool, MdLocationOn, MdEmail, MdPhone } from 'react-icons/md'

export default function AboutMeLabPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <MdPerson className="w-16 h-16 mx-auto mb-4 text-white" />
          <h1 className="text-4xl font-bold mb-4">🙋‍♂️ About Me Lab</h1>
          <p className="text-xl text-pink-100">
            Manage your profile and showcase your achievements
          </p>
        </motion.div>
      </div>

      <main className="max-w-4xl mx-auto p-6 pb-24">
        {/* Profile Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Profile Overview</h2>
            <button className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg transition-colors">
              <MdEdit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Picture & Basic Info */}
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{user?.name || 'Student'}</h3>
              <p className="text-slate-400 mb-1">Class 12A • Science Stream</p>
              <p className="text-slate-400">Student ID: ABMI2024001</p>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MdEmail className="w-5 h-5 text-pink-400" />
                  <span className="text-slate-300">{user?.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MdPhone className="w-5 h-5 text-pink-400" />
                  <span className="text-slate-300">+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3">
                  <MdLocationOn className="w-5 h-5 text-pink-400" />
                  <span className="text-slate-300">Mumbai, Maharashtra</span>
                </div>
                <div className="flex items-center gap-3">
                  <MdSchool className="w-5 h-5 text-pink-400" />
                  <span className="text-slate-300">FG School, Mumbai</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Quick Stats</h4>
              <div className="space-y-3">
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-400">2,450</div>
                  <div className="text-sm text-slate-400">Total Points</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">3</div>
                  <div className="text-sm text-slate-400">Certificates</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-400">#5</div>
                  <div className="text-sm text-slate-400">Class Rank</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Academic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">📚 Academic Performance</h3>
            <div className="space-y-4">
              {[
                { subject: "Mathematics", grade: "A+", percentage: 95 },
                { subject: "Physics", grade: "A", percentage: 89 },
                { subject: "Chemistry", grade: "A", percentage: 87 },
                { subject: "Biology", grade: "A+", percentage: 93 }
              ].map((subject, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">{subject.subject}</span>
                    <span className="text-slate-400 ml-2">({subject.percentage}%)</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subject.grade === 'A+' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'
                  }`}>
                    {subject.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">🎯 Goals & Interests</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Career Goal</h4>
                <p className="text-slate-300 text-sm">Software Engineer at a leading tech company</p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {['Programming', 'Mathematics', 'Robotics', 'Gaming'].map((interest, index) => (
                    <span key={index} className="bg-pink-900/50 text-pink-300 px-3 py-1 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">Hobbies</h4>
                <div className="flex flex-wrap gap-2">
                  {['Reading', 'Chess', 'Music', 'Drawing'].map((hobby, index) => (
                    <span key={index} className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-sm">
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">📈 Recent Activity</h2>
          <div className="bg-slate-800 rounded-2xl p-6">
            <div className="space-y-4">
              {[
                { activity: "Completed Google Digital Marketing Course", time: "2 days ago", type: "achievement" },
                { activity: "Scored 95% in Mathematics Test", time: "1 week ago", type: "academic" },
                { activity: "Participated in Science Fair", time: "2 weeks ago", type: "event" },
                { activity: "Joined Programming Club", time: "1 month ago", type: "club" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-b-0">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      activity.type === 'achievement' ? 'bg-green-400' :
                      activity.type === 'academic' ? 'bg-blue-400' :
                      activity.type === 'event' ? 'bg-purple-400' : 'bg-pink-400'
                    }`}></div>
                    <span className="text-white">{activity.activity}</span>
                  </div>
                  <span className="text-slate-400 text-sm">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold mb-4">⚙️ Account Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-slate-700 hover:bg-slate-600 p-4 rounded-lg text-left transition-colors">
              <h4 className="text-white font-medium">Privacy Settings</h4>
              <p className="text-slate-400 text-sm">Manage who can see your profile</p>
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 p-4 rounded-lg text-left transition-colors">
              <h4 className="text-white font-medium">Notification Preferences</h4>
              <p className="text-slate-400 text-sm">Control your notification settings</p>
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 p-4 rounded-lg text-left transition-colors">
              <h4 className="text-white font-medium">Change Password</h4>
              <p className="text-slate-400 text-sm">Update your account security</p>
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 p-4 rounded-lg text-left transition-colors">
              <h4 className="text-white font-medium">Download Data</h4>
              <p className="text-slate-400 text-sm">Export your profile information</p>
            </button>
          </div>
        </motion.div>
      </main>

      <BottomNavBar />
    </div>
  )
} 