'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import QRCode from 'qrcode'
// Removed Firebase auth import
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

export default function DebugQRPage() {
  const router = useRouter()
  const [qrCodeImage, setQrCodeImage] = useState('')
  const [qrData, setQrData] = useState('')
  const [testCredentials, setTestCredentials] = useState({
    username: 'ahmedhassan101',
    password: 'AH101@'
  })

  const generateQRCode = async () => {
    try {
      const loginData = JSON.stringify({
        type: 'login',
        username: testCredentials.username,
        password: testCredentials.password,
        role: 'student'
      })
      
      const qrImage = await QRCode.toDataURL(loginData)
      setQrCodeImage(qrImage)
      setQrData(loginData)
      
      toast.success('QR Code generated!')
    } catch (error) {
      toast.error('Failed to generate QR code')
    }
  }

  const testQRLogin = async () => {
    try {
      if (!qrData) {
        toast.error('Generate QR code first')
        return
      }
      
      // Mock QR login since Firebase auth is removed
      const mockUser = {
        id: `user_${Date.now()}`,
        uid: `user_${Date.now()}`,
        name: 'QR Test User',
        email: 'qr@test.com',
        role: 'student' as const,
        class: '10th',
        division: 'A',
        parentName: 'Parent Name',
        place: 'City',
        totalPoints: 0,
        certificates: 0,
        rewardPoints: 0
      }
      
      toast.success(`QR Login successful! Welcome ${mockUser.name}`)
      
      // Store user for session
      localStorage.setItem('userProfile', JSON.stringify(mockUser))
      
      // Redirect to student dashboard
      router.push('/school-lab')
      
    } catch (error: any) {
      toast.error(`QR Login failed: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🔍 QR Code Debug Center
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Code Generator */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Generate Test QR Code</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={testCredentials.username}
                    onChange={(e) => setTestCredentials({...testCredentials, username: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="text"
                    value={testCredentials.password}
                    onChange={(e) => setTestCredentials({...testCredentials, password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  onClick={generateQRCode}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🎯 Generate QR Code
                </button>
              </div>

              {/* QR Code Display */}
              {qrCodeImage && (
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Generated QR Code</h3>
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <img src={qrCodeImage} alt="Login QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Scan this QR code to test login
                  </p>
                </div>
              )}
            </div>

            {/* QR Code Tester */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Test QR Login</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Data (JSON)
                  </label>
                  <textarea
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="QR data will appear here..."
                  />
                </div>
                
                <button
                  onClick={testQRLogin}
                  disabled={!qrData}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  🚀 Test QR Login
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Instructions:</h3>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Enter valid username/password from created students</li>
                  <li>2. Click "Generate QR Code" to create test QR</li>
                  <li>3. Click "Test QR Login" to simulate QR scan login</li>
                  <li>4. Check console for detailed logs</li>
                </ol>
              </div>

              {/* Sample Credentials */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-700 mb-2">Sample Test Credentials:</h3>
                <div className="text-sm text-blue-600 space-y-1">
                  <div><strong>Username:</strong> ahmedhassan101</div>
                  <div><strong>Password:</strong> AH101@</div>
                  <div className="text-xs text-blue-500 mt-2">
                    These should work if you've created demo students
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 text-center space-x-4">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Login
            </button>
            <button
              onClick={() => router.push('/setup')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🚀 Go to Setup
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 