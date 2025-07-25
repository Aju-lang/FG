import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from './firebase'
import { toast } from 'react-toastify'
import { UserCertificate, CertificationLevel, certificationLevels } from './certificatesData'

// Get user certificates from localStorage and Firebase
export const getUserCertificates = async (uid: string): Promise<UserCertificate[]> => {
  try {
    // Try Firebase first
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return userData.certificates || []
    }
    
    // Fallback to localStorage
    const localCerts = localStorage.getItem(`certificates_${uid}`)
    return localCerts ? JSON.parse(localCerts) : []
  } catch (error) {
    console.error('Error fetching certificates:', error)
    // Fallback to localStorage
    const localCerts = localStorage.getItem(`certificates_${uid}`)
    return localCerts ? JSON.parse(localCerts) : []
  }
}

// Save certificate completion
export const markCourseCompleted = async (
  uid: string, 
  courseId: string, 
  courseTitle: string, 
  provider: string, 
  points: number, 
  skills: string[]
): Promise<boolean> => {
  const newCertificate: UserCertificate = {
    id: `cert_${Date.now()}`,
    courseId,
    title: courseTitle,
    provider,
    dateCompleted: new Date().toISOString(),
    pointsEarned: points,
    verified: true,
    type: 'course',
    skills
  }

  try {
    // Update Firebase
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      certificates: arrayUnion(newCertificate)
    })

    // Update localStorage as backup
    const existingCerts = await getUserCertificates(uid)
    const updatedCerts = [...existingCerts, newCertificate]
    localStorage.setItem(`certificates_${uid}`, JSON.stringify(updatedCerts))

    toast.success(`🎉 Certificate earned! +${points} points`, {
      position: "top-right",
      autoClose: 3000,
    })

    return true
  } catch (error) {
    console.error('Error saving certificate:', error)
    
    // Fallback to localStorage only
    const existingCerts = await getUserCertificates(uid)
    const updatedCerts = [...existingCerts, newCertificate]
    localStorage.setItem(`certificates_${uid}`, JSON.stringify(updatedCerts))
    
    toast.success(`🎉 Certificate earned! +${points} points (saved locally)`, {
      position: "top-right",
      autoClose: 3000,
    })
    
    return true
  }
}

// Remove certificate completion
export const unmarkCourseCompleted = async (uid: string, certificateId: string): Promise<boolean> => {
  try {
    const certificates = await getUserCertificates(uid)
    const certToRemove = certificates.find(cert => cert.id === certificateId)
    
    if (!certToRemove) return false

    // Update Firebase
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      certificates: arrayRemove(certToRemove)
    })

    // Update localStorage
    const updatedCerts = certificates.filter(cert => cert.id !== certificateId)
    localStorage.setItem(`certificates_${uid}`, JSON.stringify(updatedCerts))

    toast.info('Certificate removed', {
      position: "top-right",
      autoClose: 2000,
    })

    return true
  } catch (error) {
    console.error('Error removing certificate:', error)
    
    // Fallback to localStorage only
    const certificates = await getUserCertificates(uid)
    const updatedCerts = certificates.filter(cert => cert.id !== certificateId)
    localStorage.setItem(`certificates_${uid}`, JSON.stringify(updatedCerts))
    
    toast.info('Certificate removed (locally)', {
      position: "top-right",
      autoClose: 2000,
    })
    
    return true
  }
}

// Upload external certificate
export const uploadExternalCertificate = async (
  uid: string,
  title: string,
  provider: string,
  skills: string[],
  file?: File
): Promise<boolean> => {
  const newCertificate: UserCertificate = {
    id: `upload_${Date.now()}`,
    title,
    provider,
    dateCompleted: new Date().toISOString(),
    pointsEarned: 15, // Default points for uploaded certificates
    verified: false, // Needs admin approval
    type: 'uploaded',
    skills,
    uploadedFile: file?.name
  }

  try {
    // Update Firebase
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      certificates: arrayUnion(newCertificate)
    })

    // Update localStorage
    const existingCerts = await getUserCertificates(uid)
    const updatedCerts = [...existingCerts, newCertificate]
    localStorage.setItem(`certificates_${uid}`, JSON.stringify(updatedCerts))

    toast.success('📜 Certificate uploaded! Pending verification', {
      position: "top-right",
      autoClose: 3000,
    })

    return true
  } catch (error) {
    console.error('Error uploading certificate:', error)
    
    // Fallback to localStorage
    const existingCerts = await getUserCertificates(uid)
    const updatedCerts = [...existingCerts, newCertificate]
    localStorage.setItem(`certificates_${uid}`, JSON.stringify(updatedCerts))
    
    toast.success('📜 Certificate uploaded! (saved locally)', {
      position: "top-right",
      autoClose: 3000,
    })
    
    return true
  }
}

