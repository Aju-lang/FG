import { db } from './firebase'
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'

export interface Student {
  id: string
  name: string
  username: string
  password: string
  email: string
  class: string
  division: string
  parentName: string
  place: string
  createdAt: string
  updatedAt?: string
}

// Store a single student in Firestore
export const storeStudent = async (student: Student): Promise<void> => {
  try {
    const studentRef = doc(db, 'primaryDataStudents', student.id)
    await setDoc(studentRef, {
      ...student,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log(`✅ Student ${student.name} stored successfully`)
  } catch (error) {
    console.error(`❌ Error storing student ${student.name}:`, error)
    throw error
  }
}

// Store multiple students in Firestore
export const storeBulkStudents = async (students: Student[]): Promise<void> => {
  try {
    for (const student of students) {
      await storeStudent(student)
    }
    console.log(`✅ Successfully stored ${students.length} students`)
  } catch (error) {
    console.error('❌ Error storing bulk students:', error)
    throw error
  }
}

// Get all students from Firestore
export const getAllStudents = async (): Promise<Student[]> => {
  try {
    const studentsRef = collection(db, 'primaryDataStudents')
    const q = query(studentsRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    const students: Student[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      students.push({
        id: doc.id,
        name: data.name,
        username: data.username,
        password: data.password,
        email: data.email,
        class: data.class,
        division: data.division,
        parentName: data.parentName,
        place: data.place,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      })
    })
    
    return students
  } catch (error) {
    console.error('❌ Error getting students:', error)
    throw error
  }
}

// Get student by ID
export const getStudentById = async (id: string): Promise<Student | null> => {
  try {
    const studentsRef = collection(db, 'primaryDataStudents')
    const q = query(studentsRef, where('id', '==', id))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }
    
    const doc = snapshot.docs[0]
    const data = doc.data()
    
    return {
      id: doc.id,
      name: data.name,
      username: data.username,
      password: data.password,
      email: data.email,
      class: data.class,
      division: data.division,
      parentName: data.parentName,
      place: data.place,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
    }
  } catch (error) {
    console.error(`❌ Error getting student ${id}:`, error)
    throw error
  }
}

// Get student by username
export const getStudentByUsername = async (username: string): Promise<Student | null> => {
  try {
    const studentsRef = collection(db, 'primaryDataStudents')
    const q = query(studentsRef, where('username', '==', username))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }
    
    const doc = snapshot.docs[0]
    const data = doc.data()
    
    return {
      id: doc.id,
      name: data.name,
      username: data.username,
      password: data.password,
      email: data.email,
      class: data.class,
      division: data.division,
      parentName: data.parentName,
      place: data.place,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
    }
  } catch (error) {
    console.error(`❌ Error getting student by username ${username}:`, error)
    throw error
  }
}

// Validate student login credentials
export const validateStudentLogin = async (
  username: string, 
  password: string
): Promise<Student | null> => {
  try {
    const student = await getStudentByUsername(username)
    
    if (!student) {
      return null
    }
    
    if (student.password === password) {
      return student
    }
    
    return null
  } catch (error) {
    console.error('❌ Error validating student login:', error)
    throw error
  }
}

// Local storage functions for backup
export const storeStudentLocally = (student: Student): void => {
  try {
    const existingStudents = getStudentsLocally()
    const updatedStudents = [...existingStudents, student]
    localStorage.setItem('localStudents', JSON.stringify(updatedStudents))
  } catch (error) {
    console.error('❌ Error storing student locally:', error)
  }
}

export const getStudentsLocally = (): Student[] => {
  try {
    const students = localStorage.getItem('localStudents')
    return students ? JSON.parse(students) : []
  } catch (error) {
    console.error('❌ Error getting local students:', error)
    return []
  }
}

export const validateStudentLoginLocally = (
  username: string, 
  password: string
): Student | null => {
  try {
    const students = getStudentsLocally()
    const student = students.find(s => s.username === username && s.password === password)
    return student || null
  } catch (error) {
    console.error('❌ Error validating student login locally:', error)
    return null
  }
} 