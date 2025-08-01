'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

// Simple redirect function without Firebase dependencies
const getRedirectPath = (role: string): string => {
  switch (role) {
    case 'student':
      return '/school-lab'
    case 'controller':
      return '/dashboard'
    case 'primary':
      return '/primary-controller'
    default:
      return '/login'
  }
}

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Direct instant redirection - no authentication screen
    if (!isAuthenticated || !user) {
      router.replace('/login')
    } else {
      // Immediately redirect based on role
      const redirectPath = getRedirectPath(user.role)
      router.replace(redirectPath)
    }
  }, [isAuthenticated, user, router])

  // Return nothing - instant redirect with no UI
  return null
}
