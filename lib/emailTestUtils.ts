import emailjs from '@emailjs/browser'

// Check EmailJS configuration
export const checkEmailJSConfig = () => {
  const config = {
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
  }

  console.log('📧 EmailJS Configuration Check:')
  console.log('Service ID:', config.serviceId ? '✅ Set' : '❌ Missing')
  console.log('Template ID:', config.templateId ? '✅ Set' : '❌ Missing')
  console.log('Public Key:', config.publicKey ? '✅ Set' : '❌ Missing')

  const allConfigured = config.serviceId && config.templateId && config.publicKey
  
  if (!allConfigured) {
    console.error('❌ EmailJS not properly configured. Please check your .env.local file')
    return false
  }

  console.log('✅ EmailJS configuration looks good!')
  return true
}

// Send a simple test email
export const sendTestEmailSimple = async (testEmail: string) => {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    throw new Error('EmailJS environment variables not configured')
  }

  try {
    const testParams = {
      to_email: testEmail,
      to_name: 'Test User',
      message: 'This is a test email from FG School Portal',
      from_name: 'FG School',
      reply_to: testEmail
    }

    const response = await emailjs.send(serviceId, templateId, testParams, publicKey)
    
    if (response.status === 200) {
      console.log('✅ Test email sent successfully!')
      return true
    } else {
      console.error('❌ Test email failed with status:', response.status)
      return false
    }
  } catch (error: any) {
    console.error('❌ EmailJS Error:', error)
    
    // Detailed error handling
    if (error.status === 400) {
      console.error('Bad Request: Check your template variables')
    } else if (error.status === 401) {
      console.error('Unauthorized: Check your public key')
    } else if (error.status === 404) {
      console.error('Not Found: Check your service ID and template ID')
    }
    
    return false
  }
}

// Get EmailJS account info (for debugging)
export const getEmailJSInfo = () => {
  return {
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'Not configured',
    templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'Not configured',
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY 
      ? process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY.substring(0, 8) + '...' 
      : 'Not configured'
  }
} 