'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StudentDataUploader from '@/components/StudentDataUploader'
import { toast } from 'react-toastify'
import { 
  Users, 
  Mail, 
  QrCode, 
  Database, 
  Download, 
  Trash2, 
  Eye,
  Send,
  RefreshCw
} from 'lucide-react'
import { 
  storeBulkPrimaryData, 
  getAllPrimaryDataStudents, 
  clearAllPrimaryData,
  updateEmailSentStatus,
  PrimaryDataStudent 
} from '@/lib/primaryDataStorage'
import { 
  sendBulkStudentEmails, 
  sendStudentWelcomeEmail,
  sendTestEmail,
  StudentEmailData 
} from '@/lib/studentEmailService'
import { generateStudentLoginQR } from '@/lib/qrCodeUtils'

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
  qrCode?: string
}

export default function StudentManagerPage() {
  const [students, setStudents] = useState<ProcessedStudent[]>([])
  const [storedStudents, setStoredStudents] = useState<PrimaryDataStudent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingEmails, setIsSendingEmails] = useState(false)
  const [emailProgress, setEmailProgress] = useState<{ current: number; total: number; student: string }>({ current: 0, total: 0, student: '' })

  // Load existing students from database
  const loadStoredStudents = async () => {
    setIsLoading(true)
    try {
      const stored = await getAllPrimaryDataStudents()
      setStoredStudents(stored)
      toast.success(`Loaded ${stored.length} stored students`)
    } catch (error) {
      toast.error('Failed to load students from database')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStoredStudents()
  }, [])

  // Handle students processed from uploader
  const handleStudentsProcessed = async (processedStudents: ProcessedStudent[]) => {
    setStudents(processedStudents)
    
    // Generate QR codes for each student
    const studentsWithQR = await Promise.all(
      processedStudents.map(async (student) => {
        try {
          const qrCode = await generateStudentLoginQR(
            student.username,
            student.password,
            student.id,
            student.name,
            student.class,
            student.division
          )
          return { ...student, qrCode }
        } catch (error) {
          console.error(`Failed to generate QR for ${student.name}:`, error)
          return student
        }
      })
    )
    
    setStudents(studentsWithQR)
    toast.success(`Processed ${studentsWithQR.length} students with QR codes`)
  }

  // Store students to database
  const storeStudentsToDatabase = async () => {
    if (students.length === 0) {
      toast.error('No students to store')
      return
    }

    setIsLoading(true)
    try {
      const primaryDataStudents: PrimaryDataStudent[] = students.map(student => ({
        ...student,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailSent: false
      }))

      const result = await storeBulkPrimaryData(
        primaryDataStudents,
        (completed, total, currentStudent) => {
          console.log(`Storing ${completed}/${total}: ${currentStudent}`)
        }
      )

      toast.success(`✅ Stored ${result.successful} students, ${result.failed} failed`)
      
      if (result.failed > 0) {
        result.results.forEach(r => {
          if (!r.success) {
            toast.error(`Failed to store ${r.student}: ${r.error}`)
          }
        })
      }

      // Refresh stored students
      await loadStoredStudents()
      
    } catch (error) {
      toast.error('Failed to store students to database')
    } finally {
      setIsLoading(false)
    }
  }

  // Send emails to students
  const sendEmailsToStudents = async (studentsToEmail: ProcessedStudent[] = students) => {
    if (studentsToEmail.length === 0) {
      toast.error('No students to send emails to')
      return
    }

    setIsSendingEmails(true)
    try {
      const emailData: StudentEmailData[] = studentsToEmail.map(student => ({
        id: student.id,
        name: student.name,
        class: student.class,
        division: student.division,
        parentName: student.parentName,
        place: student.place,
        email: student.email,
        username: student.username,
        password: student.password,
        rollNumber: student.rollNumber,
        phone: student.phone
      }))

      const result = await sendBulkStudentEmails(
        emailData,
        (completed, total, currentStudent) => {
          setEmailProgress({ current: completed, total, student: currentStudent })
        }
      )

      toast.success(`📧 Sent ${result.successful} emails, ${result.failed} failed`)
      
      if (result.failed > 0) {
        result.results.forEach(r => {
          if (!r.success) {
            toast.error(`Failed to send email to ${r.student}: ${r.error}`)
          }
        })
      }

      // Update email sent status in database
      for (const student of studentsToEmail) {
        await updateEmailSentStatus(student.id, true)
      }

      await loadStoredStudents()
      
    } catch (error) {
      toast.error('Failed to send emails')
    } finally {
      setIsSendingEmails(false)
      setEmailProgress({ current: 0, total: 0, student: '' })
    }
  }

  // Send email to individual student
  const sendIndividualEmail = async (student: ProcessedStudent | PrimaryDataStudent) => {
    try {
      const emailData: StudentEmailData = {
        id: student.id,
        name: student.name,
        class: student.class,
        division: student.division,
        parentName: student.parentName,
        place: student.place,
        email: student.email,
        username: student.username,
        password: student.password,
        rollNumber: student.rollNumber,
        phone: student.phone
      }

      const success = await sendStudentWelcomeEmail(emailData)
      
      if (success) {
        toast.success(`📧 Email sent to ${student.name}`)
        await updateEmailSentStatus(student.id, true)
        await loadStoredStudents()
      } else {
        toast.error(`Failed to send email to ${student.name}`)
      }
    } catch (error) {
      toast.error(`Error sending email to ${student.name}`)
    }
  }

  // Test email functionality
  const testEmailSystem = async () => {
    const testEmail = prompt('Enter email address to send test email:')
    if (!testEmail) return

    try {
      const success = await sendTestEmail(testEmail)
      if (success) {
        toast.success(`✅ Test email sent to ${testEmail}`)
      } else {
        toast.error(`❌ Failed to send test email`)
      }
    } catch (error) {
      toast.error('Error sending test email')
    }
  }

  // Clear all data
  const clearAllData = async () => {
    const confirmed = window.confirm(
      '⚠️ This will delete ALL student data from the database. This action cannot be undone. Are you sure?'
    )
    
    if (!confirmed) return

    setIsLoading(true)
    try {
      await clearAllPrimaryData()
      setStoredStudents([])
      setStudents([])
      toast.success('🗑️ All student data cleared')
    } catch (error) {
      toast.error('Failed to clear data')
    } finally {
      setIsLoading(false)
    }
  }

  // Download student data as CSV
  const downloadStudentData = () => {
    const dataToDownload = students.length > 0 ? students : storedStudents
    if (dataToDownload.length === 0) {
      toast.error('No data to download')
      return
    }

    const csvData = dataToDownload.map(s => ({
      name: s.name,
      class: s.class,
      division: s.division,
      parentName: s.parentName,
      place: s.place,
      email: s.email,
      username: s.username,
      password: s.password,
      rollNumber: s.rollNumber || '',
      phone: s.phone || ''
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `student_credentials_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Data Manager</h1>
          <p className="text-gray-600">Upload, manage, and distribute student credentials</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testEmailSystem}>
            <Mail className="w-4 h-4 mr-2" />
            Test Email
          </Button>
          <Button variant="outline" onClick={loadStoredStudents} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">New Students</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Stored Students</p>
              <p className="text-2xl font-bold">{storedStudents.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Emails Sent</p>
              <p className="text-2xl font-bold">
                {storedStudents.filter(s => s.emailSent).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">QR Codes</p>
              <p className="text-2xl font-bold">
                {students.filter(s => s.qrCode).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Email Progress */}
      {isSendingEmails && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sending Emails...</span>
              <span className="text-sm text-gray-600">
                {emailProgress.current}/{emailProgress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(emailProgress.current / emailProgress.total) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              Current: {emailProgress.student}
            </p>
          </div>
        </Card>
      )}

      {/* Student Data Uploader */}
      <StudentDataUploader 
        onStudentsProcessed={handleStudentsProcessed}
        onEmailSent={sendIndividualEmail}
      />

      {/* Actions for new students */}
      {students.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Actions for New Students</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={storeStudentsToDatabase}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Store to Database
            </Button>
            
            <Button 
              onClick={() => sendEmailsToStudents()}
              disabled={isSendingEmails}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send All Emails
            </Button>
            
            <Button 
              onClick={downloadStudentData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </Button>
          </div>
        </Card>
      )}

      {/* Stored Students */}
      {storedStudents.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Stored Students ({storedStudents.length})</h3>
            <div className="flex gap-2">
              <Button 
                onClick={() => sendEmailsToStudents(storedStudents.filter(s => !s.emailSent))}
                disabled={isSendingEmails}
                variant="outline"
                size="sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Missing Emails
              </Button>
              <Button 
                onClick={clearAllData}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Class</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Username</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {storedStudents.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{student.name}</td>
                    <td className="p-2">{student.class}-{student.division}</td>
                    <td className="p-2 text-xs">{student.email}</td>
                    <td className="p-2 font-mono text-xs">{student.username}</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Badge variant={student.isActive ? "default" : "secondary"}>
                          {student.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={student.emailSent ? "default" : "destructive"}>
                          {student.emailSent ? "Email Sent" : "No Email"}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        {!student.emailSent && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendIndividualEmail(student)}
                            className="flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/about-me/${student.id}`, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
} 