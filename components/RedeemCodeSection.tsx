'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Gift, 
  Plus, 
  Copy, 
  Download, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Users
} from 'lucide-react'
import { toast } from 'react-toastify'

interface RedemptionCode {
  id: string
  code: string
  type: 'student' | 'teacher' | 'admin'
  maxUses: number
  usedCount: number
  isActive: boolean
  createdAt: Date
  expiresAt?: Date
  description?: string
}

export default function RedeemCodeSection() {
  const [codes, setCodes] = useState<RedemptionCode[]>([])
  const [filteredCodes, setFilteredCodes] = useState<RedemptionCode[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')

  useEffect(() => {
    loadCodes()
  }, [])

  useEffect(() => {
    filterCodes()
  }, [codes, searchTerm, selectedFilter])

  const loadCodes = async () => {
    // Mock data - replace with actual API call
    const mockCodes: RedemptionCode[] = [
      {
        id: '1',
        code: 'STUDENT2024',
        type: 'student',
        maxUses: 100,
        usedCount: 45,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        description: 'Student registration code for 2024'
      },
      {
        id: '2',
        code: 'TEACHER2024',
        type: 'teacher',
        maxUses: 50,
        usedCount: 12,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        description: 'Teacher registration code for 2024'
      },
      {
        id: '3',
        code: 'ADMIN2024',
        type: 'admin',
        maxUses: 10,
        usedCount: 3,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        description: 'Admin registration code for 2024'
      }
    ]
    setCodes(mockCodes)
  }

  const filterCodes = () => {
    let filtered = codes

    if (searchTerm) {
      filtered = filtered.filter(code =>
        code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(code => code.isActive)
        break
      case 'inactive':
        filtered = filtered.filter(code => !code.isActive)
        break
      case 'available':
        filtered = filtered.filter(code => code.usedCount < code.maxUses)
        break
      case 'expired':
        filtered = filtered.filter(code => code.usedCount >= code.maxUses)
        break
      default:
        break
    }

    setFilteredCodes(filtered)
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const createCode = (formData: any) => {
    const newCode: RedemptionCode = {
      id: Date.now().toString(),
      code: formData.code || generateCode(),
      type: formData.type,
      maxUses: parseInt(formData.maxUses),
      usedCount: 0,
      isActive: true,
      createdAt: new Date(),
      description: formData.description
    }

    setCodes([...codes, newCode])
    setShowCreateForm(false)
    toast.success('Redemption code created successfully')
  }

  const toggleCodeStatus = (codeId: string) => {
    setCodes(codes.map(code => 
      code.id === codeId ? { ...code, isActive: !code.isActive } : code
    ))
    toast.success('Code status updated')
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard')
  }

  const exportCodes = () => {
    const csvContent = [
      ['Code', 'Type', 'Max Uses', 'Used Count', 'Status', 'Created At', 'Description'],
      ...filteredCodes.map(code => [
        code.code,
        code.type,
        code.maxUses.toString(),
        code.usedCount.toString(),
        code.isActive ? 'Active' : 'Inactive',
        code.createdAt.toLocaleDateString(),
        code.description || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `redemption_codes_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Codes exported successfully')
  }

  const getStats = () => {
    const total = codes.length
    const active = codes.filter(c => c.isActive).length
    const available = codes.filter(c => c.usedCount < c.maxUses).length
    const totalUses = codes.reduce((sum, code) => sum + code.usedCount, 0)

    return { total, active, available, totalUses }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Redeem Code</h2>
          <p className="text-gray-600">Manage redemption codes for user registration</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCodes} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Code
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Codes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
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
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Uses</p>
                <p className="text-2xl font-bold">{stats.totalUses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Codes
          </CardTitle>
          <CardDescription>
            Find and manage redemption codes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by code or description..."
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
                <option value="all">All Codes</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="available">Available</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Codes List */}
      <Card>
        <CardHeader>
          <CardTitle>Redemption Codes</CardTitle>
          <CardDescription>
            Manage all redemption codes and their usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCodes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No codes found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCodes.map((code) => (
                <div key={code.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium font-mono">{code.code}</h3>
                        <Badge variant={code.type === 'student' ? 'default' : code.type === 'teacher' ? 'secondary' : 'destructive'}>
                          {code.type.toUpperCase()}
                        </Badge>
                        <Badge variant={code.isActive ? "default" : "secondary"}>
                          {code.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={code.usedCount >= code.maxUses ? "destructive" : "outline"}>
                          {code.usedCount}/{code.maxUses} Uses
                        </Badge>
                      </div>
                      {code.description && (
                        <p className="text-sm text-gray-600 mt-1">{code.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {code.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyCode(code.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleCodeStatus(code.id)}
                      >
                        {code.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Code Modal */}
      {showCreateForm && (
        <CreateCodeModal
          onSave={createCode}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  )
}

// Create Code Modal Component
function CreateCodeModal({ 
  onSave, 
  onCancel 
}: { 
  onSave: (formData: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    code: '',
    type: 'student',
    maxUses: '100',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Create Redemption Code</h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Code (leave empty for auto-generate)</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Auto-generate"
            />
          </div>
          
          <div>
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="maxUses">Maximum Uses</Label>
            <Input
              id="maxUses"
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              min="1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Code
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 