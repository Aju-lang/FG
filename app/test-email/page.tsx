'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-toastify'
import { Mail, Check, X, AlertCircle, Settings, Send, RefreshCw } from 'lucide-react'
import { checkEmailJSConfig, sendTestEmailSimple, getEmailJSInfo } from '@/lib/emailTestUtils'

export default function TestEmailPage() {
  const [emailJSConfig, setEmailJSConfig] = useState<any>({})
  const [isConfigValid, setIsConfigValid] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadConfig = () => {
    const config = getEmailJSInfo()
    setEmailJSConfig(config)
    setIsConfigValid(checkEmailJSConfig())
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const handleRefreshConfig = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      loadConfig()
      setIsRefreshing(false)
    }, 1000)
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address')
      return
    }

    setIsSending(true)
    try {
      const success = await sendTestEmailSimple(testEmail)
      if (success) {
        toast.success(`Test email sent to ${testEmail}`)
      } else {
        toast.error('Test email failed')
        }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">EmailJS Configuration Test</h1>
          <p className="text-gray-600">Debug and test your EmailJS email delivery setup</p>
        </div>

        {/* Configuration Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration Status
            </h3>
            <Button 
              onClick={handleRefreshConfig} 
              disabled={isRefreshing}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">EmailJS Service ID</span>
              <div className="flex items-center gap-2">
                <Badge variant={emailJSConfig.serviceId !== 'Not configured' ? 'default' : 'destructive'}>
                  {emailJSConfig.serviceId !== 'Not configured' ? 'Configured' : 'Missing'}
                </Badge>
                {emailJSConfig.serviceId !== 'Not configured' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">EmailJS Template ID</span>
              <div className="flex items-center gap-2">
                <Badge variant={emailJSConfig.templateId !== 'Not configured' ? 'default' : 'destructive'}>
                  {emailJSConfig.templateId !== 'Not configured' ? 'Configured' : 'Missing'}
                </Badge>
                {emailJSConfig.templateId !== 'Not configured' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">EmailJS Public Key</span>
              <div className="flex items-center gap-2">
                <Badge variant={emailJSConfig.publicKey !== 'Not configured' ? 'default' : 'destructive'}>
                  {emailJSConfig.publicKey !== 'Not configured' ? 'Configured' : 'Missing'}
                </Badge>
                {emailJSConfig.publicKey !== 'Not configured' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Configuration Values */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Current Configuration:</h4>
            <div className="text-sm space-y-1 font-mono">
              <div>Service ID: {emailJSConfig.serviceId}</div>
              <div>Template ID: {emailJSConfig.templateId}</div>
              <div>Public Key: {emailJSConfig.publicKey}</div>
              </div>
            </div>
            
          {/* Setup Instructions */}
          {!isConfigValid && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">EmailJS Setup Required</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please configure EmailJS environment variables in your <code>.env.local</code> file:
                  </p>
                  <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs">
{`NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_d74fvdy
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_jeniuml
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=iA5O8Z0UU99XITlDE`}
                  </pre>
                  <p className="text-sm text-yellow-700 mt-2">
                    After adding the file, restart your development server and refresh this page.
                </p>
                </div>
              </div>
              </div>
            )}
        </Card>

        {/* Test Email */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Test Email
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Email Address</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email to test"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConfigValid}
              />
            </div>
            
            <Button
              onClick={handleTestEmail}
              disabled={!isConfigValid || !testEmail || isSending}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Sending...' : 'Send Test Email'}
            </Button>

            {!isConfigValid && (
              <p className="text-sm text-gray-500">
                Please configure EmailJS environment variables to enable testing.
              </p>
            )}
          </div>
        </Card>

        {/* Setup Guide */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">EmailJS Setup Guide</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium">1. Create EmailJS Account</h4>
              <p className="text-gray-600">Go to <a href="https://emailjs.com" target="_blank" className="text-blue-500 hover:underline">emailjs.com</a> and create a free account</p>
            </div>
            
            <div>
              <h4 className="font-medium">2. Add Email Service</h4>
              <p className="text-gray-600">Connect your email provider (Gmail, Outlook, etc.)</p>
            </div>
            
            <div>
              <h4 className="font-medium">3. Create Email Template</h4>
              <p className="text-gray-600">Create a template with variables like <code>{'{{to_email}}'}</code>, <code>{'{{message}}'}</code></p>
                    </div>
            
            <div>
              <h4 className="font-medium">4. Get Configuration</h4>
              <p className="text-gray-600">Copy Service ID, Template ID, and Public Key from EmailJS dashboard</p>
              </div>
            
            <div>
              <h4 className="font-medium">5. Update Environment Variables</h4>
              <p className="text-gray-600">Add the values to your <code>.env.local</code> file and restart the server</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 