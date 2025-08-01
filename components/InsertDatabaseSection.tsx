'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  Mail, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Send,
  Database,
  Settings,
  UserPlus
} from 'lucide-react'
import { toast } from 'react-toastify'
import StudentDataUploader from './StudentDataUploader'
import ManualStudentForm from './ManualStudentForm'
import { sendBulkStudentEmails } from '@/lib/studentEmailService'
import { storeBulkPrimaryData } from '@/lib/primaryDataStorage'
import { generateStudentLoginQR } from '@/lib/qrCodeUtils'
// Removed Firebase auth imports

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

export default function InsertDatabaseSection() {
  const [activeTab, setActiveTab] = useState('csv-upload')
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    currentStep: '',
    progress: 0,
    totalStudents: 0,
    processedStudents: 0
  })
  const [emailResults, setEmailResults] = useState<EmailResult[]>([])
  const [extractedEmails, setExtractedEmails] = useState<string[]>([])
  const [emailSendingEnabled, setEmailSendingEnabled] = useState(true)

  const handleStudentsProcessed = async (students: any[]) => {
    if (students.length === 0) return

    setProcessingStatus({
      isProcessing: true,
      currentStep: 'Processing students...',
      progress: 0,
      totalStudents: students.length,
      processedStudents: 0
    })

    try {
      // Step 1: Store in Primary Data
      setProcessingStatus(prev => ({ ...prev, currentStep: 'Storing in Primary Data...' }))
      await storeBulkPrimaryData(students)
      
      // Step 2: Auth account creation removed - Firebase auth no longer available
      setProcessingStatus(prev => ({ ...prev, currentStep: 'Auth accounts skipped...' }))
      console.log('Auth account creation skipped - Firebase auth removed')

      // Step 3: Send emails if enabled
      if (emailSendingEnabled) {
        setProcessingStatus(prev => ({ ...prev, currentStep: 'Sending Emails...' }))
        const emailResults = await sendBulkStudentEmails(students)
        setEmailResults(emailResults)
        
        setProcessingStatus(prev => ({
          ...prev,
          progress: 100,
          currentStep: 'Complete!'
        }))
      } else {
        setProcessingStatus(prev => ({
          ...prev,
          progress: 100,
          currentStep: 'Complete!'
        }))
      }

      toast.success(`✅ Successfully processed ${students.length} students!`)
      
      // Reset after 3 seconds
      setTimeout(() => {
        setProcessingStatus({
          isProcessing: false,
          currentStep: '',
          progress: 0,
          totalStudents: 0,
          processedStudents: 0
        })
      }, 3000)

    } catch (error: any) {
      console.error('Error processing students:', error)
      toast.error(`❌ Error processing students: ${error.message}`)
      setProcessingStatus({
        isProcessing: false,
        currentStep: '',
        progress: 0,
        totalStudents: 0,
        processedStudents: 0
      })
    }
  }

  const handleEmailExtraction = (emails: string[]) => {
    setExtractedEmails(emails)
    toast.info(`📧 Extracted ${emails.length} email addresses from CSV`)
  }

  const handleSendEmailsToExtracted = async () => {
    if (extractedEmails.length === 0) {
      toast.warning('No emails to send to')
      return
    }

    setProcessingStatus({
      isProcessing: true,
      currentStep: 'Sending emails to extracted addresses...',
      progress: 0,
      totalStudents: extractedEmails.length,
      processedStudents: 0
    })

    try {
      const results = await sendBulkStudentEmails(
        extractedEmails.map(email => ({ email, name: email.split('@')[0] }))
      )
      setEmailResults(results)
      
      setProcessingStatus(prev => ({
        ...prev,
        progress: 100,
        currentStep: 'Emails sent!'
      }))

      toast.success(`✅ Sent emails to ${results.filter(r => r.success).length} recipients`)
      
      setTimeout(() => {
        setProcessingStatus({
          isProcessing: false,
          currentStep: '',
          progress: 0,
          totalStudents: 0,
          processedStudents: 0
        })
      }, 3000)

    } catch (error: any) {
      console.error('Error sending emails:', error)
      toast.error(`❌ Error sending emails: ${error.message}`)
      setProcessingStatus({
        isProcessing: false,
        currentStep: '',
        progress: 0,
        totalStudents: 0,
        processedStudents: 0
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Insert Database</h2>
          <p className="text-gray-600">Add students to the system via CSV upload</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Database className="h-4 w-4 mr-1" />
            Primary Data
          </Badge>
        </div>
      </div>

      {/* Processing Status */}
      {processingStatus.isProcessing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-medium text-blue-900">{processingStatus.currentStep}</p>
                <p className="text-sm text-blue-700">
                  {processingStatus.processedStudents} / {processingStatus.totalStudents} students
                </p>
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingStatus.progress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Results */}
      {emailResults.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Mail className="h-5 w-5" />
              Email Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {emailResults.map((result, index) => (
                <div key={index} className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    {result.email}: {result.success ? 'Sent' : result.error}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="csv-upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CSV Upload
          </TabsTrigger>
          <TabsTrigger value="manual-entry" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csv-upload" className="space-y-6">
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Email Settings
              </CardTitle>
              <CardDescription>
                Configure email sending options for uploaded students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Send Welcome Emails</p>
                  <p className="text-sm text-gray-600">
                    Automatically send emails with credentials and QR codes
                  </p>
                </div>
                <Button
                  variant={emailSendingEnabled ? "default" : "outline"}
                  onClick={() => setEmailSendingEnabled(!emailSendingEnabled)}
                  className="flex items-center gap-2"
                >
                  {emailSendingEnabled ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      Disabled
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* CSV Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Student Data
              </CardTitle>
              <CardDescription>
                Upload a CSV file containing student information. The system will automatically:
              </CardDescription>
              <div className="mt-2">
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Extract email addresses from the CSV</li>
                  <li>Generate usernames and passwords</li>
                  <li>Create QR codes for each student</li>
                  <li>Store data in Primary Data system</li>
                  <li>Create Firebase Auth accounts</li>
                  {emailSendingEnabled && <li>Send welcome emails with credentials</li>}
                </ul>
              </div>
            </CardHeader>
            <CardContent>
              <StudentDataUploader 
                onStudentsProcessed={handleStudentsProcessed}
                onEmailExtraction={handleEmailExtraction}
                emailSendingEnabled={emailSendingEnabled}
              />
            </CardContent>
          </Card>

          {/* Extracted Emails */}
          {extractedEmails.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Extracted Emails ({extractedEmails.length})
                </CardTitle>
                <CardDescription>
                  Email addresses found in the uploaded CSV file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {extractedEmails.map((email, index) => (
                      <Badge key={index} variant="secondary">
                        {email}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={handleSendEmailsToExtracted}
                    className="flex items-center gap-2"
                    disabled={processingStatus.isProcessing}
                  >
                    <Send className="h-4 w-4" />
                    Send Emails to All Extracted Addresses
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Manual Entry Tab */}
        <TabsContent value="manual-entry" className="space-y-6">
          {/* Manual Student Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add Student Manually
              </CardTitle>
              <CardDescription>
                Add individual students with their details. The system will automatically:
              </CardDescription>
              <div className="mt-2">
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Generate username and password</li>
                  <li>Create QR code for login</li>
                  <li>Store in Primary Data system</li>
                  <li>Create Firebase Auth account</li>
                  {emailSendingEnabled && <li>Send welcome email with credentials</li>}
                </ul>
              </div>
            </CardHeader>
            <CardContent>
              <ManualStudentForm 
                onStudentAdded={handleStudentsProcessed}
                emailSendingEnabled={emailSendingEnabled}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 