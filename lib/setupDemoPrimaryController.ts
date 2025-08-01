'use client'

import { createPrimaryController } from './primaryControllerUtils'
import { toast } from 'react-toastify'

export const setupDemoPrimaryController = async () => {
  try {
    const controllerId = 'admin'
    const password = 'admin123'
    const name = 'Primary Controller'
    const email = 'admin@fgschool.com'
    const schoolName = 'FG School'

    const result = await createPrimaryController(
      controllerId,
      password,
      name,
      email,
      schoolName
    )

    console.log('Demo Primary Controller created:', result)
    toast.success('Demo Primary Controller account created successfully!')
    toast.info('Login with: Controller ID: admin, Password: admin123')
    
    return result
  } catch (error: any) {
    console.error('Error creating demo primary controller:', error)
    
    if (error.message.includes('already exists')) {
      toast.info('Demo Primary Controller already exists. Login with: Controller ID: admin, Password: admin123')
    } else {
      toast.error('Failed to create demo primary controller')
    }
    
    throw error
  }
}

export const getDemoCredentials = () => {
  return {
    controllerId: 'admin',
    password: 'admin123',
    name: 'Primary Controller',
    email: 'admin@fgschool.com'
  }
} 