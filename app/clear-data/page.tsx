'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-toastify'
import { 
  Trash2, 
  Users, 
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Settings
} from 'lucide-react'
import { 
  clearAllPrimaryData, 
  getAllPrimaryData 
} from '@/lib/primaryDataStorage'
// Removed Firebase auth cleanup imports

export default function ClearDataPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [primaryDataCount, setPrimaryDataCount] = useState(0)
  const [authUsersCount, setAuthUsersCount] = useState(0)
  const [firestoreUsersCount, setFirestoreUsersCount] = useState(0)
  const [duplicates, setDuplicates] = useState<any[]>([])
  const [emailJSConfig, setEmailJSConfig] = useState<any>({})
  const [emailJSTestResult, setEmailJSTestResult] = useState<any>(null)
  const [emailToRemove, setEmailToRemove] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load counts
      const primaryData = await getAllPrimaryData()
      setPrimaryDataCount(primaryData.length)

      // Auth data removed - Firebase auth no longer available
      setAuthUsersCount(0)
      setFirestoreUsersCount(0)
      setDuplicates([])
      setEmailJSConfig({})
      setEmailJSTestResult(null)

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearPrimaryData = async () => {
    if (!confirm('Are you sure you want to clear ALL primary data? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      await clearAllPrimaryData()
      toast.success('Primary data cleared successfully')
      setPrimaryDataCount(0)
    } catch (error) {
      console.error('Error clearing primary data:', error)
      toast.error('Failed to clear primary data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveDuplicates = async () => {
    toast.info('Duplicate removal skipped - Firebase auth removed')
  }

  const handleRemoveEmail = async () => {
    toast.info('Email removal skipped - Firebase auth removed')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Management & Cleanup</h1>
          <p className="text-gray-600">Manage and clean up your school portal data</p>
        </div>

        {/* Data Overview */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Data Overview
            </h3>
            <Button 
              onClick={loadData} 
              disabled={isLoading}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{primaryDataCount}</div>
              <div className="text-sm text-blue-800">Primary Data Records</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{authUsersCount}</div>
              <div className="text-sm text-green-800">Auth Users</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{firestoreUsersCount}</div>
              <div className="text-sm text-purple-800">Firestore Users</div>
            </div>
          </div>
        </Card>

        {/* Duplicate Users */}
        {duplicates.length > 0 && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Duplicate Users Found
              </h3>
              <Button 
                onClick={handleRemoveDuplicates}
                disabled={isLoading}
                variant="destructive"
                size="sm"
              >
                Remove Duplicates
              </Button>
            </div>
            
            <div className="space-y-2">
              {duplicates.map((duplicate, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="font-medium">{duplicate.email}</div>
                    <div className="text-sm text-gray-600">{duplicate.count} accounts found</div>
                  </div>
                  <Badge variant="destructive">{duplicate.count} duplicates</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Remove Specific Email */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Remove Specific Email
          </h3>
          
          <div className="flex gap-2">
            <input
              type="email"
              value={emailToRemove}
              onChange={(e) => setEmailToRemove(e.target.value)}
              placeholder="Enter email to remove all accounts"
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Button 
              onClick={handleRemoveEmail}
              disabled={!emailToRemove || isLoading}
              variant="destructive"
            >
              Remove
            </Button>
          </div>
        </Card>

        {/* EmailJS Configuration */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            EmailJS Configuration
          </h3>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Service ID</span>
              <Badge variant={emailJSConfig.serviceId !== 'Not configured' ? 'default' : 'destructive'}>
                {emailJSConfig.serviceId}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Template ID</span>
              <Badge variant={emailJSConfig.templateId !== 'Not configured' ? 'default' : 'destructive'}>
                {emailJSConfig.templateId}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Public Key</span>
              <Badge variant={emailJSConfig.publicKey !== 'Not configured' ? 'default' : 'destructive'}>
                {emailJSConfig.publicKey}
              </Badge>
            </div>
          </div>

          {emailJSTestResult && (
            <div className={`p-3 rounded-lg ${
              emailJSTestResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {emailJSTestResult.valid ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">
                  {emailJSTestResult.valid ? 'EmailJS Configuration Valid' : 'EmailJS Configuration Invalid'}
                </span>
              </div>
              {emailJSTestResult.error && (
                <p className="text-sm mt-1">{emailJSTestResult.error}</p>
              )}
            </div>
          )}
        </Card>

        {/* Clear All Data */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Clear All Primary Data
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            This will permanently delete all student data from the primary database. This action cannot be undone.
          </p>
          
          <Button 
            onClick={handleClearPrimaryData}
            disabled={isLoading || primaryDataCount === 0}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Primary Data ({primaryDataCount} records)
          </Button>
        </Card>
      </div>
    </div>
  )
} 