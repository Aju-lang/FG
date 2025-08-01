import QRCode from 'qrcode'

export interface QRLoginData {
  type: 'student_login'
  username: string
  password: string
  studentId: string
  name: string
  class: string
  division: string
}

// Generate QR code for student login
export const generateStudentLoginQR = async (
  username: string,
  password: string,
  studentId: string,
  name: string,
  studentClass: string,
  division: string
): Promise<string> => {
  try {
    const qrData: QRLoginData = {
      type: 'student_login',
      username,
      password,
      studentId,
      name,
      class: studentClass,
      division
    }

    // Generate QR code as base64 string
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
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

// Generate login URL QR code
export const generateLoginURLQR = async (
  username: string,
  password: string,
  baseURL: string = 'https://fg-school.vercel.app'
): Promise<string> => {
  try {
    // Create auto-login URL
    const loginURL = `${baseURL}/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&role=student&auto=true`

    const qrCodeDataURL = await QRCode.toDataURL(loginURL, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#1e40af', // Blue color for URL QR
        light: '#FFFFFF'
      },
      width: 256
    })

    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating login URL QR:', error)
    throw new Error('Failed to generate login URL QR code')
  }
}

// Parse QR code data for login
export const parseQRLoginData = (qrString: string): QRLoginData | null => {
  try {
    const data = JSON.parse(qrString)
    
    if (data.type === 'student_login' && data.username && data.password) {
      return data as QRLoginData
    }
    
    return null
  } catch (error) {
    console.error('Error parsing QR login data:', error)
    return null
  }
}

// Generate QR code for display (not for scanning)
export const generateDisplayQR = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      width: 200
    })
  } catch (error) {
    console.error('Error generating display QR:', error)
    throw new Error('Failed to generate QR code')
  }
} 