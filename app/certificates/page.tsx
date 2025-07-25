'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/store'
import BottomNavBar from '@/components/ui/BottomNavBar'
import { MdBadge, MdDownload, MdVerified, MdTrendingUp } from 'react-icons/md'

export default function CertificateLabPage() {
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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <MdBadge className="w-16 h-16 mx-auto mb-4 text-white" />
          <h1 className="text-4xl font-bold mb-4">🎓 Certificate Lab</h1>
          <p className="text-xl text-green-100">
            Earn industry-recognized certificates and showcase your achievements
          </p>
        </motion.div>
      </div>

      <main className="max-w-4xl mx-auto p-6 pb-24">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800 rounded-2xl p-6 text-center"
          >
            <MdVerified className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <h3 className="text-2xl font-bold text-white">3</h3>
            <p className="text-slate-300">Earned Certificates</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800 rounded-2xl p-6 text-center"
          >
            <MdTrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <h3 className="text-2xl font-bold text-white">2</h3>
            <p className="text-slate-300">In Progress</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800 rounded-2xl p-6 text-center"
          >
            <MdBadge className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <h3 className="text-2xl font-bold text-white">5</h3>
            <p className="text-slate-300">Available</p>
          </motion.div>
        </div>

        {/* Earned Certificates */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-white">🏆 Your Certificates</h2>
          <div className="space-y-4">
            {[
              { name: "Google Digital Marketing Fundamentals", provider: "Google", date: "2024-01-15", verified: true },
              { name: "Microsoft Office Specialist", provider: "Microsoft", date: "2024-01-10", verified: true },
              { name: "Professional Communication Skills", provider: "Big Communication", date: "2024-01-05", verified: true }
            ].map((cert, index) => (
              <div key={index} className="bg-slate-800 rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-600 p-3 rounded-lg mr-4">
                    <MdBadge className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{cert.name}</h3>
                    <p className="text-slate-300 text-sm">Issued by {cert.provider} • {cert.date}</p>
                    {cert.verified && (
                      <div className="flex items-center mt-1">
                        <MdVerified className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-green-400 text-xs">Verified</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                    <MdDownload className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Available Certificates */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-white">📚 Available Certificates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "Advanced React Development", provider: "Meta", difficulty: "Advanced", duration: "40 hours", points: 500 },
              { name: "Data Science Fundamentals", provider: "IBM", difficulty: "Intermediate", duration: "35 hours", points: 450 },
              { name: "Digital Art & Design", provider: "Adobe", difficulty: "Beginner", duration: "25 hours", points: 300 },
              { name: "Project Management", provider: "PMI", difficulty: "Intermediate", duration: "30 hours", points: 400 }
            ].map((cert, index) => (
              <div key={index} className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">{cert.name}</h3>
                    <p className="text-slate-300 text-sm">by {cert.provider}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    cert.difficulty === 'Beginner' ? 'bg-green-900 text-green-300' :
                    cert.difficulty === 'Intermediate' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  }`}>
                    {cert.difficulty}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Duration:</span>
                    <span className="text-white">{cert.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Points Required:</span>
                    <span className="text-white">{cert.points}</span>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 py-2 rounded-lg font-medium transition-all">
                  Start Learning
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 text-center"
        >
          <h3 className="text-xl font-semibold text-purple-400 mb-2">🚀 Coming Soon!</h3>
          <p className="text-slate-300">
            Blockchain-verified certificates, skill assessments, and partnerships with 
            leading universities and tech companies.
          </p>
        </motion.div>
      </main>

      <BottomNavBar />
    </div>
  )
} 