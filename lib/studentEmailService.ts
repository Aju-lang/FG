import emailjs from '@emailjs/browser'
import { generateStudentLoginQR } from './qrCodeUtils'

export interface StudentEmailData {
  name: string
  email: string
  username: string
  password: string
  class: string
  division: string
  parentName: string
  place: string
  studentId: string
}

// Configure EmailJS
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

// Initialize EmailJS
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY)
}

export const sendStudentWelcomeEmail = async (studentData: StudentEmailData): Promise<boolean> => {
  try {
    // Check EmailJS configuration
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      const missingVars = []
      if (!EMAILJS_SERVICE_ID) missingVars.push('NEXT_PUBLIC_EMAILJS_SERVICE_ID')
      if (!EMAILJS_TEMPLATE_ID) missingVars.push('NEXT_PUBLIC_EMAILJS_TEMPLATE_ID')
      if (!EMAILJS_PUBLIC_KEY) missingVars.push('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY')
      
      throw new Error(`EmailJS configuration is missing: ${missingVars.join(', ')}. Please check your .env.local file.`)
    }

    // Generate QR code for student login
    const qrCodeDataUrl = await generateStudentLoginQR(
      studentData.username,
      studentData.password,
      studentData.studentId,
      studentData.name,
      studentData.class,
      studentData.division
    )

    // Prepare email template parameters - using simpler variable names
    const templateParams = {
      to_email: studentData.email,
      to_name: studentData.name,
      name: studentData.name,
      email: studentData.email,
      username: studentData.username,
      password: studentData.password,
      class: studentData.class,
      division: studentData.division,
      parent: studentData.parentName,
      place: studentData.place,
      login_url: `${window.location.origin}/login`,
      qr_code: qrCodeDataUrl,
      school_name: 'FG School',
      support_email: 'support@fgschool.com',
      // Alternative variable names that might be used in templates
      student_name: studentData.name,
      student_email: studentData.email,
      student_username: studentData.username,
      student_password: studentData.password,
      student_class: `${studentData.class}-${studentData.division}`,
      parent_name: studentData.parentName,
      student_place: studentData.place
    }

    console.log('📧 Sending email to:', studentData.email)
    console.log('📧 Template params:', templateParams)

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    )

    console.log('✅ Email sent successfully:', response)
    return true
  } catch (error: any) {
    console.error('❌ Error sending email:', error)
    
    // Provide more detailed error information
    if (error.status) {
      console.error(`EmailJS HTTP Status: ${error.status}`)
    }
    if (error.text) {
      console.error(`EmailJS Error Text: ${error.text}`)
    }
    
    // Re-throw with more context
    const errorMessage = error.message || 'Unknown email error'
    throw new Error(`Failed to send email to ${studentData.email}: ${errorMessage}`)
  }
}

// Simple test function for EmailJS
export const testEmailJSConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      return {
        success: false,
        error: 'EmailJS configuration is missing'
      }
    }

    // Test with minimal parameters
    const testParams = {
      to_email: 'test@example.com',
      to_name: 'Test User',
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'testpass',
      class: '10',
      division: 'A',
      parent: 'Test Parent',
      place: 'Test City',
      login_url: 'http://localhost:3000/login'
    }

    console.log('🧪 Testing EmailJS connection...')
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      testParams,
      EMAILJS_PUBLIC_KEY
    )

    console.log('✅ EmailJS test successful:', response)
    return { success: true }
  } catch (error: any) {
    console.error('❌ EmailJS test failed:', error)
    return {
      success: false,
      error: error.message || 'Unknown error'
    }
  }
}

export const sendBulkStudentEmails = async (
  students: StudentEmailData[],
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number }> => {
  let success = 0
  let failed = 0

  for (let i = 0; i < students.length; i++) {
    try {
      await sendStudentWelcomeEmail(students[i])
      success++
      
      // Update progress
      onProgress?.(i + 1, students.length)
      
      // Add delay between emails to avoid rate limiting
      if (i < students.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error) {
      console.error(`Failed to send email to ${students[i].email}:`, error)
      failed++
    }
  }

  return { success, failed }
}

export const sendTestEmail = async (toEmail: string): Promise<boolean> => {
  try {
    const testStudentData: StudentEmailData = {
      name: 'Test Student',
      email: toEmail,
      username: 'teststudent',
      password: 'test123',
      class: '10',
      division: 'A',
      parentName: 'Test Parent',
      place: 'Test City',
      studentId: 'test_student_123'
    }

    return await sendStudentWelcomeEmail(testStudentData)
  } catch (error) {
    console.error('Test email failed:', error)
    throw error
  }
}

export const getEmailTemplateHTML = (): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to FG School</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .qr-section { text-align: center; margin: 30px 0; }
        .qr-code { max-width: 200px; border: 2px solid #ddd; border-radius: 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { background: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Welcome to FG School!</h1>
          <p>Your account has been successfully created</p>
        </div>
        
        <div class="content">
          <h2>Hello {{to_name}},</h2>
          <p>Welcome to FG School! Your account has been successfully created and you can now access your personalized dashboard.</p>
          
          <div class="credentials">
            <h3>🔐 Your Login Credentials</h3>
            <p><strong>Username:</strong> {{username}}</p>
            <p><strong>Password:</strong> {{password}}</p>
            <p><strong>Class:</strong> {{class}}</p>
            <p><strong>Parent:</strong> {{parent_name}}</p>
            <p><strong>Location:</strong> {{place}}</p>
          </div>
          
          <div class="qr-section">
            <h3>📱 Quick Login QR Code</h3>
            <p>Scan this QR code with your phone to login quickly:</p>
            <img src="{{qr_code}}" alt="Login QR Code" class="qr-code">
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{login_url}}" class="button">🚀 Login to Your Dashboard</a>
          </div>
          
          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>💡 Getting Started</h4>
            <ul>
              <li>Visit the login page using the button above</li>
              <li>Use your username and password to sign in</li>
              <li>Or scan the QR code with your phone's camera</li>
              <li>Explore your personalized "About Me Lab" dashboard</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>© 2024 FG School. All rights reserved.</p>
          <p>If you have any questions, contact us at {{support_email}}</p>
        </div>
      </div>
    </body>
    </html>
  `
} 