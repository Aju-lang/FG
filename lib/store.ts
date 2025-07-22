import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types for our store
interface User {
  uid: string
  email: string
  name: string
  role: 'student' | 'controller'
  createdAt?: Date
  lastLogin?: Date
}

interface AuthState {
  // Auth state
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Auth actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => void
  
  // Dark mode state
  darkMode: boolean
  toggleDarkMode: () => void
  
  // Remember me functionality
  rememberedEmail: string
  rememberedUserType: 'student' | 'controller'
  setRememberedCredentials: (email: string, userType: 'student' | 'controller') => void
  clearRememberedCredentials: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial auth state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Auth actions
      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        })
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user))
        } else {
          localStorage.removeItem('currentUser')
        }
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      signOut: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        })
        localStorage.removeItem('currentUser')
        localStorage.removeItem('userProfile')
      },
      
      // Dark mode state and actions
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      // Remember me functionality
      rememberedEmail: '',
      rememberedUserType: 'student',
      
      setRememberedCredentials: (email, userType) => 
        set({ rememberedEmail: email, rememberedUserType: userType }),
      
      clearRememberedCredentials: () => 
        set({ rememberedEmail: '', rememberedUserType: 'student' }),
    }),
    {
      name: 'fg-school-auth-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        rememberedEmail: state.rememberedEmail,
        rememberedUserType: state.rememberedUserType,
      }),
    }
  )
)

// Utility hook for easy access to common auth states
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setLoading, signOut } = useAuthStore()
  return { user, isAuthenticated, isLoading, setUser, setLoading, signOut }
}

// Utility hook for dark mode
export const useDarkMode = () => {
  const { darkMode, toggleDarkMode } = useAuthStore()
  return { darkMode, toggleDarkMode }
} 