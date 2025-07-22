// lib/validationSchemas.ts - Zod validation schemas for API endpoints

import { z } from 'zod'

// ============================================================================
// USER VALIDATION SCHEMAS
// ============================================================================

export const createUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  role: z.enum(['student', 'admin'])
    .default('student'),
  qrCode: z.string()
    .min(1, 'QR code is required')
    .trim(),
  studentId: z.string()
    .optional()
    .refine((val) => {
      if (val === undefined) return true
      return val.length >= 3 && val.length <= 20
    }, 'Student ID must be between 3 and 20 characters'),
  grade: z.string()
    .optional()
    .refine((val) => {
      if (val === undefined) return true
      return ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].includes(val)
    }, 'Please enter a valid grade level')
})

export const updateUserSchema = createUserSchema.partial()

export const qrLoginSchema = z.object({
  qrCode: z.string()
    .min(1, 'QR code is required')
    .trim()
})

// ============================================================================
// CLASS VALIDATION SCHEMAS
// ============================================================================

export const createClassSchema = z.object({
  name: z.string()
    .min(3, 'Class name must be at least 3 characters')
    .max(100, 'Class name cannot exceed 100 characters')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .trim(),
  subject: z.string()
    .min(2, 'Subject must be at least 2 characters')
    .trim(),
  grade: z.string()
    .min(2, 'Grade is required')
    .trim(),
  teacher: z.string()
    .min(1, 'Teacher ID is required'),
  schedule: z.object({
    day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    startTime: z.string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)'),
    endTime: z.string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)'),
    room: z.string()
      .min(1, 'Room is required')
      .trim()
  }),
  maxStudents: z.number()
    .int('Maximum students must be a whole number')
    .min(1, 'Maximum students must be at least 1')
    .max(100, 'Maximum students cannot exceed 100')
})

export const updateClassSchema = createClassSchema.partial()

export const enrollStudentSchema = z.object({
  classId: z.string()
    .min(1, 'Class ID is required'),
  studentId: z.string()
    .min(1, 'Student ID is required')
})

// ============================================================================
// CERTIFICATE VALIDATION SCHEMAS
// ============================================================================

export const createCertificateSchema = z.object({
  name: z.string()
    .min(3, 'Certificate name must be at least 3 characters')
    .max(100, 'Certificate name cannot exceed 100 characters')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .trim(),
  type: z.enum(['achievement', 'completion', 'excellence', 'participation'])
    .default('achievement'),
  student: z.string()
    .min(1, 'Student ID is required'),
  awardedBy: z.string()
    .min(1, 'Awarded by ID is required'),
  class: z.string()
    .optional(),
  points: z.number()
    .int('Points must be a whole number')
    .min(0, 'Points cannot be negative')
    .default(0),
  imageUrl: z.string()
    .url('Please enter a valid URL')
    .optional(),
  expiresAt: z.string()
    .datetime('Please enter a valid date')
    .optional()
})

export const updateCertificateSchema = createCertificateSchema.partial()

// ============================================================================
// LEADERBOARD VALIDATION SCHEMAS
// ============================================================================

export const leaderboardQuerySchema = z.object({
  limit: z.string()
    .optional()
    .transform((val) => {
      if (!val) return 10
      const num = parseInt(val)
      return isNaN(num) ? 10 : Math.min(Math.max(num, 1), 50)
    }),
  grade: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true
      return ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].includes(val)
    }, 'Please enter a valid grade level')
})

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  role: z.enum(['student', 'controller'], {
    required_error: 'Please select a user type'
  }).default('student'),
  rememberMe: z.boolean().default(false)
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  role: z.enum(['student', 'admin'])
    .default('student')
})

// ============================================================================
// SEARCH AND FILTER SCHEMAS
// ============================================================================

export const searchQuerySchema = z.object({
  q: z.string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters')
    .trim(),
  type: z.enum(['users', 'classes', 'certificates'])
    .optional(),
  limit: z.string()
    .optional()
    .transform((val) => {
      if (!val) return 10
      const num = parseInt(val)
      return isNaN(num) ? 10 : Math.min(Math.max(num, 1), 50)
    })
})

export const paginationSchema = z.object({
  page: z.string()
    .optional()
    .transform((val) => {
      if (!val) return 1
      const num = parseInt(val)
      return isNaN(num) ? 1 : Math.max(num, 1)
    }),
  limit: z.string()
    .optional()
    .transform((val) => {
      if (!val) return 10
      const num = parseInt(val)
      return isNaN(num) ? 10 : Math.min(Math.max(num, 1), 100)
    })
}) 