'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/store'
import BottomNavBar from '@/components/ui/BottomNavBar'
import { MdEmojiEvents, MdTrendingUp, MdPeople, MdStar } from 'react-icons/md'

export default function LeadershipLabPage() {
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
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <MdEmojiEvents className="w-16 h-16 mx-auto mb-4 text-white" />
          <h1 className="text-4xl font-bold mb-4">🏆 Leadership Lab</h1>
          <p className="text-xl text-orange-100">
            Track your leadership journey and compete with peers
          </p>
        </motion.div>
      </div>

      <main className="max-w-4xl mx-auto p-6 pb-24">
        {/* Your Ranking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-6 mb-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-2">Your Current Ranking</h2>
          <div className="text-6xl font-bold text-white mb-2">#5</div>
          <p className="text-orange-100">Out of 1,247 students</p>
          <div className="flex justify-center items-center mt-4">
            <MdStar className="w-6 h-6 text-yellow-300 mr-2" />
            <span className="text-xl font-semibold">2,450 Points</span>
          </div>
        </motion.div>

        {/* Leaderboard Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-center">🎓 Overall Ranking</h3>
            <div className="space-y-3">
              {[
                { rank: 1, name: "Aisha Patel", points: 3200, class: "12A" },
                { rank: 2, name: "Marcus Johnson", points: 2980, class: "11B" },
                { rank: 3, name: "Sofia Chen", points: 2875, class: "12C" }
              ].map((student, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      student.rank === 1 ? 'bg-yellow-500' : 
                      student.rank === 2 ? 'bg-gray-400' : 'bg-orange-400'
                    }`}>
                      {student.rank}
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-medium text-sm">{student.name}</p>
                      <p className="text-slate-400 text-xs">{student.class}</p>
                    </div>
                  </div>
                  <span className="text-orange-400 font-semibold text-sm">{student.points}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-center">🏫 High School</h3>
            <div className="space-y-3">
              {[
                { rank: 1, name: "Raj Kumar", points: 2100, class: "12A" },
                { rank: 2, name: "Emma Wilson", points: 1950, class: "11A" },
                { rank: 3, name: "David Park", points: 1875, class: "12B" }
              ].map((student, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      student.rank === 1 ? 'bg-yellow-500' : 
                      student.rank === 2 ? 'bg-gray-400' : 'bg-orange-400'
                    }`}>
                      {student.rank}
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-medium text-sm">{student.name}</p>
                      <p className="text-slate-400 text-xs">{student.class}</p>
                    </div>
                  </div>
                  <span className="text-orange-400 font-semibold text-sm">{student.points}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-center">📈 Weekly Leaders</h3>
            <div className="space-y-3">
              {[
                { rank: 1, name: "Lisa Zhang", points: 450, trend: "+25%" },
                { rank: 2, name: "Ahmed Hassan", points: 425, trend: "+18%" },
                { rank: 3, name: "Maria Garcia", points: 400, trend: "+22%" }
              ].map((student, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      student.rank === 1 ? 'bg-yellow-500' : 
                      student.rank === 2 ? 'bg-gray-400' : 'bg-orange-400'
                    }`}>
                      {student.rank}
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-medium text-sm">{student.name}</p>
                      <p className="text-green-400 text-xs">{student.trend}</p>
                    </div>
                  </div>
                  <span className="text-orange-400 font-semibold text-sm">{student.points}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Achievement Timeline */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">🎯 Recent Achievements</h2>
          <div className="space-y-4">
            {[
              { title: "Weekly Challenge Winner", points: "+200", date: "2 days ago", type: "competition" },
              { title: "Perfect Attendance Streak", points: "+50", date: "1 week ago", type: "attendance" },
              { title: "Top Math Performer", points: "+150", date: "2 weeks ago", type: "academic" }
            ].map((achievement, index) => (
              <div key={index} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                    achievement.type === 'competition' ? 'bg-yellow-600' :
                    achievement.type === 'attendance' ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {achievement.type === 'competition' ? '🏆' :
                     achievement.type === 'attendance' ? '📅' : '📚'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{achievement.title}</h3>
                    <p className="text-slate-400 text-sm">{achievement.date}</p>
                  </div>
                </div>
                <span className="text-green-400 font-bold">{achievement.points}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Goals & Challenges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">📋 Current Goals</h3>
            <div className="space-y-3">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">Reach Top 3</span>
                  <span className="text-blue-400">75%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">Weekly 500 Points</span>
                  <span className="text-green-400">90%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">⚡ Active Challenges</h3>
            <div className="space-y-3">
              <div className="bg-purple-900/50 border border-purple-500/50 rounded-lg p-3">
                <h4 className="text-white font-medium">Math Marathon</h4>
                <p className="text-purple-300 text-sm">Solve 100 problems this week</p>
                <p className="text-purple-400 text-xs mt-1">Reward: 300 points</p>
              </div>
              <div className="bg-orange-900/50 border border-orange-500/50 rounded-lg p-3">
                <h4 className="text-white font-medium">Study Streak</h4>
                <p className="text-orange-300 text-sm">Study for 7 consecutive days</p>
                <p className="text-orange-400 text-xs mt-1">Reward: 150 points</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <BottomNavBar />
    </div>
  )
} 