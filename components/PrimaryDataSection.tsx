'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  Mail,
  Calendar
} from 'lucide-react'
import { toast } from 'react-toastify'
import { getAllPrimaryData } from '@/lib/primaryDataStorage'

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

export default function PrimaryDataSection() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState('all')

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, selectedFilter])

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

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(student => student.isActive)
        break
      case 'inactive':
        filtered = filtered.filter(student => !student.isActive)
        break
      case 'email-sent':
        filtered = filtered.filter(student => student.emailSent)
        break
      case 'email-pending':
        filtered = filtered.filter(student => !student.emailSent)
        break
      default:
        break
    }

    setFilteredStudents(filtered)
  }

  const exportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Class', 'Division', 'Parent', 'Place', 'Username', 'Status', 'Email Sent'],
      ...filteredStudents.map(student => [
        student.name,
        student.email,
        student.class,
        student.division,
        student.parentName,
        student.place,
        student.username,
        student.isActive ? 'Active' : 'Inactive',
        student.emailSent ? 'Sent' : 'Pending'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students_data_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Data exported successfully')
  }

  const getStats = () => {
    const total = students.length
    const active = students.filter(s => s.isActive).length
    const emailSent = students.filter(s => s.emailSent).length
    const pending = students.filter(s => !s.emailSent).length

    return { total, active, emailSent, pending }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Primary Data</h2>
          <p className="text-gray-600">View and manage all student data</p>
        </div>
        <Button onClick={exportData} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Email Sent</p>
                <p className="text-2xl font-bold">{stats.emailSent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Student Data</CardTitle>
          <CardDescription>
            Search and filter through all student records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Students</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="email-sent">Email Sent</option>
                <option value="email-pending">Email Pending</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {filteredStudents.length} of {students.length} students
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading student data...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No students found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Class</th>
                      <th className="text-left p-2">Username</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{student.name}</td>
                        <td className="p-2 text-xs">{student.email}</td>
                        <td className="p-2">{student.class}-{student.division}</td>
                        <td className="p-2 font-mono text-xs">{student.username}</td>
                        <td className="p-2">
                          <Badge variant={student.isActive ? "default" : "secondary"}>
                            {student.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant={student.emailSent ? "default" : "destructive"}>
                            {student.emailSent ? "Sent" : "Pending"}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 