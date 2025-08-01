'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { toast } from 'react-toastify'
import { Upload, UserPlus, Mail, QrCode } from 'lucide-react'

// Student data validation schema
const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  class: z.string().min(1, 'Class is required'),
  division: z.string().min(1, 'Division is required'),
  parentName: z.string().min(2, 'Parent name must be at least 2 characters'),
  place: z.string().min(2, 'Place must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  rollNumber: z.string().optional(),
  phone: z.string().optional()
})

export type StudentData = z.infer<typeof studentSchema>

interface ProcessedStudent extends StudentData {
  id: string
  username: string
  password: string
  qrCode?: string
}

interface StudentDataUploaderProps {
  onStudentsProcessed: (students: ProcessedStudent[]) => void
  onEmailExtraction?: (emails: string[]) => void
  emailSendingEnabled?: boolean
}

export default function StudentDataUploader({ onStudentsProcessed, onEmailExtraction, emailSendingEnabled = true }: StudentDataUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<StudentData>({
    resolver: zodResolver(studentSchema)
  })

  // Generate username and password for a student
  const generateCredentials = (student: StudentData): { username: string; password: string } => {
    const username = student.name.toLowerCase().replace(/\s+/g, '')
    const randomNum = Math.floor(Math.random() * 9901) + 100
    const password = student.name.split(' ')[0] + randomNum
    return { username, password }
  }

  // Process CSV data
  const processCSVData = (data: any[]): ProcessedStudent[] => {
    const emails: string[] = []
    
    const processedStudents = data.map((row, index) => {
      // Handle different possible column names
      const name = row.name || row.Name || row.NAME || row['Student Name'] || row['student name'] || ''
      const studentClass = row.class || row.Class || row.CLASS || row['Class'] || row['Grade'] || row.grade || ''
      const division = row.division || row.Division || row.DIVISION || row['Division'] || row['Section'] || row.section || ''
      const parentName = row.parentName || row['Parent Name'] || row['parent name'] || row.parent || row.Parent || ''
      const place = row.place || row.Place || row.PLACE || row['Place'] || row.location || row.Location || ''
      const email = row.email || row.Email || row.EMAIL || row['Email Address'] || row['email address'] || ''
      const rollNumber = row.rollNumber || row['Roll Number'] || row['roll number'] || row.roll || row.Roll || ''
      const phone = row.phone || row.Phone || row.PHONE || row['Phone Number'] || row['phone number'] || ''

      // Validate required fields
      if (!name || !studentClass || !division || !parentName || !place || !email) {
        throw new Error(`Row ${index + 1}: Missing required fields. Please check your CSV format.`)
      }

      // Extract email for the callback
      if (email && !emails.includes(email)) {
        emails.push(email)
      }

      const studentData: StudentData = {
        name,
        class: studentClass,
        division,
        parentName,
        place,
        email,
        rollNumber,
        phone
      }

      const { username, password } = generateCredentials(studentData)
      
      return {
        ...studentData,
        id: `student_${Date.now()}_${index}`,
        username,
        password,
        // About Me Lab fields
        bio: '',
        mission: '',
        skills: [],
        location: studentData.place,
        // Stats fields
        totalPoints: 0,
        certificatesCompleted: 0,
        eventsAttended: 0,
        projectsSubmitted: 0,
        leadershipPositions: [],
        timeline: []
      }
    })

    // Call the email extraction callback
    if (onEmailExtraction && emails.length > 0) {
      onEmailExtraction(emails)
    }

    return processedStudents
  }

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploadedFile(file)
    setIsProcessing(true)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processedStudents = processCSVData(results.data)
          onStudentsProcessed(processedStudents)
          toast.success(`Successfully processed ${processedStudents.length} students from CSV`)
        } catch (error: any) {
          toast.error(error.message)
        } finally {
          setIsProcessing(false)
        }
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`)
        setIsProcessing(false)
      }
    })
  }, [onStudentsProcessed])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  })

  // Handle manual form submission
  const onManualSubmit = (data: StudentData) => {
    const { username, password } = generateCredentials(data)
    
    const processedStudent: ProcessedStudent = {
      ...data,
      id: `student_${Date.now()}`,
      username,
      password
    }

    onStudentsProcessed([processedStudent])
    reset()
    toast.success('Student added successfully')
  }

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Upload Student Data (CSV)</h3>
        </div>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isProcessing ? (
            <p className="text-gray-600">Processing CSV file...</p>
          ) : isDragActive ? (
            <p className="text-blue-600">Drop the CSV file here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag and drop a CSV file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: CSV, XLS, XLSX
              </p>
            </div>
          )}
        </div>

        {uploadedFile && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              File uploaded: {uploadedFile.name}
            </p>
          </div>
        )}
      </Card>

      {/* Manual Entry Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Add Student Manually</h3>
        </div>

        <form onSubmit={handleSubmit(onManualSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Student Name *</label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter student name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Class *</label>
              <input
                {...register('class')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
              />
              {errors.class && (
                <p className="text-red-500 text-sm mt-1">{errors.class.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Division *</label>
              <input
                {...register('division')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., A"
              />
              {errors.division && (
                <p className="text-red-500 text-sm mt-1">{errors.division.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Parent Name *</label>
              <input
                {...register('parentName')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter parent name"
              />
              {errors.parentName && (
                <p className="text-red-500 text-sm mt-1">{errors.parentName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Place *</label>
              <input
                {...register('place')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter place"
              />
              {errors.place && (
                <p className="text-red-500 text-sm mt-1">{errors.place.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Roll Number</label>
              <input
                {...register('rollNumber')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter roll number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                {...register('phone')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <Button type="submit" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Student
          </Button>
        </form>
      </Card>
    </div>
  )
} 