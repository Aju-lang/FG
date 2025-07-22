// lib/toolsSetup.ts

// State management with Zustand (with persistence)
import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'

// Example Zustand store setup
type StoreState = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    { name: 'app-storage' } as PersistOptions<StoreState>
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

// React Toastify for notifications
import { toast } from 'react-toastify'

// React Helmet Async for document head management
import { HelmetProvider } from 'react-helmet-async'

// Headless UI components
import { Dialog } from '@headlessui/react'

// Heroicons
import { AcademicCapIcon } from '@heroicons/react/24/outline'

// Framer Motion for animations
import { motion } from 'framer-motion'

// React Scroll Parallax
import { ParallaxProvider } from 'react-scroll-parallax'

// Export commonly used utilities
export {
  useForm,
  zodResolver,
  clsx,
  axios,
  HelmetProvider,
  Dialog,
  AcademicCapIcon,
  motion,
  ParallaxProvider,
}

// Export toast separately to avoid conflicts
export { toast }

// Type exports for better TypeScript support
export type { z } from 'zod' 