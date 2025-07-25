'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Instant redirect to the new control dashboard
    router.replace('/control-dashboard')
  }, [router])

  // Return nothing - instant redirect
  return null
} 