'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Edit3, 
  Globe, 
  FileEdit, 
  Save, 
  X,
  Search,
  Eye,
  Trash2,
  Plus
} from 'lucide-react'
import { toast } from 'react-toastify'
import { getAllPrimaryData, updatePrimaryData, deletePrimaryData } from '@/lib/primaryDataStorage'

interface Student {
  id: string
  name: string
  email: string
  class: string
  division: string
  parentName: string
  place: string
  username: string
  isActive: boolean
  emailSent: boolean
  createdAt: any
}

export default function EditWebSection() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm])

  const loadStudents = async () => {
    try {
      setIsLoading(true)
      const data = await getAllPrimaryData()
      setStudents(data)
    } catch (error) {
      console.error('Error loading students:', error)
      toast.error('Failed to load student data')
    } finally {
      setIsLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredStudents(filtered)
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
  }

  const handleSave = async (updatedStudent: Student) => {
    try {
      await updatePrimaryData(updatedStudent.id, updatedStudent)
      setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s))
      setEditingStudent(null)
      toast.success('Student updated successfully')
    } catch (error) {
      console.error('Error updating student:', error)
      toast.error('Failed to update student')
    }
  }

  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return
    }

    try {
      await deletePrimaryData(studentId)
      setStudents(students.filter(s => s.id !== studentId))
      toast.success('Student deleted successfully')
    } catch (error) {
      console.error('Error deleting student:', error)
      toast.error('Failed to delete student')
    }
  }

  const toggleActiveStatus = async (student: Student) => {
    const updatedStudent = { ...student, isActive: !student.isActive }
    await handleSave(updatedStudent)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit & Add to Web</h2>
          <p className="text-gray-600">Modify existing data and web content</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {students.length} Total Students
          </Badge>
          <Badge variant="outline" className="text-xs">
            {students.filter(s => s.isActive).length} Active
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Students
          </CardTitle>
          <CardDescription>
            Find students to edit or modify their data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Records</CardTitle>
          <CardDescription>
            Click on a student to edit their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading student data...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{student.name}</h3>
                        <Badge variant={student.isActive ? "default" : "secondary"}>
                          {student.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={student.emailSent ? "default" : "destructive"}>
                          {student.emailSent ? "Email Sent" : "Email Pending"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span>{student.email}</span> • 
                        <span className="ml-2">Class {student.class}-{student.division}</span> • 
                        <span className="ml-2">Username: {student.username}</span>
                      </div>
                      {student.parentName && (
                        <div className="text-sm text-gray-500 mt-1">
                          Parent: {student.parentName} • Place: {student.place}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(student)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActiveStatus(student)}
                      >
                        {student.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(student.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onSave={handleSave}
          onCancel={() => setEditingStudent(null)}
        />
      )}
    </div>
  )
}

// Edit Student Modal Component
function EditStudentModal({ 
  student, 
  onSave, 
  onCancel 
}: { 
  student: Student
  onSave: (student: Student) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(student)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Edit Student: {student.name}</h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Student Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-class">Class</Label>
              <Input
                id="edit-class"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-division">Division</Label>
              <Input
                id="edit-division"
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-parent">Parent Name</Label>
              <Input
                id="edit-parent"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-place">Place</Label>
              <Input
                id="edit-place"
                value={formData.place}
                onChange={(e) => setFormData({ ...formData, place: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 