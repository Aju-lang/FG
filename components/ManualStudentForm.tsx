'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  UserPlus, 
  Mail, 
  BookOpen, 
  Users, 
  MapPin, 
  Phone,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-toastify'
import { storePrimaryDataStudent } from '@/lib/primaryDataStorage'
import { sendStudentWelcomeEmail } from '@/lib/studentEmailService'
import { generateStudentLoginQR } from '@/lib/qrCodeUtils'
// Removed Firebase auth imports

// Student data validation schema
const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  class: z.string().min(1, 'Class is required'),
  division: z.string().min(1, 'Division is required'),
  parentName: z.string().min(2, 'Parent name must be at least 2 characters'),
  place: z.string().min(2, 'Place must be at least 2 characters'),
  rollNumber: z.string().optional(),
  phone: z.string().optional()
})

type StudentFormData = z.infer<typeof studentSchema>

interface ManualStudentFormProps {
  onStudentAdded: (students: any[]) => void
  emailSendingEnabled?: boolean
}

export default function ManualStudentForm({ onStudentAdded, emailSendingEnabled = true }: ManualStudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedStudent, setSubmittedStudent] = useState<any>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema)
  })

  // Generate username and password for a student
  const generateCredentials = (student: StudentFormData): { username: string; password: string } => {
    const username = student.name.toLowerCase().replace(/\s+/g, '')
    const randomNum = Math.floor(Math.random() * 9901) + 100
    const password = student.name.split(' ')[0] + randomNum
    return { username, password }
  }

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true)
    
    try {
      // Generate credentials
      const { username, password } = generateCredentials(data)
      
      // Create student object
      const student = {
        ...data,
        id: `student_${Date.now()}`,
        username,
        password,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null,
        emailSent: false,
        qrCode: null
      }

      // Step 1: Store in Primary Data
      await storePrimaryDataStudent(student)
      
      // Step 2: Auth account creation removed - Firebase auth no longer available
      console.log('Auth account creation skipped - Firebase auth removed')

      // Step 3: Send email if enabled
      if (emailSendingEnabled) {
        try {
          await sendStudentWelcomeEmail({
            name: student.name,
            email: student.email,
            username: student.username,
            password: student.password,
            class: student.class,
            division: student.division,
            parentName: student.parentName,
            place: student.place,
            studentId: student.id
          })
          
          // Update email sent status
          await storePrimaryDataStudent({
            ...student,
            emailSent: true
          })
        } catch (error: any) {
          console.error('Email sending failed:', error.message)
          toast.warning('Student added but email sending failed')
        }
      }

      // Step 4: Generate QR code
      try {
        const qrCodeDataUrl = await generateStudentLoginQR(
          student.username,
          student.password,
          student.id,
          student.name,
          student.class,
          student.division
        )
        
        // Update with QR code
        await storePrimaryDataStudent({
          ...student,
          qrCode: qrCodeDataUrl
        })
      } catch (error: any) {
        console.error('QR code generation failed:', error.message)
      }

      setSubmittedStudent(student)
      onStudentAdded([student])
      
      toast.success(`✅ Student ${student.name} added successfully!`)
      
      // Reset form after 3 seconds
      setTimeout(() => {
        reset()
        setSubmittedStudent(null)
      }, 3000)

    } catch (error: any) {
      console.error('Error adding student:', error)
      toast.error(`❌ Error adding student: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {submittedStudent && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Student Added Successfully!</h4>
                <p className="text-sm text-green-700">
                  {submittedStudent.name} has been added to the system.
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  <p><strong>Username:</strong> {submittedStudent.username}</p>
                  <p><strong>Password:</strong> {submittedStudent.password}</p>
                  <p><strong>Email:</strong> {submittedStudent.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter student's full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class">Class *</Label>
                <Input
                  id="class"
                  {...register('class')}
                  placeholder="e.g., 10"
                  className={errors.class ? 'border-red-500' : ''}
                />
                {errors.class && (
                  <p className="text-sm text-red-500 mt-1">{errors.class.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="division">Division *</Label>
                <Input
                  id="division"
                  {...register('division')}
                  placeholder="e.g., A"
                  className={errors.division ? 'border-red-500' : ''}
                />
                {errors.division && (
                  <p className="text-sm text-red-500 mt-1">{errors.division.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>
            
            <div>
              <Label htmlFor="parentName">Parent Name *</Label>
              <Input
                id="parentName"
                {...register('parentName')}
                placeholder="Enter parent's name"
                className={errors.parentName ? 'border-red-500' : ''}
              />
              {errors.parentName && (
                <p className="text-sm text-red-500 mt-1">{errors.parentName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="place">Place *</Label>
              <Input
                id="place"
                {...register('place')}
                placeholder="Enter place/city"
                className={errors.place ? 'border-red-500' : ''}
              />
              {errors.place && (
                <p className="text-sm text-red-500 mt-1">{errors.place.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input
                id="rollNumber"
                {...register('rollNumber')}
                placeholder="Enter roll number (optional)"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Enter phone number (optional)"
              />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Send Welcome Email</p>
                <p className="text-sm text-gray-600">
                  Automatically send email with credentials and QR code
                </p>
              </div>
              <Badge variant={emailSendingEnabled ? "default" : "secondary"}>
                {emailSendingEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding Student...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Add Student
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 