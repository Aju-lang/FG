'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { toast } from 'react-toastify'
import { 
  Users, 
  Mail, 
  QrCode, 
  Upload, 
  Download, 
  Trash2, 
  Eye,
  Send,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import StudentDataUploader from './StudentDataUploader'
import { 
  storeBulkPrimaryData, 
  getAllPrimaryDataStudents, 
  clearAllPrimaryData,
  updateEmailSentStatus,
  PrimaryDataStudent 
} from '@/lib/primaryDataStorage'
import { sendBulkStudentEmails, sendStudentWelcomeEmail, StudentEmailData, testEmailJSConnection } from '@/lib/studentEmailService'
// Removed Firebase auth imports

interface ProcessedStudent {
  id: string
  name: string
  class: string
  division: string
  parentName: string
  place: string
  email: string
  username: string
  password: string
  rollNumber?: string
  phone?: string
}

export default function PrimaryControllerPanel() {
  const [students, setStudents] = useState<PrimaryDataStudent[]>([])
  const [processedStudents, setProcessedStudents] = useState<ProcessedStudent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [emailProgress, setEmailProgress] = useState(0)
  const [isSendingEmails, setIsSendingEmails] = useState(false)
  const [emailResults, setEmailResults] = useState<{ success: number; failed: number } | null>(null)
  const [authStats, setAuthStats] = useState({ authUsers: 0, firestoreUsers: 0, duplicates: 0 })
  const [emailToRemove, setEmailToRemove] = useState('')

  // Load existing students on component mount
  useEffect(() => {
    loadExistingStudents()
  }, [])

  const loadExistingStudents = async () => {
    try {
      const existingStudents = await getAllPrimaryDataStudents()
      setStudents(existingStudents)
      
      // Auth statistics removed - Firebase auth no longer available
      setAuthStats({
        authUsers: 0,
        firestoreUsers: 0,
        duplicates: 0
      })
    } catch (error) {
      console.error('Error loading existing students:', error)
    }
  }

  const handleStudentsProcessed = async (newStudents: ProcessedStudent[]) => {
    setProcessedStudents(newStudents)
    
    // Convert to PrimaryDataStudent format and store in Firebase
    const primaryDataStudents: PrimaryDataStudent[] = newStudents.map(student => ({
      id: student.id,
      name: student.name,
      class: student.class,
      division: student.division,
      parentName: student.parentName,
      place: student.place,
      email: student.email,
      username: student.username,
      password: student.password,
      rollNumber: student.rollNumber || '',
      phone: student.phone || '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null,
      emailSent: false,
      qrCode: null
    }))

    try {
      setIsLoading(true)
      
      // Step 1: Store in primary data storage
      await storeBulkPrimaryData(primaryDataStudents)
      toast.success(`✅ Stored ${newStudents.length} students in primary database`)
      
      // Auth account creation removed - Firebase auth no longer available
      toast.info('Authentication accounts creation skipped - Firebase auth removed')
      
      await loadExistingStudents() // Reload to get updated data
      
    } catch (error) {
      console.error('Error processing students:', error)
      toast.error('Failed to process students')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendEmails = async () => {
    if (processedStudents.length === 0) {
      toast.error('No students to send emails to')
      return
    }
    
    setIsSendingEmails(true)
    setEmailProgress(0)
    setEmailResults(null)

    try {
      console.log('📧 Starting bulk email send for', processedStudents.length, 'students')
      
      // Convert to email format
      const emailData: StudentEmailData[] = processedStudents.map(student => ({
            name: student.name,
            email: student.email,
        username: student.username,
        password: student.password,
            class: student.class,
            division: student.division,
            parentName: student.parentName,
        place: student.place,
        studentId: student.id
      }))

      const results = await sendBulkStudentEmails(
        emailData,
        (current, total) => {
          setEmailProgress((current / total) * 100)
        }
      )

      setEmailResults(results)
      
      // Update email sent status in database
      for (const student of processedStudents) {
        await updateEmailSentStatus(student.id, true)
      }

      await loadExistingStudents() // Reload to get updated data
      
      if (results.success > 0) {
        toast.success(`Successfully sent ${results.success} emails`)
      }
      if (results.failed > 0) {
        toast.error(`Failed to send ${results.failed} emails. Check console for details.`)
      }
    } catch (error: any) {
      console.error('❌ Error sending emails:', error)
      toast.error(`Error sending emails: ${error.message}`)
    } finally {
      setIsSendingEmails(false)
    }
  }

  const handleSendSingleEmail = async (student: ProcessedStudent) => {
    try {
      console.log('📧 Sending single email to:', student.email)
      
      const emailData: StudentEmailData = {
          name: student.name,
          email: student.email,
        username: student.username,
        password: student.password,
          class: student.class,
          division: student.division,
          parentName: student.parentName,
        place: student.place,
        studentId: student.id
      }

      await sendStudentWelcomeEmail(emailData)
      await updateEmailSentStatus(student.id, true)
      await loadExistingStudents()
      
      toast.success(`Email sent to ${student.name}`)
    } catch (error: any) {
      console.error('❌ Error sending email:', error)
      toast.error(`Failed to send email to ${student.name}: ${error.message}`)
    }
  }

  const handleClearAllData = async () => {
    if (!confirm('Are you sure you want to clear all student data? This action cannot be undone.')) {
      return
    }
    
    try {
      setIsLoading(true)
      await clearAllPrimaryData()
      setStudents([])
      setProcessedStudents([])
      toast.success('All student data cleared successfully')
    } catch (error) {
      console.error('Error clearing data:', error)
      toast.error('Failed to clear student data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveDuplicates = async () => {
    if (!confirm('Are you sure you want to remove duplicate auth accounts? This will keep the oldest account for each email.')) {
      return
    }
    
    setIsLoading(true)
    try {
      const result = await removeDuplicateAuthAccounts()
      if (result.removed > 0) {
        toast.success(`Removed ${result.removed} duplicate auth accounts`)
      }
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} errors occurred during cleanup`)
        console.error('Cleanup errors:', result.errors)
      }
      await loadExistingStudents() // Reload data
    } catch (error) {
      console.error('Error removing duplicates:', error)
      toast.error('Failed to remove duplicates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveEmail = async () => {
    if (!emailToRemove || !confirm(`Are you sure you want to remove ALL auth accounts for ${emailToRemove}?`)) {
      return
    }

    setIsLoading(true)
    try {
      const result = await removeAllAuthAccountsForEmail(emailToRemove)
      if (result.removed > 0) {
        toast.success(`Removed ${result.removed} auth accounts for ${emailToRemove}`)
        setEmailToRemove('')
      }
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} errors occurred`)
        console.error('Removal errors:', result.errors)
      }
      await loadExistingStudents() // Reload data
    } catch (error) {
      console.error('Error removing email:', error)
      toast.error('Failed to remove email accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickRemoveSpecificEmail = async () => {
    const specificEmail = 'ab.mi.manapalli.mp@gmail.com'
    if (!confirm(`Are you sure you want to remove ALL auth accounts for ${specificEmail}?`)) {
      return
    }

    setIsLoading(true)
    try {
      const result = await removeAllAuthAccountsForEmail(specificEmail)
      if (result.removed > 0) {
        toast.success(`Removed ${result.removed} auth accounts for ${specificEmail}`)
      } else {
        toast.info(`No auth accounts found for ${specificEmail}`)
      }
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} errors occurred`)
        console.error('Removal errors:', result.errors)
      }
      await loadExistingStudents() // Reload data
    } catch (error) {
      console.error('Error removing specific email:', error)
      toast.error('Failed to remove email accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveAllProblematicEmails = async () => {
    const problematicEmails = [
      'ab.mi.manapalli.mp@gmail.com',
      'abshirmidlaj8@gmail.com',
      'stevezone93@gmail.com',
      'raihanaayyoli@gmail.com'
    ]
    
    if (!confirm(`Are you sure you want to remove ALL auth accounts for ${problematicEmails.length} problematic emails?\n\n${problematicEmails.join('\n')}`)) {
      return
    }

    setIsLoading(true)
    let totalRemoved = 0
    const errors: string[] = []

    try {
      for (const email of problematicEmails) {
        try {
          const result = await removeAllAuthAccountsForEmail(email)
          if (result.removed > 0) {
            totalRemoved += result.removed
            console.log(`Removed ${result.removed} auth accounts for ${email}`)
          }
          if (result.errors.length > 0) {
            errors.push(...result.errors)
          }
        } catch (error: any) {
          errors.push(`Failed to remove ${email}: ${error.message}`)
        }
      }

      if (totalRemoved > 0) {
        toast.success(`Successfully removed ${totalRemoved} auth accounts for ${problematicEmails.length} emails`)
      } else {
        toast.info('No auth accounts found for the specified emails')
      }
      
      if (errors.length > 0) {
        toast.warning(`${errors.length} errors occurred during cleanup`)
        console.error('Cleanup errors:', errors)
      }
      
      await loadExistingStudents() // Reload data
    } catch (error) {
      console.error('Error removing problematic emails:', error)
      toast.error('Failed to remove email accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestEmailJS = async () => {
    setIsLoading(true)
    try {
      const result = await testEmailJSConnection()
      if (result.success) {
        toast.success('✅ EmailJS connection test successful!')
      } else {
        toast.error(`❌ EmailJS test failed: ${result.error}`)
      }
    } catch (error: any) {
      console.error('Error testing EmailJS:', error)
      toast.error(`EmailJS test error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Primary Controller Dashboard</h1>
        <p className="text-gray-600">Manage student data, send emails, and monitor system status</p>
            </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
        </div>
              <Users className="h-8 w-8 text-blue-500" />
      </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold">
                  {students.filter(s => s.emailSent).length}
                      </p>
                    </div>
              <Mail className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold">
                  {students.filter(s => s.isActive).length}
                      </p>
                    </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Emails</p>
                <p className="text-2xl font-bold">
                  {students.filter(s => !s.emailSent).length}
                      </p>
                    </div>
              <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
          </CardContent>
        </Card>
                    </div>

      {/* Auth Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Auth Users</p>
                <p className="text-2xl font-bold">{authStats.authUsers}</p>
                      </div>
              <Users className="h-8 w-8 text-purple-500" />
                      </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
                    <div>
                <p className="text-sm font-medium text-gray-600">Firestore Users</p>
                <p className="text-2xl font-bold">{authStats.firestoreUsers}</p>
                    </div>
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
                    
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
                    <div>
                <p className="text-sm font-medium text-gray-600">Duplicate Users</p>
                <p className="text-2xl font-bold">{authStats.duplicates}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
                    </div>
                    
      {/* Student Data Uploader */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Student Data
          </CardTitle>
          <CardDescription>
            Upload CSV file or add students manually. Each student will get unique credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentDataUploader
            onStudentsProcessed={handleStudentsProcessed}
            onEmailSent={handleSendSingleEmail}
          />
        </CardContent>
      </Card>

      {/* Email Management */}
      {processedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Management
            </CardTitle>
            <CardDescription>
              Send welcome emails with login credentials and QR codes to students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* EmailJS Test */}
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-blue-800">Test EmailJS Connection</h4>
                <p className="text-sm text-blue-600">
                  Test if EmailJS is working with current configuration
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleTestEmailJS}
                disabled={isLoading}
                size="sm"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Test EmailJS
              </Button>
                    </div>
                    
            {/* Email Progress */}
            {isSendingEmails && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sending emails...</span>
                  <span>{Math.round(emailProgress)}%</span>
                    </div>
                <Progress value={emailProgress} className="w-full" />
                  </div>
            )}

            {/* Email Results */}
            {emailResults && (
              <div className="flex gap-4">
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {emailResults.success} Sent
                </Badge>
                {emailResults.failed > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {emailResults.failed} Failed
                  </Badge>
                )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSendEmails}
                disabled={isSendingEmails}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send All Emails ({processedStudents.length})
              </Button>
                    </div>
          </CardContent>
        </Card>
      )}

                {/* Students Table */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Students ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Class</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Username</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Email Sent</th>
                    <th className="text-left p-2">Last Login</th>
                    <th className="text-left p-2">Actions</th>
                          </tr>
                        </thead>
                <tbody>
                          {students.map((student) => (
                    <tr key={student.id} className="border-b">
                      <td className="p-2 font-medium">{student.name}</td>
                      <td className="p-2">{student.class}-{student.division}</td>
                      <td className="p-2 text-xs">{student.email}</td>
                      <td className="p-2 font-mono text-xs">{student.username}</td>
                      <td className="p-2">
                        <Badge variant={student.isActive ? "default" : "secondary"}>
                          {student.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant={student.emailSent ? "default" : "destructive"}>
                          {student.emailSent ? "Sent" : "Pending"}
                        </Badge>
                      </td>
                      <td className="p-2 text-xs">
                        {student.lastLogin 
                          ? new Date(student.lastLogin).toLocaleDateString()
                          : "Never"
                        }
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                                    onClick={() => {
                              const processedStudent = processedStudents.find(s => s.id === student.id)
                              if (processedStudent) {
                                handleSendSingleEmail(processedStudent)
                              }
                            }}
                            disabled={student.emailSent}
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Navigate to student's About Me Lab
                              window.open(`/about-me/${student.id}`, '_blank')
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
          </CardContent>
        </Card>
      )}

      {/* Auth Cleanup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="h-5 w-5" />
            Auth System Cleanup
          </CardTitle>
          <CardDescription>
            Manage duplicate auth accounts and clean up the authentication system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Remove Duplicates */}
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <div>
              <h4 className="font-medium">Remove Duplicate Auth Accounts</h4>
              <p className="text-sm text-gray-600">
                Remove duplicate accounts, keeping the oldest one for each email
              </p>
                    </div>
            <Button
              variant="outline"
              onClick={handleRemoveDuplicates}
              disabled={isLoading || authStats.duplicates === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Remove Duplicates ({authStats.duplicates})
            </Button>
              </div>

          {/* Quick Remove Specific Email */}
          <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-red-800">Quick Remove: ab.mi.manapalli.mp@gmail.com</h4>
              <p className="text-sm text-red-600">
                Remove all auth accounts for the problematic email
              </p>
                </div>
            <Button
              variant="destructive"
              onClick={handleQuickRemoveSpecificEmail}
              disabled={isLoading}
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Remove This Email
            </Button>
                  </div>
                  
          {/* Remove All Problematic Emails */}
          <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-red-800">Remove All Problematic Emails</h4>
              <p className="text-sm text-red-600">
                Remove all auth accounts for multiple problematic email addresses
              </p>
              <div className="mt-2 text-xs text-red-500">
                <strong>Emails to remove:</strong><br />
                • ab.mi.manapalli.mp@gmail.com<br />
                • abshirmidlaj8@gmail.com<br />
                • stevezone93@gmail.com<br />
                • raihanaayyoli@gmail.com
                  </div>
                </div>
            <Button
              variant="destructive"
              onClick={handleRemoveAllProblematicEmails}
              disabled={isLoading}
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Remove All Problematic Emails
            </Button>
              </div>

          {/* Remove Specific Email */}
          <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium">Remove Specific Email</h4>
              <p className="text-sm text-gray-600">
                Remove all auth accounts for a specific email address
              </p>
                      </div>
            <div className="flex gap-2">
                        <input
                type="email"
                value={emailToRemove}
                onChange={(e) => setEmailToRemove(e.target.value)}
                placeholder="Enter email to remove"
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Button
                variant="destructive"
                onClick={handleRemoveEmail}
                disabled={!emailToRemove || isLoading}
                size="sm"
              >
                Remove
              </Button>
              </div>
              </div>
        </CardContent>
      </Card>

      {/* Custom Auth Debug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Eye className="h-5 w-5" />
            Custom Auth Debug
          </CardTitle>
          <CardDescription>
            Debug and test the custom authentication system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                const students = authDebugUtils.getAllCustomStudents()
                console.log('Custom Auth Students:', students)
                toast.info(`Found ${students.length} students in custom auth`)
              }}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Custom Auth Students
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                authDebugUtils.clearAllAuthData()
                toast.success('All auth data cleared')
              }}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Auth Data
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Custom Auth System:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Stores students in localStorage for immediate access</li>
              <li>Supports username/password login</li>
              <li>Works with QR code login</li>
              <li>Independent of Firebase Auth</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Clear Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Clear all student data from the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleClearAllData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All Student Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}