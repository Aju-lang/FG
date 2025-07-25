'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MdDownload, 
  MdVerified, 
  MdSchedule, 
  MdStar,
  MdDelete,
  MdUpload,
  MdViewList,
  MdGridView
} from 'react-icons/md'
import { UserCertificate } from '@/lib/certificatesData'
import { 
  exportCertificatesToCSV, 
  unmarkCourseCompleted,
  calculateTotalPoints,
  getUserCertificationLevel,
  getProgressToNextLevel
} from '@/lib/certificateUtils'

interface MyCertificatesProps {
  certificates: UserCertificate[]
  uid: string
  onCertificateUpdate: () => void
}

export default function MyCertificates({ 
  certificates, 
  uid, 
  onCertificateUpdate 
}: MyCertificatesProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'date' | 'points' | 'title'>('date')
  const [filterBy, setFilterBy] = useState<'all' | 'course' | 'uploaded'>('all')

  const totalPoints = calculateTotalPoints(certificates)
  const certificationLevel = getUserCertificationLevel(certificates.length)
  const { current, next, progress } = getProgressToNextLevel(certificates.length)

  const filteredCertificates = certificates
    .filter(cert => filterBy === 'all' || cert.type === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime()
        case 'points':
          return b.pointsEarned - a.pointsEarned
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const handleExportCSV = () => {
    const csvContent = exportCertificatesToCSV(certificates)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `my-certificates-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleRemoveCertificate = async (certificateId: string) => {
    if (confirm('Are you sure you want to remove this certificate?')) {
      await unmarkCourseCompleted(uid, certificateId)
      onCertificateUpdate()
    }
  }

  const CertificateCard = ({ certificate }: { certificate: UserCertificate }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-slate-800 rounded-xl p-6 border transition-all duration-300 hover:border-slate-600 ${
        certificate.verified 
          ? 'border-green-500/30' 
          : 'border-yellow-500/30'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            certificate.type === 'course' 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-purple-500/20 text-purple-400'
          }`}>
            {certificate.type === 'course' ? '🎓' : '📜'}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg line-clamp-2">
              {certificate.title}
            </h3>
            <p className="text-slate-400 text-sm">{certificate.provider}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {certificate.verified ? (
            <MdVerified className="w-5 h-5 text-green-400" />
          ) : (
            <span className="text-xs text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded-full">
              Pending
            </span>
          )}
          <button
            onClick={() => handleRemoveCertificate(certificate.id)}
            className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
          >
            <MdDelete className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <MdSchedule className="w-4 h-4" />
            <span>{new Date(certificate.dateCompleted).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <MdStar className="w-4 h-4 text-yellow-400" />
            <span>{certificate.pointsEarned} points</span>
          </div>
        </div>

        {certificate.skills && certificate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {certificate.skills.slice(0, 3).map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-md"
              >
                {skill}
              </span>
            ))}
            {certificate.skills.length > 3 && (
              <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-md">
                +{certificate.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        {certificate.uploadedFile && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MdUpload className="w-4 h-4" />
            <span>{certificate.uploadedFile}</span>
          </div>
        )}
      </div>
    </motion.div>
  )

  const CertificateListItem = ({ certificate }: { certificate: UserCertificate }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-slate-800 rounded-xl p-4 border transition-all duration-300 hover:border-slate-600 ${
        certificate.verified 
          ? 'border-green-500/30' 
          : 'border-yellow-500/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-2 rounded-lg ${
            certificate.type === 'course' 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-purple-500/20 text-purple-400'
          }`}>
            {certificate.type === 'course' ? '🎓' : '📜'}
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-white">{certificate.title}</h3>
            <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
              <span>{certificate.provider}</span>
              <span>{new Date(certificate.dateCompleted).toLocaleDateString()}</span>
              <span>{certificate.pointsEarned} points</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {certificate.verified ? (
            <MdVerified className="w-5 h-5 text-green-400" />
          ) : (
            <span className="text-xs text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded-full">
              Pending
            </span>
          )}
          <button
            onClick={() => handleRemoveCertificate(certificate.id)}
            className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
          >
            <MdDelete className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🎓</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Certificates Yet</h3>
        <p className="text-slate-400">
          Complete some courses or upload your certificates to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-1">{certificates.length}</h3>
          <p className="text-slate-400">Total Certificates</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-2xl font-bold text-yellow-400 mb-1">{totalPoints}</h3>
          <p className="text-slate-400">Total Points</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{certificationLevel.badge}</span>
            <h3 className="text-lg font-bold text-white">{certificationLevel.name}</h3>
          </div>
          {next && (
            <div className="space-y-1">
              <p className="text-slate-400 text-sm">
                {next.minCertificates - certificates.length} more for {next.name}
              </p>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500"
          >
            <option value="all">All Certificates</option>
            <option value="course">Course Certificates</option>
            <option value="uploaded">Uploaded Certificates</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="points">Sort by Points</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex bg-slate-800 rounded-lg border border-slate-700 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MdGridView className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MdViewList className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <MdDownload className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Certificates Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map(certificate => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCertificates.map(certificate => (
            <CertificateListItem key={certificate.id} certificate={certificate} />
          ))}
        </div>
      )}
    </div>
  )
} 