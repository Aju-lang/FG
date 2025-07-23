'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

interface UserProfile {
  uid: string
  email: string
  name: string
  role: 'student' | 'controller'
}

export default function DashboardPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = () => {
    const savedProfile = localStorage.getItem('userProfile')
    if (!savedProfile) {
      toast.error('Please log in to access the dashboard')
      router.push('/login')
      return
    }

    try {
      const profile = JSON.parse(savedProfile) as UserProfile
      if (profile.role !== 'controller') {
        toast.error('Access denied. This page is for administrators only.')
        router.push('/login')
        return
      }
      setUserProfile(profile)
    } catch (error) {
      toast.error('Invalid session. Please log in again.')
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      localStorage.removeItem('userProfile')
      localStorage.removeItem('currentUser')
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error logging out')
    }
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: 'white', fontSize: '18px' }}>Loading dashboard...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      
      {/* Header */}
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🏫</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
              FG School Dashboard
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#10b981',
                borderRadius: '50%'
              }}></div>
              <span style={{ fontSize: '14px', color: 'white' }}>
                {userProfile?.name} (Admin)
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                color: 'white',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 24px'
      }}>
        
        {/* Welcome Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '16px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Welcome to Admin Dashboard
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.8)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            You have successfully logged in as an administrator. 
            This is your clean and minimal dashboard.
          </p>
        </div>

        {/* Success Card */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>
            ✅
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '16px'
          }}>
            Login Successful!
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '32px'
          }}>
            You are now logged in as an administrator. The dashboard is clean and ready for your content.
          </p>
          
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => router.push('/school-lab')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              🏫 Visit School Lab
            </button>
            
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              🏠 Go to Home
            </button>
          </div>
        </div>

        {/* User Info */}
        <div style={{
          marginTop: '32px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
            marginBottom: '8px'
          }}>
            Logged in as:
          </p>
          <p style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            {userProfile?.email} ({userProfile?.role === 'controller' ? 'Administrator' : 'Student'})
          </p>
        </div>
      </main>
    </div>
  )
} 