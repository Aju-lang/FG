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
    label: 'Mentor',
    icon: MdWorkspaces,
    path: '/mentorship',
    color: 'text-purple-400'
  },
  {
    id: 'certificates',
    label: 'Certs',
    icon: MdBadge,
    path: '/certificates',
    color: 'text-green-400'
  },
  {
    id: 'school-lab',
    label: 'Home',
    icon: MdSchool,
    path: '/school-lab',
    color: 'text-blue-400'
  },
  {
    id: 'leadership',
    label: 'Leaders',
    icon: MdEmojiEvents,
    path: '/leadership',
    color: 'text-orange-400'
  },
  {
    id: 'about-me',
    label: 'Profile',
    icon: MdPerson,
    path: '/about-me',
    color: 'text-pink-400'
  }
]

export default function BottomNavBar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigation = (path: string) => {
    if (navigator.vibrate) {
      navigator.vibrate(30)
    }
    router.push(path)
  }

  const isActive = (path: string) => {
    return pathname === path || (pathname === '/' && path === '/school-lab')
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
    >
      {/* Compact Navigation Container */}
      <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl px-2 py-2">
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className="relative flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-300"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Active Background */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl border border-blue-500/30"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  animate={{
                    scale: active ? 1.1 : 1,
                    y: active ? -1 : 0
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative z-10 mb-1"
                >
                  <Icon 
                    className={cn(
                      "w-5 h-5 transition-colors duration-300",
                      active 
                        ? item.color
                        : "text-slate-500"
                    )}
                  />
                </motion.div>
                
                {/* Label */}
                <motion.span
                  animate={{
                    opacity: active ? 1 : 0.7,
                    fontWeight: active ? 600 : 500,
                    color: active ? 'rgb(255, 255, 255)' : 'rgb(148, 163, 184)'
                  }}
                  transition={{ duration: 0.2 }}
                  className="text-xs leading-none relative z-10"
                >
                  {item.label}
                </motion.span>

                {/* Active Dot */}
                {active && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
} 