// Get user's certification level
export const getUserCertificationLevel = (certificateCount: number): CertificationLevel => {
  for (let i = certificationLevels.length - 1; i >= 0; i--) {
    const level = certificationLevels[i]
    if (certificateCount >= level.minCertificates) {
      return level
    }
  }
  return certificationLevels[0] // Default to Bronze
}

// Calculate total points from certificates
export const calculateTotalPoints = (certificates: UserCertificate[]): number => {
  return certificates.reduce((total, cert) => total + cert.pointsEarned, 0)
}

// Get progress to next level
export const getProgressToNextLevel = (certificateCount: number): { 
  current: CertificationLevel, 
  next: CertificationLevel | null, 
  progress: number 
} => {
  const current = getUserCertificationLevel(certificateCount)
  const currentIndex = certificationLevels.findIndex(level => level.name === current.name)
  const next = currentIndex < certificationLevels.length - 1 ? certificationLevels[currentIndex + 1] : null
  
  let progress = 0
  if (next) {
    const currentRange = current.maxCertificates - current.minCertificates + 1
    const currentProgress = certificateCount - current.minCertificates + 1
    progress = Math.min(100, (currentProgress / currentRange) * 100)
  } else {
    progress = 100 // Max level achieved
  }
  
  return { current, next, progress }
}

// Check if course is completed by user
export const isCourseCompleted = (certificates: UserCertificate[], courseId: string): boolean => {
  return certificates.some(cert => cert.courseId === courseId && cert.type === 'course')
}

// Get completed certificate for a course
export const getCompletedCertificate = (certificates: UserCertificate[], courseId: string): UserCertificate | null => {
  return certificates.find(cert => cert.courseId === courseId && cert.type === 'course') || null
}

// Export certificates to CSV
export const exportCertificatesToCSV = (certificates: UserCertificate[]): string => {
  const headers = ['Title', 'Provider', 'Date Completed', 'Points Earned', 'Skills', 'Type', 'Verified']
  const rows = certificates.map(cert => [
    cert.title,
    cert.provider,
    new Date(cert.dateCompleted).toLocaleDateString(),
    cert.pointsEarned.toString(),
    cert.skills.join('; '),
    cert.type,
    cert.verified ? 'Yes' : 'No'
  ])
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n')
  
  return csvContent
}

// Initialize demo certificates for testing
export const initializeDemoCertificates = async (uid: string): Promise<void> => {
  const demoCertificates: UserCertificate[] = [
    {
      id: 'demo_1',
      courseId: 'google-ai',
      title: 'Google AI for Everyone',
      provider: 'Google',
      dateCompleted: '2024-01-15T10:00:00Z',
      pointsEarned: 30,
      verified: true,
      type: 'course',
      skills: ['AI', 'Machine Learning']
    },
    {
      id: 'demo_2',
      title: 'Digital Marketing Fundamentals',
      provider: 'HubSpot',
      dateCompleted: '2024-02-20T14:30:00Z',
      pointsEarned: 15,
      verified: false,
      type: 'uploaded',
      skills: ['Digital Marketing', 'SEO']
    }
  ]

  try {
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, { certificates: demoCertificates }, { merge: true })
    localStorage.setItem(`certificates_${uid}`, JSON.stringify(demoCertificates))
  } catch (error) {
    console.error('Error initializing demo certificates:', error)
    localStorage.setItem(`certificates_${uid}`, JSON.stringify(demoCertificates))
  }
} 