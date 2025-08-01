'use client'

import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrCode, Download, Copy, CheckCircle } from 'lucide-react'
import { toast } from 'react-toastify'

interface QRCodeGenProps {
  student: {
    id: string
    name: string
    username: string
    password: string
    class: string
    division: string
  }
}

export default function QRCodeGen({ student }: QRCodeGenProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    generateQRCode()
  }, [student])

  const generateQRCode = async () => {
    setIsGenerating(true)
    
    try {
      // Create login data object
      const loginData = {
        type: 'student_login',
        username: student.username,
        password: student.password,
        studentId: student.id,
        name: student.name,
        class: student.class,
        division: student.division
      }

      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(loginData), {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      })

      setQrCodeDataUrl(qrCodeDataURL)
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Failed to generate QR code')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return
    
    const link = document.createElement('a')
    link.download = `${student.name}_login_qr.png`
    link.href = qrCodeDataUrl
    link.click()
    toast.success('QR code downloaded successfully!')
  }

  const copyCredentials = async () => {
    const credentials = `Username: ${student.username}\nPassword: ${student.password}`
    
    try {
      await navigator.clipboard.writeText(credentials)
      setIsCopied(true)
      toast.success('Credentials copied to clipboard!')
      
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy credentials:', error)
      toast.error('Failed to copy credentials')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Login QR Code
        </CardTitle>
        <CardDescription>
          QR code for {student.name} ({student.class}-{student.division})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* QR Code Display */}
          <div className="flex justify-center">
            {isGenerating ? (
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : qrCodeDataUrl ? (
              <div className="text-center">
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code for ${student.name}`}
                  className="w-64 h-64 mx-auto border rounded-lg"
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">QR Code not generated</p>
              </div>
            )}
          </div>

          {/* Credentials Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Login Credentials</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Username:</span>
                <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                  {student.username}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Password:</span>
                <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                  {student.password}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={downloadQRCode}
              disabled={!qrCodeDataUrl}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download QR
            </Button>
            
            <Button
              onClick={copyCredentials}
              disabled={isCopied}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isCopied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Credentials
                </>
              )}
            </Button>
          </div>

          {/* Student Info Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {student.name} • {student.class}-{student.division}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 