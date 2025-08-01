// lib/validationSchemas.ts - Zod validation schemas for API endpoints

import { z } from 'zod'

// Login validation schema
export const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'controller', 'primary'], {
    required_error: 'Please select a role'
  }),
  rememberMe: z.boolean().optional()
})

export type LoginFormData = z.infer<typeof loginSchema>

// Validate login input
export const validateLoginInput = (data: LoginFormData) => {
  return loginSchema.parse(data)
}

// User validation schema
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['student', 'controller'], {
    required_error: 'Role is required'
  }),
  grade: z.string().optional(),
  class: z.string().optional(),
  division: z.string().optional(),
  rollNumber: z.string().optional(),
  parentName: z.string().optional(),
  place: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional()
})

export const updateUserSchema = createUserSchema.partial()

// Class validation schema
export const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  description: z.string().optional(),
  grade: z.string().min(1, 'Grade is required'),
  subject: z.string().min(1, 'Subject is required'),
  teacher: z.string().min(1, 'Teacher name is required'),
  schedule: z.object({
    day: z.string(),
    time: z.string(),
    duration: z.number()
  }).optional(),
  maxStudents: z.number().min(1, 'Max students must be at least 1').optional(),
  materials: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional()
})

export const updateClassSchema = createClassSchema.partial()

// Certificate validation schema
export const createCertificateSchema = z.object({
  title: z.string().min(1, 'Certificate title is required'),
  description: z.string().optional(),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  pointsRequired: z.number().min(0, 'Points required must be non-negative'),
  category: z.enum(['academic', 'participation', 'leadership', 'achievement'], {
    required_error: 'Category is required'
  }),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Difficulty level is required'
  }),
  validityPeriod: z.number().min(1, 'Validity period must be at least 1 month').optional(),
  prerequisites: z.array(z.string()).optional()
})

export const updateCertificateSchema = createCertificateSchema.partial()

// Leaderboard validation schema
export const leaderboardQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'all-time']).optional(),
  category: z.enum(['points', 'certificates', 'participation']).optional(),
  grade: z.string().optional(),
  limit: z.number().min(1).max(100).optional()
})

// Authentication validation schemas
export const loginEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const loginUsernameSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['student', 'controller'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// QR Code validation schema
export const qrLoginSchema = z.object({
  type: z.enum(['login', 'profile']),
  email: z.string().email().optional(),
  password: z.string().optional(),
  role: z.enum(['student', 'controller']).optional(),
  studentId: z.string().optional()
})

// Search validation schema
export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['users', 'classes', 'certificates']).optional(),
  filters: z.object({
    grade: z.string().optional(),
    subject: z.string().optional(),
    category: z.string().optional()
  }).optional()
})

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
}) 