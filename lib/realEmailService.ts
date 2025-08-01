'use client'

import emailjs from '@emailjs/browser'
import { toast } from 'react-toastify'
import QRCode from 'qrcode'

// EmailJS Configuration using environment variables
const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_fg_school',
  TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_student_welcome',
  PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'demo_key'
}

// Initialize EmailJS
export const initializeEmailJS = () => {
  try {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY)
    console.log('📧 EmailJS initialized with config:', {
      SERVICE_ID: EMAILJS_CONFIG.SERVICE_ID,
      TEMPLATE_ID: EMAILJS_CONFIG.TEMPLATE_ID,
      PUBLIC_KEY: EMAILJS_CONFIG.PUBLIC_KEY.substring(0, 8) + '...'
    })
  } catch (error) {
    console.error('❌ EmailJS initialization failed:', error)
  }
}

export interface StudentCredentials {
  name: string
  email: string
  username: string
  password: string
  class: string
  division: string
  parentName: string
  place: string
  loginUrl: string
  qrCodeUrl: string
}

// Generate student credentials
export const generateStudentCredentials = (studentData: {
  name: string
  email: string
  class: string
  division: string
  parentName: string
  place: string
}): StudentCredentials => {
  // Generate username: name without spaces + random number
  const username = studentData.name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 9000 + 1000)
  
  // Generate password: name without spaces + random number
  const password = studentData.name.replace(/\s+/g, '') + Math.floor(Math.random() * 9000 + 1000)
  
  const loginUrl = `${window.location.origin}/login`
  
  return {
    ...studentData,
    username,
    password,
    loginUrl,
    qrCodeUrl: '' // Will be generated below
  }
}

// Send real email using EmailJS
export const sendStudentWelcomeEmail = async (credentials: StudentCredentials): Promise<boolean> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(credentials.email)) {
      console.error('❌ Invalid email format:', credentials.email)
      return false
    }

    // Generate QR Code with login credentials
    const qrData = JSON.stringify({
      type: 'student_login',
      username: credentials.username,
      password: credentials.password,
      name: credentials.name,
      loginUrl: credentials.loginUrl
    })
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    credentials.qrCodeUrl = qrCodeDataUrl
    
    // Email template parameters (simplified for better compatibility)
    const templateParams = {
      // Standard EmailJS variables
      to_name: credentials.name,
      to_email: credentials.email,
      from_name: 'FG School Administration',
      reply_to: 'admin@fgschool.edu',
      
      // Student information
      student_name: credentials.name,
      name: credentials.name,
      username: credentials.username,
      password: credentials.password,
      
      // Academic details
      class: credentials.class,
      division: credentials.division,
      grade: credentials.class,
      section: credentials.division,
      
      // Contact information
      parent_name: credentials.parentName,
      parent: credentials.parentName,
      place: credentials.place,
      location: credentials.place,
      email: credentials.email,
      
      // URLs and codes
      login_url: credentials.loginUrl,
      login_link: credentials.loginUrl,
      qr_code: qrCodeDataUrl,
      
      // School information
      school_name: 'FG School',
      school: 'FG School'
    }

    console.log('📧 Attempting to send email to:', credentials.email)
    console.log('📋 EmailJS Config Check:', {
      SERVICE_ID: EMAILJS_CONFIG.SERVICE_ID,
      TEMPLATE_ID: EMAILJS_CONFIG.TEMPLATE_ID,
      PUBLIC_KEY_SET: EMAILJS_CONFIG.PUBLIC_KEY !== 'demo_key'
    })
    
    // Check if EmailJS is properly configured
    if (EMAILJS_CONFIG.PUBLIC_KEY === 'demo_key') {
      console.log('⚠️ EmailJS in DEMO MODE - Set environment variables for real email sending')
      
      // DEMO EMAIL SIMULATION
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('📧 DEMO EMAIL SENT TO:', credentials.email)
      console.log('═══════════════════════════════════════')
      console.log(`Subject: Welcome to FG School Portal, ${credentials.name}!`)
      console.log('')
      console.log(`Dear ${credentials.name},`)
      console.log('')
      console.log('🎉 Welcome to FG School\'s digital world!')
      console.log('')
      console.log('Your login credentials are:')
      console.log(`Username: ${credentials.username}`)
      console.log(`Password: ${credentials.password}`)
      console.log('')
      console.log('Class Details:')
      console.log(`Class: ${credentials.class}`)
      console.log(`Division: ${credentials.division}`)
      console.log(`Parent: ${credentials.parentName}`)
      console.log(`Place: ${credentials.place}`)
      console.log('')
      console.log('🔗 Login URL:', credentials.loginUrl)
      console.log('📱 QR Code: [Generated - scan to login]')
      console.log('')
      console.log('Happy learning,')
      console.log('FG School Team')
      console.log('═══════════════════════════════════════')
      
      return true
    } else {
      // REAL EMAIL SENDING
      try {
        const response = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          templateParams,
          EMAILJS_CONFIG.PUBLIC_KEY
        )
        
        if (response.status === 200) {
          console.log('✅ REAL EMAIL sent successfully to:', credentials.email)
          return true
        } else {
          throw new Error(`EmailJS response status: ${response.status}`)
        }
      } catch (emailError: any) {
        console.error('❌ EmailJS send failed:', emailError)
        
        // Log detailed error for debugging
        if (emailError.status === 400) {
          console.error('❌ Bad Request: Check template variables and service configuration')
        } else if (emailError.status === 401) {
          console.error('❌ Unauthorized: Check your EmailJS public key')
        } else if (emailError.status === 404) {
          console.error('❌ Not Found: Check your service ID and template ID')
        }
        
        toast.error(`Failed to send email to ${credentials.email}`)
        return false
      }
    }

  } catch (error: any) {
    console.error('❌ Failed to send email to', credentials.email, ':', error.message)
    return false
  }
}

