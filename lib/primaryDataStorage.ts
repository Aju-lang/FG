import { db } from './firebase'
import { collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc, updateDoc } from 'firebase/firestore'

export interface PrimaryDataStudent {
  id: string
  name: string
  class: string
  division: string
  parentName: string
  place: string
  email: string
  username: string
  password: string
  rollNumber?: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin: string | null
  emailSent: boolean
  qrCode: string | null
  // About Me Lab fields
  bio?: string
  mission?: string
  skills?: string[]
  location?: string
}

const COLLECTION_NAME = 'primaryDataStudents'

// Store a single student in Firestore
export const storePrimaryDataStudent = async (student: PrimaryDataStudent): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, student.id)
    await setDoc(docRef, student)
    console.log(`✅ Student ${student.name} stored successfully`)
  } catch (error) {
    console.error('Error storing student:', error)
    throw error
  }
}

// Store multiple students in Firestore
export const storeBulkPrimaryData = async (students: PrimaryDataStudent[]): Promise<void> => {
  try {
    const batch = students.map(student => storePrimaryDataStudent(student))
    await Promise.all(batch)
    console.log(`✅ ${students.length} students stored successfully`)
  } catch (error) {
    console.error('Error storing bulk students:', error)
    throw error
  }
}

// Get student by username
export const getPrimaryDataByUsername = async (username: string): Promise<PrimaryDataStudent | null> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('username', '==', username))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return doc.data() as PrimaryDataStudent
    }
    
    return null
  } catch (error) {
    console.error('Error getting student by username:', error)
    throw error
  }
}

// Get student by ID
export const getPrimaryDataById = async (id: string): Promise<PrimaryDataStudent | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as PrimaryDataStudent
    }
    
    return null
  } catch (error) {
    console.error('Error getting student by ID:', error)
    throw error
  }
}

// Get all students
export const getAllPrimaryDataStudents = async (): Promise<PrimaryDataStudent[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))
    const students: PrimaryDataStudent[] = []
    
    querySnapshot.forEach((doc) => {
      students.push(doc.data() as PrimaryDataStudent)
    })
    
    return students
  } catch (error) {
    console.error('Error getting all students:', error)
    throw error
  }
}

// Alias for compatibility
export const getAllPrimaryData = getAllPrimaryDataStudents

// Check if username exists
export const checkUsernameExists = async (username: string): Promise<boolean> => {
  try {
    const student = await getPrimaryDataByUsername(username)
    return student !== null
  } catch (error) {
    console.error('Error checking username:', error)
    throw error
  }
}

// Check if email exists
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('email', '==', email))
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  } catch (error) {
    console.error('Error checking email:', error)
    throw error
  }
}

// Update student's last login
export const updateStudentLastLogin = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating last login:', error)
    throw error
  }
}

// Update email sent status
export const updateEmailSentStatus = async (id: string, emailSent: boolean): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      emailSent,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating email sent status:', error)
    throw error
  }
}

// Update student profile (About Me Lab)
export const updateStudentProfile = async (id: string, profileData: Partial<PrimaryDataStudent>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating student profile:', error)
    throw error
  }
}

// Alias for compatibility
export const updatePrimaryData = updateStudentProfile

// Delete a single student
export const deletePrimaryDataStudent = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
    console.log(`✅ Student ${id} deleted successfully`)
  } catch (error) {
    console.error('Error deleting student:', error)
    throw error
  }
}

// Alias for compatibility
export const deletePrimaryData = deletePrimaryDataStudent

// Clear all student data
export const clearAllPrimaryData = async (): Promise<void> => {
  try {
    const students = await getAllPrimaryDataStudents()
    const deletePromises = students.map(student => deletePrimaryDataStudent(student.id))
    await Promise.all(deletePromises)
    console.log(`✅ All ${students.length} students deleted successfully`)
  } catch (error) {
    console.error('Error clearing all data:', error)
    throw error
  }
} 