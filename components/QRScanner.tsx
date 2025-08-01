'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Camera } from 'lucide-react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { authAPI, saveToken } from '@/lib/api'

interface QRScannerProps {
  trigger: React.ReactNode
  onSuccess?: (result: any) => void
}

export default function QRScanner({ trigger, onSuccess }: QRScannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { setUser } = useAuthStore()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)

    try {
      // In a real implementation, you would use a QR code reading library
      // For demo purposes, we'll simulate QR code reading
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          // Simulate QR code data
          const mockQRData = JSON.stringify({
            type: 'login',
            qrToken: 'demo_qr_token_123',
            username: 'demo_user',
            password: 'demo_password',
            role: 'student'
          })

          // Parse QR data and extract token
          const qrInfo = JSON.parse(mockQRData)
          
          if (qrInfo.type !== 'login') {
            throw new Error('Invalid QR code type')
          }
          
          const qrToken = qrInfo.qrToken || qrInfo.token
          
          if (!qrToken) {
            throw new Error('Invalid QR code - no token found')
          }
          
          // Login with QR token
          const response = await authAPI.loginQR(qrToken)
          
          // Save token and user data
          saveToken(response.token)
          setUser(response.user)
          
          toast.success('QR Code login successful!')
          
          if (onSuccess) {
            onSuccess(response.user)
          } else {
            router.push('/school-lab')
          }
          
          setIsOpen(false)
        } catch (error: any) {
          toast.error(error.message || 'Invalid QR code')
        } finally {
          setIsProcessing(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Failed to process QR code')
      setIsProcessing(false)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Scan QR Code</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Camera Scanner Placeholder */}
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Camera scanner would be implemented here
                  </p>
                  <p className="text-sm text-gray-500">
                    For now, use the file upload option below
                  </p>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-4">
                    Or upload a QR code image
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Upload QR Code'}
                  </button>
                </div>

                {/* Demo QR Code */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    💡 <strong>Demo:</strong> Use this QR code for testing:
                  </p>
                  <div className="bg-white p-2 rounded border">
                    <code className="text-xs text-gray-700">
                      {JSON.stringify({
                        type: 'login',
                        qrToken: 'demo_qr_token_123'
                      }, null, 2)}
                    </code>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 