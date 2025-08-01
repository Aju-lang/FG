'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { setupDemoPrimaryController } from '@/lib/setupDemoPrimaryController'
import { toast } from 'react-toastify'
import { 
  Settings, 
  Database, 
  Users, 
  Check, 
  Loader2,
  ArrowRight,
  AlertCircle,
  Key,
  User,
  School
} from 'lucide-react'

export default function SetupPage() {
  const router = useRouter()
  const [isSetupRunning, setIsSetupRunning] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [setupSteps, setSetupSteps] = useState({
    database: false,
    controller: false,
    students: false,
    profiles: false
  })

  const handleSetup = async () => {
    setIsSetupRunning(true)
    
    try {
      // Show progress for each step
      setSetupSteps(prev => ({ ...prev, database: true }))
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSetupSteps(prev => ({ ...prev, controller: true }))
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSetupSteps(prev => ({ ...prev, students: true }))
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Run the actual setup
      await setupDemoPrimaryController()
      
      setSetupSteps(prev => ({ ...prev, profiles: true }))
      
      setSetupComplete(true)
      toast.success('🎉 Demo setup completed successfully!')
      
    } catch (error) {
      console.error('Setup error:', error)
      toast.error('Setup failed. Please try again.')
    } finally {
      setIsSetupRunning(false)
    }
  }

  const goToLogin = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Settings className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
              🚀 FG School Setup
            </CardTitle>
            <CardDescription className="text-lg">
              Initialize your demo environment with sample data
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!setupComplete ? (
              <>
                {/* What will be created */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-500" />
                    This setup will create:
                  </h3>
                  
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        setupSteps.database ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {setupSteps.database ? <Check className="h-3 w-3 text-white" /> : <Database className="h-3 w-3 text-gray-600" />}
                      </div>
                      <div>
                        <div className="font-medium">Firebase Database Structure</div>
                        <div className="text-sm text-gray-600">Schools, controllers, and student collections</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        setupSteps.controller ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {setupSteps.controller ? <Check className="h-3 w-3 text-white" /> : <User className="h-3 w-3 text-gray-600" />}
                      </div>
                      <div>
                        <div className="font-medium">Primary Controller Account</div>
                        <div className="text-sm text-gray-600">Username: PC001 | Password: admin123</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        setupSteps.students ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {setupSteps.students ? <Check className="h-3 w-3 text-white" /> : <Users className="h-3 w-3 text-gray-600" />}
                      </div>
                      <div>
                        <div className="font-medium">Demo Students</div>
                        <div className="text-sm text-gray-600">Sample student accounts and data</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        setupSteps.profiles ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {setupSteps.profiles ? <Check className="h-3 w-3 text-white" /> : <School className="h-3 w-3 text-gray-600" />}
                      </div>
                      <div>
                        <div className="font-medium">Student Profiles</div>
                        <div className="text-sm text-gray-600">About Me lab profiles and achievements</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-yellow-800 dark:text-yellow-200">Important</div>
                    <div className="text-yellow-700 dark:text-yellow-300">
                      This will create demo data in your Firebase project. Only run this once.
                    </div>
                  </div>
                </div>

                {/* Setup button */}
                <Button
                  onClick={handleSetup}
                  disabled={isSetupRunning}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isSetupRunning ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Settings className="h-5 w-5 mr-2" />
                      Initialize Demo Environment
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* Success state */}
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Check className="h-10 w-10 text-white" />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">Setup Complete!</h3>
                    <p className="text-gray-600">Your demo environment is ready to use.</p>
                  </div>
                  
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Login Credentials
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Username:</strong> <Badge variant="secondary">PC001</Badge></div>
                      <div><strong>Password:</strong> <Badge variant="secondary">admin123</Badge></div>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={goToLogin}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Go to Login
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 