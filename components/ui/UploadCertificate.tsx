'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MdUpload, 
  MdClose, 
  MdAdd,
  MdCloudUpload,
  MdDescription,
  MdBusiness,
  MdLabel
} from 'react-icons/md'
import { skillCategories } from '@/lib/certificatesData'
import { uploadExternalCertificate } from '@/lib/certificateUtils'

interface UploadCertificateProps {
  uid: string
  onCertificateUploaded: () => void
}

export default function UploadCertificate({ 
  uid, 
  onCertificateUploaded 
}: UploadCertificateProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    skills: [] as string[],
    file: null as File | null
  })
  const [dragActive, setDragActive] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.provider || formData.skills.length === 0) {
      return
    }

    setIsUploading(true)
    try {
      await uploadExternalCertificate(
        uid,
        formData.title,
        formData.provider,
        formData.skills,
        formData.file || undefined
      )
      
      // Reset form
      setFormData({
        title: '',
        provider: '',
        skills: [],
        file: null
      })
      setIsOpen(false)
      onCertificateUploaded()
    } catch (error) {
      console.error('Error uploading certificate:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or image file (JPG, PNG)')
        return
      }
      
      if (file.size > maxSize) {
        alert('File size must be less than 5MB')
        return
      }
      
      setFormData(prev => ({ ...prev, file }))
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or image file (JPG, PNG)')
        return
      }
      
      if (file.size > maxSize) {
        alert('File size must be less than 5MB')
        return
      }
      
      setFormData(prev => ({ ...prev, file }))
    }
  }

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null }))
  }

  return (
    <>
      {/* Upload Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg"
      >
        <MdUpload className="w-5 h-5" />
        Upload External Certificate
      </motion.button>

      {/* Upload Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <MdCloudUpload className="w-6 h-6 text-purple-400" />
                  Upload Certificate
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <MdClose className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Certificate Title */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    <MdDescription className="w-4 h-4 inline mr-2" />
                    Certificate Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Google Analytics Certified"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Provider */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    <MdBusiness className="w-4 h-4 inline mr-2" />
                    Certificate Provider *
                  </label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                    placeholder="e.g., Google, Coursera, edX"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-white font-medium mb-3">
                    <MdLabel className="w-4 h-4 inline mr-2" />
                    Related Skills * (Select at least one)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto bg-slate-700/30 rounded-lg p-3">
                    {skillCategories.map(skill => (
                      <label key={skill} className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 p-2 rounded-md transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.skills.includes(skill)}
                          onChange={() => toggleSkill(skill)}
                          className="text-blue-500 focus:ring-blue-500 rounded"
                        />
                        <span className="text-slate-300 text-sm">{skill}</span>
                      </label>
                    ))}
                  </div>
                  {formData.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {formData.skills.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-white font-medium mb-3">
                    Certificate File (Optional)
                  </label>
                  
                  {!formData.file ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                        dragActive 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <MdCloudUpload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-white font-medium mb-2">
                        Drop your certificate here or click to browse
                      </p>
                      <p className="text-slate-400 text-sm mb-4">
                        PDF, JPG, PNG up to 5MB
                      </p>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <MdAdd className="w-4 h-4" />
                        Choose File
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <MdDescription className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{formData.file.name}</p>
                          <p className="text-slate-400 text-sm">
                            {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      >
                        <MdClose className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Note */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    <strong>Note:</strong> Uploaded certificates will be reviewed and verified before points are awarded. 
                    You'll receive 15 points upon approval.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !formData.title || !formData.provider || formData.skills.length === 0}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <MdUpload className="w-4 h-4" />
                        Upload Certificate
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 