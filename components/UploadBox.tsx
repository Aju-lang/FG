'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Users, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'react-toastify'

interface StudentData {
  name: string
  class: string
  division: string
  parentName: string
  place: string
  email: string
}

interface UploadBoxProps {
  onStudentsProcessed: (students: any[]) => void
}

export default function UploadBox({ onStudentsProcessed }: UploadBoxProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [processedStudents, setProcessedStudents] = useState<any[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0])
      processFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  const processFile = async (file: File) => {
    setIsProcessing(true)
    
    try {
      if (file.type === 'text/csv') {
        await processCSV(file)
      } else if (file.type === 'application/pdf') {
        await processPDF(file)
      } else {
        toast.error('Unsupported file type. Please upload CSV or PDF.')
      }
    } catch (error) {
      console.error('Error processing file:', error)
      toast.error('Error processing file. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const processCSV = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const students = results.data.map((row: any, index: number) => {
              // Validate required fields
              if (!row.Name || !row.Class || !row.Division || !row['Parent Name'] || !row.Place || !row.Email) {
                throw new Error(`Row ${index + 1}: Missing required fields`)
              }

              // Generate credentials
              const username = row.Name.replace(/\s+/g, '').toLowerCase()
              const randomNum = Math.floor(Math.random() * 9901) + 100 // 100-10000
              const password = `${row.Name.replace(/\s+/g, '')}${randomNum}`

              return {
                id: `student_${Date.now()}_${index}`,
                name: row.Name,
                class: row.Class,
                division: row.Division,
                parentName: row['Parent Name'],
                place: row.Place,
                email: row.Email,
                username,
                password,
                createdAt: new Date().toISOString()
              }
            })

            setProcessedStudents(students)
            onStudentsProcessed(students)
            toast.success(`✅ Successfully processed ${students.length} students`)
            resolve()
          } catch (error) {
            reject(error)
          }
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  }

  const processPDF = async (file: File): Promise<void> => {
    // For now, we'll show a message that PDF processing is not implemented
    toast.info('PDF processing will be implemented soon. Please use CSV files for now.')
    throw new Error('PDF processing not implemented')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Student Data
        </CardTitle>
        <CardDescription>
          Upload a CSV file with student information. Required columns: Name, Class, Division, Parent Name, Place, Email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Drop the file here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag & drop a CSV file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports: CSV files with student data
              </p>
            </div>
          )}
        </div>

        {uploadedFile && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">
                {uploadedFile.name} uploaded successfully
              </span>
            </div>
            {processedStudents.length > 0 && (
              <div className="mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Users className="h-4 w-4 mr-1" />
                  {processedStudents.length} students processed
                </Badge>
              </div>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-800">Processing file...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 