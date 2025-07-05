# Professional Tools Setup Guide

This project is configured with a comprehensive set of professional libraries for building modern Next.js applications.

## 🛠️ Installed Libraries

### State Management & Data Fetching
- **Zustand** - Lightweight state management with persistence
- **React Query** - Powerful data fetching and caching
- **Axios** - HTTP client for API calls

### Form Handling & Validation
- **React Hook Form** - Performant form library
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Integration between react-hook-form and zod

### UI & UX Libraries
- **React Toastify** - Beautiful toast notifications
- **@headlessui/react** - Unstyled, accessible UI components
- **@heroicons/react** - Beautiful SVG icons
- **Framer Motion** - Production-ready motion library
- **React Scroll Parallax** - Parallax scrolling effects

### Utilities
- **clsx** - Conditional className utility
- **React Helmet Async** - Document head management

## 📁 File Structure

```
lib/
├── toolsSetup.ts    # Main configuration and exports
├── examples.tsx     # Comprehensive usage examples
app/
├── layout.tsx       # Root layout with Google Fonts
├── globals.css      # Tailwind CSS imports
├── demo/
│   └── page.tsx     # Demo page showcasing all tools
```

## 🚀 Quick Start

### 1. Import Tools
```tsx
import {
  useStore,
  queryClient,
  useForm,
  zodResolver,
  toast,
  motion,
  clsx,
  // ... and more
} from '@/lib/toolsSetup'
```

### 2. State Management (Zustand)
```tsx
import { useStore } from '@/lib/toolsSetup'

function MyComponent() {
  const { darkMode, toggleDarkMode } = useStore()
  
  return (
    <button onClick={toggleDarkMode}>
      {darkMode ? '🌙' : '☀️'}
    </button>
  )
}
```

### 3. Form Validation (React Hook Form + Zod)
```tsx
import { useForm, zodResolver, exampleSchema } from '@/lib/toolsSetup'

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(exampleSchema),
  })

  const onSubmit = (data) => {
    console.log(data)
    toast.success('Form submitted!')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      <button type="submit">Submit</button>
    </form>
  )
}
```

### 4. Notifications (React Toastify)
```tsx
import { toast } from '@/lib/toolsSetup'

// Success notification
toast.success('Operation completed!')

// Error notification
toast.error('Something went wrong!')

// Info notification
toast.info('Here is some information')
```

### 5. Animations (Framer Motion)
```tsx
import { motion } from '@/lib/toolsSetup'

function AnimatedComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className="bg-blue-500 p-4 rounded"
    >
      Animated content
    </motion.div>
  )
}
```

### 6. UI Components (Headless UI)
```tsx
import { Dialog } from '@/lib/toolsSetup'

function ModalExample() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <Dialog.Panel>
        <Dialog.Title>Modal Title</Dialog.Title>
        <Dialog.Description>Modal description</Dialog.Description>
      </Dialog.Panel>
    </Dialog>
  )
}
```

### 7. Icons (Heroicons)
```tsx
import { AcademicCapIcon } from '@/lib/toolsSetup'

function IconExample() {
  return <AcademicCapIcon className="h-6 w-6 text-blue-500" />
}
```

### 8. Conditional Classes (clsx)
```tsx
import { clsx } from '@/lib/toolsSetup'

function ConditionalStyling() {
  const isActive = true
  
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded',
        isActive ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
      )}
    >
      Button
    </button>
  )
}
```

### 9. API Calls (Axios)
```tsx
import { axios } from '@/lib/toolsSetup'

async function fetchData() {
  try {
    const response = await axios.get('/api/data')
    return response.data
  } catch (error) {
    toast.error('Failed to fetch data')
    throw error
  }
}
```

## 🎨 Styling

### Google Fonts
- **Inter** - Primary font (variable: `--font-inter`)
- **Roboto** - Secondary font (variable: `--font-roboto`)

### Usage
```tsx
// In Tailwind classes
<h1 className="font-inter text-2xl">Inter Font</h1>
<p className="font-roboto">Roboto Font</p>

// In CSS
font-family: var(--font-inter);
font-family: var(--font-roboto);
```

### Dark Mode
Dark mode is enabled by default. Use Tailwind's dark mode utilities:

```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>
```

## 🧪 Demo

Visit `/demo` to see all tools in action with comprehensive examples.

## 📝 Configuration Files

### Tailwind Config (`tailwind.config.js`)
- Configured for app directory
- Dark mode enabled
- Google Fonts variables included

### PostCSS Config (`postcss.config.js`)
- Tailwind CSS plugin
- Autoprefixer plugin

### TypeScript Config (`tsconfig.json`)
- Next.js optimized
- Path aliases configured (`@/*`)

## 🔧 Environment Variables

Create a `.env.local` file for API configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 📚 Additional Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Headless UI Documentation](https://headlessui.com/)
- [Heroicons Documentation](https://heroicons.com/)

## 🚀 Next Steps

1. **Set up React Query Provider** - Wrap your app with QueryClientProvider
2. **Create API routes** - Build your backend endpoints
3. **Add more schemas** - Create Zod schemas for your data models
4. **Build components** - Create reusable UI components
5. **Add authentication** - Integrate with NextAuth.js or similar

Happy coding! 🎉 