'use client'

import { toast } from 'react-toastify'

export interface StudentData {
  name: string
  email: string
  class?: string
  division?: string
  section?: string
  rollNumber?: string
  parentName?: string
  place?: string
  phone?: string
  location?: string
  grade?: string
}

// Parse CSV content
export const parseCSVContent = (content: string): StudentData[] => {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row')
  }
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const students: StudentData[] = []
  
  // Map common header variations
  const headerMap = {
    'name': ['name', 'student name', 'full name', 'student_name'],
    'email': ['email', 'email address', 'e-mail', 'student_email'],
    'class': ['class', 'grade', 'standard', 'class_name'],
    'division': ['division', 'section', 'div', 'class_division'],
    'rollNumber': ['roll number', 'roll no', 'roll_number', 'admission_number', 'roll', 'id'],
    'parentName': ['parent name', 'father name', 'guardian', 'parent_name', 'father_name'],
    'place': ['place', 'location', 'address', 'city', 'hometown'],
    'phone': ['phone', 'mobile', 'contact', 'phone_number', 'mobile_number']
  }
  
  // Find column indices
  const columnIndices: { [key: string]: number } = {}
  for (const [field, variations] of Object.entries(headerMap)) {
    for (const variation of variations) {
      const index = headers.findIndex(h => h.includes(variation))
      if (index !== -1) {
        columnIndices[field] = index
        break
      }
    }
  }
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    
    if (values.length < headers.length) continue // Skip incomplete rows
    
    const student: StudentData = {
      name: values[columnIndices.name] || `Student ${i}`,
      email: values[columnIndices.email] || '',
      class: values[columnIndices.class] || '',
      division: values[columnIndices.division] || '',
      rollNumber: values[columnIndices.rollNumber] || i.toString(),
      parentName: values[columnIndices.parentName] || '',
      place: values[columnIndices.place] || '',
      phone: values[columnIndices.phone] || ''
    }
    
    // Generate email if not provided
    if (!student.email) {
      const nameSlug = student.name.toLowerCase().replace(/\s+/g, '.')
      student.email = `${nameSlug}@student.fgschool.edu`
    }
    
    students.push(student)
  }
  
  return students
}

// Parse Excel-like TSV content
export const parseTSVContent = (content: string): StudentData[] => {
  const csvContent = content.replace(/\t/g, ',')
  return parseCSVContent(csvContent)
}

// Parse plain text content (one student per line)
export const parseTextContent = (content: string): StudentData[] => {
  const lines = content.split('\n').filter(line => line.trim())
  const students: StudentData[] = []
  
  lines.forEach((line, index) => {
    const parts = line.split(/[\s,]+/).filter(p => p.trim())
    if (parts.length >= 1) {
      const name = parts.slice(0, 2).join(' ') || `Student ${index + 1}`
      const rollNumber = parts.find(p => /^\d+$/.test(p)) || (index + 1).toString()
      const email = parts.find(p => p.includes('@')) || `${name.toLowerCase().replace(/\s+/g, '.')}@student.fgschool.edu`
      
      students.push({
        name,
        email,
        rollNumber,
        class: '10',
        division: 'A'
      })
    }
  })
  
  return students
}

// Parse JSON content
export const parseJSONContent = (content: string): StudentData[] => {
  try {
    const data = JSON.parse(content)
    if (Array.isArray(data)) {
      return data.map((item, index) => ({
        name: item.name || `Student ${index + 1}`,
        email: item.email || `student${index + 1}@student.fgschool.edu`,
        class: item.class || item.grade || '10',
        division: item.division || item.section || 'A',
        rollNumber: item.rollNumber || item.roll || (index + 1).toString(),
        parentName: item.parentName || item.parent || '',
        place: item.place || item.location || '',
        phone: item.phone || item.mobile || ''
      }))
    } else {
      throw new Error('JSON must contain an array of student objects')
    }
  } catch (error) {
    throw new Error('Invalid JSON format')
  }
}

// Main file parser
export const parseStudentFile = async (file: File): Promise<StudentData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let students: StudentData[] = []
        
        // Determine file type and parse accordingly
        if (file.name.endsWith('.csv')) {
          students = parseCSVContent(content)
        } else if (file.name.endsWith('.tsv') || file.name.endsWith('.txt')) {
          if (content.includes('\t')) {
            students = parseTSVContent(content)
          } else if (content.includes(',')) {
            students = parseCSVContent(content)
          } else {
            students = parseTextContent(content)
          }
        } else if (file.name.endsWith('.json')) {
          students = parseJSONContent(content)
        } else {
          // Try to auto-detect format
          if (content.includes(',') && content.includes('\n')) {
            students = parseCSVContent(content)
          } else if (content.includes('\t')) {
            students = parseTSVContent(content)
          } else if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
            students = parseJSONContent(content)
          } else {
            students = parseTextContent(content)
          }
        }
        
        if (students.length === 0) {
          throw new Error('No valid student data found in file')
        }
        
        resolve(students)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

// Generate sample CSV template
export const generateSampleCSV = (): string => {
  const headers = ['Name', 'Email', 'Class', 'Division', 'Roll Number', 'Parent Name', 'Place', 'Phone']
  const sampleData = [
    ['Ahmed Hassan', 'ahmed.hassan@student.fgschool.edu', '10A', 'A', '101', 'Hassan Ali', 'Kochi', '9876543210'],
    ['Fatima Ali', 'fatima.ali@student.fgschool.edu', '10B', 'B', '102', 'Ali Mohammed', 'Thiruvananthapuram', '9876543211'],
    ['Mohammed Khan', 'mohammed.khan@student.fgschool.edu', '9A', 'A', '201', 'Khan Abdul', 'Kozhikode', '9876543212'],
    ['Aisha Rahman', 'aisha.rahman@student.fgschool.edu', '10A', 'A', '103', 'Rahman Ahmed', 'Kottayam', '9876543213'],
    ['Omar Abdullah', 'omar.abdullah@student.fgschool.edu', '9B', 'B', '202', 'Abdullah Omar', 'Kannur', '9876543214']
  ]
  
  const csv = [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n')
  return csv
}

// Download sample template
export const downloadSampleTemplate = () => {
  const csv = generateSampleCSV()
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'student_template.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  toast.success('Sample template downloaded!')
} 