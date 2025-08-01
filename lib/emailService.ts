'use client'

import emailjs from '@emailjs/browser'
import QRCode from 'qrcode'

interface StudentEmailData {
  id: string
  name: string
  username: string
  password: string
  email: string
  class: string
  division: string
  parentName: string
  place: string
}

interface EmailResult {
  email: string
  success: boolean
  error?: string
}

// Generate QR code for student login
const generateStudentQRCode = async (student: StudentEmailData): Promise<string> => {
  try {
    const loginData = {
      type: 'student_login',
      username: student.username,
      password: student.password,
      studentId: student.id,
      name: student.name,
      class: student.class,
      division: student.division
    }

    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(loginData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    })

    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

// Send welcome email to a single student
export const sendStudentWelcomeEmail = async (student: StudentEmailData): Promise<EmailResult> => {
  try {
    // Check if EmailJS is configured
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

    console.log('EmailJS Configuration:', {
      serviceId: serviceId ? '✅ Set' : '❌ Missing',
      templateId: templateId ? '✅ Set' : '❌ Missing',
      publicKey: publicKey ? '✅ Set' : '❌ Missing'
    })

    if (!serviceId || !templateId || !publicKey) {
      const error = 'EmailJS configuration is missing. Please check your environment variables.'
      console.error(error, { serviceId, templateId, publicKey })
      return {
        email: student.email,
        success: false,
        error: error
      }
    }

    // Validate email address
    if (!student.email || !student.email.includes('@')) {
      const error = 'Invalid email address'
      console.error(error, { email: student.email })
      return {
        email: student.email,
        success: false,
        error: error
      }
    }

    // Generate QR code
    const qrCodeDataURL = await generateStudentQRCode(student)
    console.log('Generated QR code for student:', student.name)

    // Create email message with QR code
    const emailMessage = `Welcome to FG School, ${student.name}!

Your login credentials:
Username: ${student.username}
Password: ${student.password}

You can login at: ${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/login

Class: ${student.class}-${student.division}
Parent: ${student.parentName}
Place: ${student.place}

Your QR Code is attached below for quick login.

Best regards,
FG School Administration`

    // Use EmailJS template variables that match your template structure
    const templateParams = {
      // Your template variables
      name: student.name,
      username: student.username,
      password: student.password,
      qr_code: qrCodeDataURL,
      
      // Alternative variable names for compatibility
      to_email: student.email,
      to_name: student.name,
      email: student.email,
      user_email: student.email,
      user_name: student.name,
      recipient_email: student.email,
      recipient_name: student.name,
      message: emailMessage,
      qr_code_url: qrCodeDataURL,
      qr_image: qrCodeDataURL,
      
      // Additional student info
      student_class: student.class,
      student_division: student.division,
      parent_name: student.parentName,
      place: student.place,
      
      // Login URL
      login_url: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/login`
    }

    console.log('Sending email to:', student.email)
    console.log('Template params keys:', Object.keys(templateParams))
    console.log('QR code length:', qrCodeDataURL.length)

    // Send email using EmailJS
    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey)

    console.log('EmailJS Response:', response)

    if (response.status === 200) {
      console.log(`✅ Email sent successfully to ${student.email}`)
      return {
        email: student.email,
        success: true
      }
    } else {
      const error = `EmailJS returned status: ${response.status}`
      console.error(error)
      return {
        email: student.email,
        success: false,
        error: error
      }
    }
  } catch (error: any) {
    console.error(`❌ Failed to send email to ${student.email}:`, error)
    
    // Provide more detailed error information
    let errorMessage = 'Unknown error'
    if (error.text) {
      errorMessage = `EmailJS Error: ${error.text}`
    } else if (error.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    
    return {
      email: student.email,
      success: false,
      error: errorMessage
    }
  }
}

// Send welcome emails to multiple students
export const sendBulkStudentEmails = async (students: StudentEmailData[]): Promise<EmailResult[]> => {
  const results: EmailResult[] = []
  
  for (const student of students) {
    const result = await sendStudentWelcomeEmail(student)
    results.push(result)
    
    // Add a small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return results
}

// Test EmailJS connection
export const testEmailJSConnection = async (): Promise<boolean> => {
  try {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

    console.log('Testing EmailJS Configuration:', {
      serviceId: serviceId ? '✅ Set' : '❌ Missing',
      templateId: templateId ? '✅ Set' : '❌ Missing',
      publicKey: publicKey ? '✅ Set' : '❌ Missing'
    })

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS configuration missing:', {
        serviceId: !!serviceId,
        templateId: !!templateId,
        publicKey: !!publicKey
      })
    return false
  }
  
    // Generate a test QR code
    const testQRCode = await QRCode.toDataURL(JSON.stringify({
      type: 'student_login',
      username: 'testuser',
      password: 'testpass123',
      studentId: 'test_student_123',
      name: 'Test Student',
      class: '10',
      division: 'A'
    }), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    })

    // Send a test email with EmailJS template variables that match your template
    const testParams = {
      // Your template variables
      name: 'Test User',
      username: 'testuser',
      password: 'testpass123',
      qr_code: testQRCode,
      
      // Alternative variable names for compatibility
      to_email: 'test@example.com',
      to_name: 'Test User',
      email: 'test@example.com',
      user_email: 'test@example.com',
      user_name: 'Test User',
      recipient_email: 'test@example.com',
      recipient_name: 'Test User',
      message: 'This is a test email from FG School system with QR code.',
      qr_code_url: testQRCode,
      qr_image: testQRCode,
      
      // Additional student info
      student_class: '10',
      student_division: 'A',
      parent_name: 'Test Parent',
      place: 'Test City',
      
      // Login URL
      login_url: 'http://localhost:3000/login'
    }

    console.log('Testing EmailJS with params:', Object.keys(testParams))
    console.log('Test QR code length:', testQRCode.length)

    const response = await emailjs.send(serviceId, templateId, testParams, publicKey)
    console.log('EmailJS Test Response:', response)
  
    return response.status === 200
  } catch (error) {
    console.error('EmailJS connection test failed:', error)
    return false
  }
} 