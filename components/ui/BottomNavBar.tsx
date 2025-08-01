'use client'

import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Home, 
  Trophy, 
  Award, 
  Users, 
  User
} from 'lucide-react'

const navItems = [
  { 
    name: 'Mentorship Lab', 
    path: '/mentorship', 
    icon: Users,
    color: 'text-purple-600'
  },
  { 
    name: 'Certificate Lab', 
    path: '/certificates', 
    icon: Award,
    color: 'text-green-600'
  },
  { 
    name: 'School Lab', 
    path: '/school-lab', 
    icon: Home,
    color: 'text-blue-600'
  },
  { 
    name: 'Leadership Lab', 
    path: '/leadership', 
    icon: Trophy,
    color: 'text-orange-600'
  },
  { 
    name: 'About Me Lab', 
    path: '/about-me', 
    icon: User,
    color: 'text-pink-600'
  }
]

export default function BottomNavBar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glassy Navigation Bar */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 shadow-lg"
      >
        <div className="max-w-md mx-auto px-4 py-2">
          {/* Navigation Items */}
          <div className="flex items-center justify-between">
            {navItems.map((item, index) => {
              const isActive = pathname === item.path
              const Icon = item.icon

              return (
                <motion.button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? item.color : 'text-slate-500'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs font-medium mt-1 ${
                    isActive ? item.color : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {item.name.split(' ')[0]}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.nav>
    </div>
  )
} 