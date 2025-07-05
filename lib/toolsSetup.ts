// lib/toolsSetup.ts

// State management with Zustand (with persistence)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Example Zustand store setup
export const useStore = create(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    { name: 'app-storage' }
  )
)

// React Query client setup
import { QueryClient } from 'react-query'
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// React Hook Form + Zod for forms and validation
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Example form schema with Zod
export const exampleSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Utility for conditional class names
import clsx from 'clsx'

// Axios for HTTP requests
import axios from 'axios'

// Configure axios defaults
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
axios.defaults.timeout = 10000

// Export commonly used utilities
export {
  useForm,
  zodResolver,
  clsx,
  axios,
}

// Type exports for better TypeScript support
export type { z } from 'zod' 