// Send bulk emails to multiple students
export const sendBulkWelcomeEmails = async (
  studentsData: Array<{
    name: string
    email: string
    class: string
    division: string
    parentName: string
    place: string
  }>,
  onProgress?: (completed: number, total: number, current: string, success: number, failed: number) => void
): Promise<{ 
  success: number
  failed: number
  credentials: StudentCredentials[]
  errors: string[]
}> => {
  const results = {
    success: 0,
    failed: 0,
    credentials: [] as StudentCredentials[],
    errors: [] as string[]
  }

  console.log(`📧 STARTING BULK EMAIL SEND TO ${studentsData.length} STUDENTS`)
  console.log('📋 Email Addresses to Process:')
  studentsData.forEach((student, index) => {
    console.log(`  ${index + 1}. ${student.name} <${student.email}>`)
  })
  console.log('═'.repeat(60))
  
  for (let i = 0; i < studentsData.length; i++) {
    const student = studentsData[i]
    
    try {
      // Generate credentials
      const credentials = generateStudentCredentials(student)
      results.credentials.push(credentials)
      
      onProgress?.(i, studentsData.length, student.name, results.success, results.failed)
      
      // Send email
      const emailSent = await sendStudentWelcomeEmail(credentials)
      
      if (emailSent) {
        results.success++
        console.log(`✅ ${student.name}: Email sent to ${student.email}`)
      } else {
        results.failed++
        results.errors.push(`${student.name}: Email delivery failed to ${student.email}`)
      }
      
      // Delay to avoid rate limiting (EmailJS has limits)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error: any) {
      results.failed++
      results.errors.push(`${student.name}: ${error.message}`)
      console.error(`❌ ${student.name}:`, error.message)
    }
  }

  onProgress?.(studentsData.length, studentsData.length, 'Complete', results.success, results.failed)
  
  console.log('═'.repeat(60))
  console.log(`📧 BULK EMAIL COMPLETE: ${results.success} sent, ${results.failed} failed`)
  
  if (results.success > 0) {
    toast.success(`📧 Successfully sent ${results.success} welcome emails!`)
  }
  
  if (results.failed > 0) {
    toast.warning(`⚠️ ${results.failed} emails failed to send`)
    console.error('Email failures:', results.errors)
  }

  return results
}

// Test EmailJS configuration
export const testEmailJSConfig = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing EmailJS Configuration...')
    
    const testCredentials: StudentCredentials = {
      name: 'Test Student',
      email: 'test@example.com', // Use a real email for testing
      username: 'teststudent1234',
      password: 'TestPassword123',
      class: '10',
      division: 'A',
      parentName: 'Test Parent',
      place: 'Test City',
      loginUrl: `${window.location.origin}/login`,
      qrCodeUrl: ''
    }
    
    const result = await sendStudentWelcomeEmail(testCredentials)
    
    if (result) {
      console.log('✅ EmailJS configuration test successful!')
      toast.success('EmailJS test email sent successfully!')
    } else {
      console.log('❌ EmailJS configuration test failed!')
      toast.error('EmailJS test failed - check configuration')
    }
    
    return result
  } catch (error) {
    console.error('❌ EmailJS test error:', error)
    toast.error('EmailJS test error')
    return false
  }
}

// Initialize EmailJS on module load
if (typeof window !== 'undefined') {
  initializeEmailJS()
} 