// lib/examples.tsx - Comprehensive examples for all professional tools

import React from 'react'
import {
  useStore,
  queryClient,
  useForm,
  zodResolver,
  exampleSchema,
  toast,
  HelmetProvider,
  Dialog,
  AcademicCapIcon,
  clsx,
  motion,
  ParallaxProvider,
  axios,
  z,
} from './toolsSetup'

// ============================================================================
// ZUSTAND STATE MANAGEMENT EXAMPLE
// ============================================================================

export function ZustandExample() {
  const { darkMode, toggleDarkMode } = useStore()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleDarkMode}
      className={clsx(
        'px-4 py-2 rounded-lg font-inter',
        darkMode ? 'bg-gray-800 text-white' : 'bg-blue-500 text-white'
      )}
    >
      {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </motion.button>
  )
}

// ============================================================================
// REACT HOOK FORM + ZOD VALIDATION EXAMPLE
// ============================================================================

type FormData = z.infer<typeof exampleSchema>

export function FormExample() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(exampleSchema),
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
    toast.success('Form submitted successfully!')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <input
          {...register('password')}
          type="password"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Submit
      </motion.button>
    </form>
  )
}

// ============================================================================
// HEADLESS UI DIALOG EXAMPLE
// ============================================================================

export function DialogExample() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Open Dialog
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium">Example Dialog</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              This is an example dialog using Headless UI.
            </Dialog.Description>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  toast.success('Action completed!')
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
}

// ============================================================================
// HEROICONS EXAMPLE
// ============================================================================

export function IconsExample() {
  return (
    <div className="flex items-center space-x-4">
      <AcademicCapIcon className="h-6 w-6 text-blue-500" />
      <span className="text-gray-700 dark:text-gray-300">Education Icon</span>
    </div>
  )
}

// ============================================================================
// REACT SCROLL PARALLAX EXAMPLE
// ============================================================================

export function ParallaxExample() {
  return (
    <ParallaxProvider>
      <div className="h-screen overflow-hidden">
        <div className="relative h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-purple-600" />
          <div className="relative z-10 flex items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center text-white"
            >
              <h1 className="text-6xl font-bold font-inter mb-4">
                Parallax Example
              </h1>
              <p className="text-xl font-roboto">
                Scroll to see the parallax effect
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </ParallaxProvider>
  )
}

// ============================================================================
// AXIOS API CALL EXAMPLE
// ============================================================================

export function ApiExample() {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/example')
      setData(response.data)
      toast.success('Data fetched successfully!')
    } catch (error) {
      toast.error('Failed to fetch data')
      console.error('API Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={fetchData}
        disabled={loading}
        className={clsx(
          'px-4 py-2 rounded-md font-inter',
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 text-white'
        )}
      >
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      
      {data && (
        <pre className="bg-gray-100 p-4 rounded-md text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}

// ============================================================================
// COMPREHENSIVE EXAMPLE COMPONENT
// ============================================================================

export function ComprehensiveExample() {
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Professional Tools Demo
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-roboto">
                Examples of all the professional libraries in action
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">State Management</h2>
                <ZustandExample />
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Form Validation</h2>
                <FormExample />
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">UI Components</h2>
                <div className="space-y-4">
                  <DialogExample />
                  <IconsExample />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">API Integration</h2>
                <ApiExample />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </HelmetProvider>
  )
} 