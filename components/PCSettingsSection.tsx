'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  Shield, 
  Mail, 
  Database, 
  User,
  Bell,
  Key,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'react-toastify'

interface PCSettings {
  emailNotifications: boolean
  autoBackup: boolean
  dataRetention: number
  sessionTimeout: number
  maxLoginAttempts: number
  requireTwoFactor: boolean
  emailServiceId: string
  emailTemplateId: string
  emailPublicKey: string
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  logLevel: 'error' | 'warn' | 'info' | 'debug'
}

export default function PCSettingsSection() {
  const [settings, setSettings] = useState<PCSettings>({
    emailNotifications: true,
    autoBackup: true,
    dataRetention: 365,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    requireTwoFactor: false,
    emailServiceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
    emailTemplateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
    emailPublicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
    backupFrequency: 'daily',
    logLevel: 'info'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Save to localStorage for demo
      localStorage.setItem('pc-settings', JSON.stringify(settings))
      
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        emailNotifications: true,
        autoBackup: true,
        dataRetention: 365,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        requireTwoFactor: false,
        emailServiceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
        emailTemplateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
        emailPublicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
        backupFrequency: 'daily',
        logLevel: 'info'
      })
      toast.success('Settings reset to default')
    }
  }

  const testEmailConfiguration = async () => {
    setIsLoading(true)
    try {
      // Simulate email test
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Email configuration test successful')
    } catch (error) {
      toast.error('Email configuration test failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">P.C. Settings</h2>
          <p className="text-gray-600">Configure Primary Controller settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleResetSettings} variant="outline">
            Reset to Default
          </Button>
          <Button onClick={handleSaveSettings} disabled={isSaving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Configure email service settings for student notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emailServiceId">EmailJS Service ID</Label>
              <Input
                id="emailServiceId"
                value={settings.emailServiceId}
                onChange={(e) => setSettings({ ...settings, emailServiceId: e.target.value })}
                placeholder="Enter EmailJS Service ID"
              />
            </div>
            <div>
              <Label htmlFor="emailTemplateId">EmailJS Template ID</Label>
              <Input
                id="emailTemplateId"
                value={settings.emailTemplateId}
                onChange={(e) => setSettings({ ...settings, emailTemplateId: e.target.value })}
                placeholder="Enter EmailJS Template ID"
              />
            </div>
            <div>
              <Label htmlFor="emailPublicKey">EmailJS Public Key</Label>
              <Input
                id="emailPublicKey"
                value={settings.emailPublicKey}
                onChange={(e) => setSettings({ ...settings, emailPublicKey: e.target.value })}
                placeholder="Enter EmailJS Public Key"
                type="password"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={testEmailConfiguration} 
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {isLoading ? 'Testing...' : 'Test Email Config'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Configure security and authentication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                min="5"
                max="480"
              />
            </div>
            <div>
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                min="3"
                max="10"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireTwoFactor">Require Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Enable 2FA for enhanced security</p>
              </div>
              <Switch
                id="requireTwoFactor"
                checked={settings.requireTwoFactor}
                onCheckedChange={(checked) => setSettings({ ...settings, requireTwoFactor: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Configure data retention and backup settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataRetention">Data Retention (days)</Label>
              <Input
                id="dataRetention"
                type="number"
                value={settings.dataRetention}
                onChange={(e) => setSettings({ ...settings, dataRetention: parseInt(e.target.value) })}
                min="30"
                max="3650"
              />
            </div>
            <div>
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <select
                id="backupFrequency"
                value={settings.backupFrequency}
                onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoBackup">Automatic Backup</Label>
                <p className="text-sm text-gray-500">Enable automatic data backup</p>
              </div>
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive email notifications for important events</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Information
          </CardTitle>
          <CardDescription>
            View system status and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>System Status</Label>
              <Badge variant="default" className="mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Operational
              </Badge>
            </div>
            <div>
              <Label>Last Backup</Label>
              <p className="text-sm text-gray-600 mt-1">
                {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div>
              <Label>Database Size</Label>
              <p className="text-sm text-gray-600 mt-1">2.4 MB</p>
            </div>
            <div>
              <Label>Active Sessions</Label>
              <p className="text-sm text-gray-600 mt-1">3 users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Level */}
      <Card>
        <CardHeader>
          <CardTitle>Logging Configuration</CardTitle>
          <CardDescription>
            Configure system logging level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="logLevel">Log Level</Label>
            <select
              id="logLevel"
              value={settings.logLevel}
              onChange={(e) => setSettings({ ...settings, logLevel: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
            >
              <option value="error">Error Only</option>
              <option value="warn">Warning & Error</option>
              <option value="info">Info, Warning & Error</option>
              <option value="debug">Debug (All)</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 