'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Save, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import { authAPI } from '@/lib/api'
import { sendStudentWelcomeEmail } from '@/lib/emailService'

const studentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  class: z.string().min(1, 'Class is required'),
  division: z.string().min(1, 'Division is required'),
  parentName: z.string().min(1, 'Parent name is required'),
  place: z.string().min(1, 'Place is required'),
  email: z.string().email('Valid email is required'),
  rollNumber: z.string().optional(),
  phone: z.string().optional()
})

type StudentFormData = z.infer<typeof studentSchema>

interface ManualAddFormProps {
  onStudentAdded: (student: any) => void
}

export default function ManualAddForm({ onStudentAdded }: ManualAddFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema)
  })

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true)
    
    try {
      console.log('📤 Registering student via backend API...')
      
      // Call the backend registration API
      const response = await authAPI.register({
        name: data.name,
        email: data.email,
        class: data.class,
        division: data.division,
        parentName: data.parentName,
        place: data.place,
        rollNumber: data.rollNumber || '',
        phone: data.phone || ''
      })

      if (response.success) {
        console.log('✅ Student registered successfully:', response.student)
        
        // Send welcome email
        try {
          await sendStudentWelcomeEmail({
            id: response.student.id,
            name: response.student.name,
            username: response.student.username,
            password: response.student.password,
            email: response.student.email,
            class: data.class,
            division: data.division,
            parentName: data.parentName,
            place: data.place
          })
          console.log('✅ Welcome email sent successfully')
        } catch (emailError) {
          console.warn('⚠️ Email sending failed:', emailError)
          // Don't fail the registration if email fails
        }
        
        // Call the callback with the registered student data
        onStudentAdded(response.student)
        reset()
        toast.success(`✅ Student ${data.name} registered successfully! Welcome email sent.`)
      } else {
        throw new Error(response.message || 'Registration failed')
      }
      
    } catch (error: any) {
      console.error('❌ Error registering student:', error)
      toast.error(`❌ Failed to register student: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add Student Manually
        </CardTitle>
        <CardDescription>
          Enter student information manually. Student will be registered with Supabase authentication and receive login credentials via email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter student's full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter student's email"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Class */}
            <div>
              <Label htmlFor="class">Class</Label>
              <Input
                id="class"
                {...register('class')}
                placeholder="e.g., 10, 11, 12"
                className={errors.class ? 'border-red-500' : ''}
              />
              {errors.class && (
                <p className="mt-1 text-sm text-red-600">{errors.class.message}</p>
              )}
            </div>

            {/* Division */}
            <div>
              <Label htmlFor="division">Division</Label>
              <Input
                id="division"
                {...register('division')}
                placeholder="e.g., A, B, C"
                className={errors.division ? 'border-red-500' : ''}
              />
              {errors.division && (
                <p className="mt-1 text-sm text-red-600">{errors.division.message}</p>
              )}
            </div>

            {/* Parent Name */}
            <div>
              <Label htmlFor="parentName">Parent Name</Label>
              <Input
                id="parentName"
                {...register('parentName')}
                placeholder="Enter parent's name"
                className={errors.parentName ? 'border-red-500' : ''}
              />
              {errors.parentName && (
                <p className="mt-1 text-sm text-red-600">{errors.parentName.message}</p>
              )}
            </div>

            {/* Place */}
            <div>
              <Label htmlFor="place">Place</Label>
              <Input
                id="place"
                {...register('place')}
                placeholder="Enter place/city"
                className={errors.place ? 'border-red-500' : ''}
              />
              {errors.place && (
                <p className="mt-1 text-sm text-red-600">{errors.place.message}</p>
              )}
            </div>

            {/* Roll Number */}
            <div>
              <Label htmlFor="rollNumber">Roll Number (Optional)</Label>
              <Input
                id="rollNumber"
                {...register('rollNumber')}
                placeholder="Enter roll number"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Registering Student...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Register Student
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 