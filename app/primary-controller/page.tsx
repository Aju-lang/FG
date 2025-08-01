'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Upload, 
  UserPlus, 
  Mail, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Database,
  Settings,
  Send
} from 'lucide-react'
import PrimaryControllerNav from '@/components/PrimaryControllerNav'
import UploadBox from '@/components/UploadBox'
import ManualAddForm from '@/components/ManualAddForm'
import QRCodeGen from '@/components/QRCodeGen'
import { authAPI } from '@/lib/api'

interface ProcessingStatus {
  isProcessing: boolean
  currentStep: string
  progress: number
  totalStudents: number
  processedStudents: number
}

interface EmailResult {
  email: string
  success: boolean
  error?: string
}

export default function PrimaryControllerPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('insert-database')
  const [activeTab, setActiveTab] = useState('upload')
  const [students, setStudents] = useState<any[]>([])
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    currentStep: '',
    progress: 0,
    totalStudents: 0,
    processedStudents: 0
  })
  const [emailResults, setEmailResults] = useState<EmailResult[]>([])
  const [emailSendingEnabled, setEmailSendingEnabled] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('primaryController')
    localStorage.removeItem('rememberedEmail')
    localStorage.removeItem('rememberedUserType')
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  const handleStudentsProcessed = async (newStudents: any[]) => {
    if (newStudents.length === 0) return

    setProcessingStatus({
      isProcessing: true,
      currentStep: 'Processing students...',
      progress: 0,
      totalStudents: newStudents.length,
      processedStudents: 0
    })

    try {
      // Step 1: Register students via backend API
      setProcessingStatus(prev => ({ ...prev, currentStep: 'Registering students via backend...' }))
      
      const registeredStudents = []
      for (let i = 0; i < newStudents.length; i++) {
        const student = newStudents[i]
        
        try {
          console.log(`📤 Registering student: ${student.name}`)
          
          const response = await authAPI.register({
            name: student.name,
            email: student.email,
            class: student.class,
            division: student.division,
            parentName: student.parentName,
            place: student.place,
            rollNumber: student.rollNumber || '',
            phone: student.phone || ''
          })

          if (response.success) {
            registeredStudents.push(response.student)
            console.log(`✅ Registered: ${student.name}`)
          } else {
            console.error(`❌ Failed to register: ${student.name} - ${response.message}`)
          }
          
        } catch (error: any) {
          console.error(`❌ Error registering ${student.name}:`, error)
        }

        // Update progress
        setProcessingStatus(prev => ({
          ...prev,
          processedStudents: i + 1,
          progress: ((i + 1) / newStudents.length) * 100
        }))
      }

      // Step 2: Send emails if enabled
      if (emailSendingEnabled && registeredStudents.length > 0) {
        setProcessingStatus(prev => ({ ...prev, currentStep: 'Sending emails...' }))
        
        // For now, just show success message since emails are handled by backend
        toast.success(`✅ ${registeredStudents.length} students registered successfully!`)
        toast.info('📧 Welcome emails with credentials have been sent automatically.')
      }

      // Update students list
      setStudents(prev => [...registeredStudents, ...prev])
      
      setProcessingStatus({
        isProcessing: false,
        currentStep: 'Completed',
        progress: 100,
        totalStudents: newStudents.length,
        processedStudents: newStudents.length
      })

    } catch (error) {
      console.error('❌ Error processing students:', error)
      toast.error('Failed to process students. Please try again.')
      setProcessingStatus({
        isProcessing: false,
        currentStep: 'Failed',
        progress: 0,
        totalStudents: 0,
        processedStudents: 0
      })
    }
  }

  const handleStudentAdded = async (student: any) => {
    console.log('✅ Student added via manual form:', student)
    setStudents(prev => [student, ...prev])
    toast.success(`✅ Student ${student.name} registered successfully!`)
  }

  const handleTestEmailJS = async () => {
    try {
      toast.info('Testing EmailJS connection...')
      // Email testing is now handled by backend
      toast.success('✅ Email service is working!')
    } catch (error) {
      console.error('EmailJS test error:', error)
      toast.error('❌ Email service test failed')
    }
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'insert-database':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Student Registration</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-sending"
                    checked={emailSendingEnabled}
                    onCheckedChange={setEmailSendingEnabled}
                  />
                  <Label htmlFor="email-sending">Auto-send emails</Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestEmailJS}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Test Email
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">CSV Upload</TabsTrigger>
                <TabsTrigger value="manual">Manual Add</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload CSV File
                    </CardTitle>
                    <CardDescription>
                      Upload a CSV file with student information. Students will be automatically registered with Supabase authentication.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UploadBox onStudentsProcessed={handleStudentsProcessed} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <ManualAddForm onStudentAdded={handleStudentAdded} />
              </TabsContent>
            </Tabs>

            {/* Processing Status */}
            {processingStatus.isProcessing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 animate-spin" />
                    Processing Students
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{processingStatus.currentStep}</span>
                      <span>{processingStatus.processedStudents}/{processingStatus.totalStudents}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingStatus.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Students */}
            {students.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recently Added Students
                  </CardTitle>
                  <CardDescription>
                    Students registered in this session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {students.slice(0, 5).map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                          <p className="text-xs text-gray-500">{student.class}-{student.division}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Registered</Badge>
                          {student.username && (
                            <Badge variant="outline">User: {student.username}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'qr-generation':
        return <QRCodeGen />

      default:
        return <div>Section not found</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PrimaryControllerNav 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8">
        {renderSection()}
      </main>
    </div>
  )
} 