'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/store'
import BottomNavBar from '@/components/ui/BottomNavBar'
import { MdWorkspaces, MdPerson, MdVideoCall, MdSchedule } from 'react-icons/md'

export default function MentorshipLabPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  // Authentication check
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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <MdWorkspaces className="w-16 h-16 mx-auto mb-4 text-white" />
          <h1 className="text-4xl font-bold mb-4">🧑‍🏫 Mentorship Lab</h1>
          <p className="text-xl text-purple-100">
            Connect with expert mentors and accelerate your learning journey
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Mentors */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center mb-4">
              <MdPerson className="w-6 h-6 mr-3 text-purple-400" />
              <h2 className="text-xl font-semibold">Available Mentors</h2>
            </div>
            <div className="space-y-4">
              {[
                { name: "Dr. Sarah Johnson", expertise: "Mathematics & Physics", rating: 4.9 },
                { name: "Prof. Mike Chen", expertise: "Computer Science", rating: 4.8 },
                { name: "Ms. Emily Rodriguez", expertise: "Literature & Writing", rating: 4.9 }
              ].map((mentor, index) => (
                <div key={index} className="bg-slate-700 rounded-lg p-4">
                  <h3 className="font-medium text-white">{mentor.name}</h3>
                  <p className="text-slate-300 text-sm">{mentor.expertise}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-400">⭐ {mentor.rating}</span>
                    <button className="ml-auto bg-purple-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center mb-4">
              <MdSchedule className="w-6 h-6 mr-3 text-blue-400" />
              <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
            </div>
            <div className="space-y-4">
              {[
                { subject: "Advanced Calculus", mentor: "Dr. Sarah Johnson", time: "Today 2:00 PM" },
                { subject: "React Development", mentor: "Prof. Mike Chen", time: "Tomorrow 10:00 AM" },
                { subject: "Essay Writing", mentor: "Ms. Emily Rodriguez", time: "Friday 3:00 PM" }
              ].map((session, index) => (
                <div key={index} className="bg-slate-700 rounded-lg p-4">
                  <h3 className="font-medium text-white">{session.subject}</h3>
                  <p className="text-slate-300 text-sm">with {session.mentor}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-blue-400 text-sm">{session.time}</span>
                    <button className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <button className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-2xl text-center hover:from-purple-700 hover:to-purple-800 transition-all">
            <MdVideoCall className="w-8 h-8 mx-auto mb-2" />
            <span className="font-medium">Schedule Session</span>
          </button>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-2xl text-center hover:from-blue-700 hover:to-blue-800 transition-all">
            <MdPerson className="w-8 h-8 mx-auto mb-2" />
            <span className="font-medium">Find Mentor</span>
          </button>
          <button className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-2xl text-center hover:from-green-700 hover:to-green-800 transition-all">
            <MdWorkspaces className="w-8 h-8 mx-auto mb-2" />
            <span className="font-medium">My Progress</span>
          </button>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 text-center"
        >
          <h3 className="text-xl font-semibold text-yellow-400 mb-2">🚀 Coming Soon!</h3>
          <p className="text-slate-300">
            Advanced mentorship features including AI-powered mentor matching, 
            real-time collaboration tools, and personalized learning paths.
          </p>
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  )
} 