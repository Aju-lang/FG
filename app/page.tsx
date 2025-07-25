'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { getRedirectPath } from '@/lib/auth'

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
