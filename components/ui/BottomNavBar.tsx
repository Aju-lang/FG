'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  MdSchool, 
  MdWorkspaces, 
  MdEmojiEvents, 
  MdPerson,
  MdBadge
} from 'react-icons/md'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  color: string
}

const navItems: NavItem[] = [
  {
    id: 'mentorship',
    label: 'Mentorship',
    icon: MdWorkspaces,
    path: '/mentorship',
    color: 'text-purple-500'
  },
  {
    id: 'certificates',
    label: 'Certificates',
    icon: MdBadge,
    path: '/certificates',
    color: 'text-green-500'
  },
  {
    id: 'school-lab',
    label: 'School Lab',
    icon: MdSchool,
    path: '/school-lab',
    color: 'text-blue-500'
  },
  {
    id: 'leadership',
    label: 'Leadership',
    icon: MdEmojiEvents,
    path: '/leadership',
    color: 'text-orange-500'
  },
  {
    id: 'about-me',
    label: 'About Me',
    icon: MdPerson,
    path: '/about-me',
    color: 'text-pink-500'
  }
]

export default function BottomNavBar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigation = (path: string) => {
    // Add subtle vibration on mobile devices
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
    router.push(path)
  }

  const isActive = (path: string) => {
    if (path === '/school-lab') {
      return pathname === '/school-lab' || pathname === '/'
    }
    return pathname === path
  }

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
    >
      {/* Glassmorphism Container */}
      <div className="bg-white/20 dark:bg-slate-900/30 backdrop-blur-xl border-t border-white/20 dark:border-slate-700/30">
        {/* Navigation Items */}
        <div className="flex justify-between items-center px-4 py-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-2xl min-w-[60px] transition-all duration-300",
                  "hover:bg-white/20 dark:hover:bg-slate-800/30 active:scale-95"
                )}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                aria-label={`Navigate to ${item.label}`}
              >
                {/* Active Indicator Background */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* Icon with Animation */}
                <motion.div
                  animate={{
                    scale: active ? 1.2 : 1,
                    y: active ? -2 : 0
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative z-10"
                >
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-colors duration-300",
                      active 
                        ? item.color
                        : "text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                    )}
                  />
                </motion.div>
                
                {/* Label with Slide Animation */}
                <motion.span
                  animate={{
                    opacity: active ? 1 : 0.7,
                    y: active ? 0 : 2,
                    fontWeight: active ? 600 : 500
                  }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "text-xs mt-1 transition-colors duration-300 relative z-10",
                    active 
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  {item.label}
                </motion.span>
                
                {/* Active Dot Indicator */}
                {active && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
        
        {/* Safe Area Padding for iOS */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </motion.div>
  )
}

// Optional: Add this to your global CSS for safe area support
// @supports (padding: max(0px)) {
//   .pb-safe {
//     padding-bottom: max(env(safe-area-inset-bottom), 1rem);
//   }
//   .h-safe-area-inset-bottom {
//     height: env(safe-area-inset-bottom);
//   }
// } 