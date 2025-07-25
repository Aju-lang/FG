'use client'

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  where
} from 'firebase/firestore'
import { db } from './firebase'
import { toast } from 'react-toastify'

// Types
export interface LeadershipUser {
  uid: string
  name: string
  email: string
  avatar: string
  class: string
  school: string
  region: 'North' | 'South' | 'East' | 'West'
  category: 'HS' | 'UP' | 'LP' // High School, Upper Primary, Lower Primary
  totalPoints: number
  weeklyGrowth: number
  activities: {
    attendance: number
    help: number
    certs: number
    challenges: number
  }
  badges: string[]
  recentActivity: Activity[]
}

export interface Activity {
  id: string
  type: 'certification' | 'help' | 'challenge' | 'attendance'
  description: string
  points: number
  date: string
  icon: string
}

export interface SchoolData {
  name: string
  totalPoints: number
  region: string
  color: string
}

export interface UserActivity {
  certs: number
  help: number
  challenges: number
  attendance: number
  weeklyData: {
    week: string
    points: number
  }[]
}

// Mock data for demonstration
const MOCK_LEADERSHIP_DATA: LeadershipUser[] = [
  {
    uid: '1',
    name: 'Ayesha Rahman',
    email: 'ayesha@fgschool.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayesha',
    class: '10A',
    school: 'FG Scholars',
    region: 'South',
    category: 'HS',
    totalPoints: 1540,
    weeklyGrowth: 25,
    activities: {
      attendance: 95,
      help: 45,
      certs: 12,
      challenges: 18
    },
    badges: ['Rising Star', 'Top Helper', 'Quick Learner'],
    recentActivity: [
      {
        id: '1',
        type: 'certification',
        description: 'Completed Advanced React Patterns',
        points: 100,
        date: '2024-01-20',
        icon: '🎓'
      },
      {
        id: '2',
        type: 'help',
        description: 'Helped 5 peers with JavaScript',
        points: 50,
        date: '2024-01-19',
        icon: '❤️'
      }
    ]
  },
  {
    uid: '2',
    name: 'Mohammed Ali',
    email: 'ali@fgschool.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed',
    class: '9B',
    school: 'Excellence Academy',
    region: 'North',
    category: 'HS',
    totalPoints: 1485,
    weeklyGrowth: 18,
    activities: {
      attendance: 88,
      help: 38,
      certs: 10,
      challenges: 22
    },
    badges: ['Problem Solver', 'Hall of Fame'],
    recentActivity: [
      {
        id: '3',
        type: 'challenge',
        description: 'Solved Algorithm Challenge #20',
        points: 75,
        date: '2024-01-18',
        icon: '🧩'
      }
    ]
  },
  {
    uid: '3',
    name: 'Fatima Al-Zahra',
    email: 'fatima@fgschool.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
    class: '11A',
    school: 'Future Leaders',
    region: 'East',
    category: 'HS',
    totalPoints: 1420,
    weeklyGrowth: 15,
    activities: {
      attendance: 92,
      help: 35,
      certs: 9,
      challenges: 16
    },
    badges: ['Perfect Attendance', 'Mentor'],
    recentActivity: []
  },
  {
    uid: '4',
    name: 'Omar Hassan',
    email: 'omar@fgschool.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar',
    class: '8A',
    school: 'Innovation Hub',
    region: 'West',
    category: 'UP',
    totalPoints: 1380,
    weeklyGrowth: 22,
    activities: {
      attendance: 90,
      help: 42,
      certs: 8,
      challenges: 14
    },
    badges: ['Rising Star', 'Team Player'],
    recentActivity: []
  },
  {
    uid: '5',
    name: 'Aisha Ibrahim',
    email: 'aisha@fgschool.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
    class: '7B',
    school: 'FG Scholars',
    region: 'South',
    category: 'UP',
    totalPoints: 1325,
    weeklyGrowth: 20,
    activities: {
      attendance: 94,
      help: 30,
      certs: 7,
      challenges: 12
    },
    badges: ['Quick Learner', 'Perfect Attendance'],
    recentActivity: []
  },
  {
    uid: '6',
    name: 'Yusuf Ahmed',
    email: 'yusuf@fgschool.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yusuf',
    class: '6A',
    school: 'Excellence Academy',
    region: 'North',
    category: 'UP',
    totalPoints: 1290,
    weeklyGrowth: 12,
    activities: {
      attendance: 85,
      help: 25,
      certs: 6,
      challenges: 10
    },
    badges: ['Hall of Fame'],
    recentActivity: []
  },
  {
    uid: '7',
    name: 'Khadija Noor',
    email: 'khadija@fgschool.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khadija',
    class: '5A',
    school: 'Future Leaders',
    region: 'East',
    category: 'LP',
    totalPoints: 1250,
    weeklyGrowth: 28,
    activities: {
      attendance: 98,
      help: 20,
      certs: 5,
      challenges: 8
    },
    badges: ['Rising Star', 'Perfect Attendance', 'Top Contributor'],
    recentActivity: []
  },
  {
    uid: '8',
    name: 'Hamza Ali',
    email: 'hamza@fgschool.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hamza',
    class: '4B',
    school: 'Innovation Hub',
    region: 'West',
    category: 'LP',
    totalPoints: 1210,
    weeklyGrowth: 16,
    activities: {
      attendance: 87,
      help: 18,
      certs: 4,
      challenges: 6
    },
    badges: ['Team Player', 'Quick Learner'],
    recentActivity: []
  },
  {
    uid: '9',
    name: 'Zainab Malik',
    email: 'zainab@fgschool.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zainab',
    class: '3A',
    school: 'FG Scholars',
    region: 'South',
    category: 'LP',
    totalPoints: 1180,
    weeklyGrowth: 30,
    activities: {
      attendance: 93,
      help: 15,
      certs: 3,
      challenges: 5
    },
    badges: ['Rising Star', 'Mentor'],
    recentActivity: []
  },
  {
    uid: '10',
    name: 'Ibrahim Khan',
    email: 'ibrahim@fgschool.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahim',
    class: '12A',
    school: 'Excellence Academy',
    region: 'North',
    category: 'HS',
    totalPoints: 1150,
    weeklyGrowth: 8,
    activities: {
      attendance: 91,
      help: 28,
      certs: 11,
      challenges: 15
    },
    badges: ['Hall of Fame', 'Problem Solver'],
    recentActivity: []
  }
]

// API Functions
export async function getLeadershipData(): Promise<LeadershipUser[]> {
  try {
    const leadershipRef = collection(db, 'leadership')
    const q = query(leadershipRef, orderBy('totalPoints', 'desc'), limit(50))
    const querySnapshot = await getDocs(q)
    
    const users: LeadershipUser[] = []
    querySnapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() } as LeadershipUser)
    })
    
    // Return mock data if Firestore is empty
    return users.length > 0 ? users : MOCK_LEADERSHIP_DATA
  } catch (error) {
    console.error('Error fetching leadership data:', error)
    return MOCK_LEADERSHIP_DATA
  }
}

export async function getUserProfile(uid: string): Promise<UserActivity | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return {
        certs: userData.certs || 5,
        help: userData.help || 12,
        challenges: userData.challenges || 8,
        attendance: userData.attendance || 85,
        weeklyData: userData.weeklyData || [
          { week: 'Week 1', points: 120 },
          { week: 'Week 2', points: 140 },
          { week: 'Week 3', points: 160 },
          { week: 'Week 4', points: 180 },
          { week: 'Week 5', points: 200 }
        ]
      }
    }
    
    // Return mock data for demo
    return {
      certs: 5,
      help: 12,
      challenges: 8,
      attendance: 85,
      weeklyData: [
        { week: 'Week 1', points: 120 },
        { week: 'Week 2', points: 140 },
        { week: 'Week 3', points: 160 },
        { week: 'Week 4', points: 180 },
        { week: 'Week 5', points: 200 }
      ]
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function updateUserBadges(uid: string, badges: string[]): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'leadership', uid), {
      badges,
      updatedAt: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('Error updating user badges:', error)
    return false
  }
}

export async function addUserActivity(uid: string, activity: Omit<Activity, 'id'>): Promise<boolean> {
  try {
    const activityId = Date.now().toString()
    const activityWithId = { ...activity, id: activityId }
    
    const userRef = doc(db, 'leadership', uid)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      const userData = userDoc.data()
      const recentActivity = userData.recentActivity || []
      recentActivity.unshift(activityWithId)
      
      // Keep only last 10 activities
      const limitedActivity = recentActivity.slice(0, 10)
      
      await updateDoc(userRef, {
        recentActivity: limitedActivity,
        totalPoints: (userData.totalPoints || 0) + activity.points,
        updatedAt: new Date().toISOString()
      })
      
      toast.success(`+${activity.points} points earned!`)
      return true
    }
    return false
  } catch (error) {
    console.error('Error adding user activity:', error)
    return false
  }
}

export async function getTopPerformersByCategory(category: 'HS' | 'UP' | 'LP', limitCount: number = 10): Promise<LeadershipUser[]> {
  try {
    const leadershipRef = collection(db, 'leadership')
    const q = query(
      leadershipRef,
      where('category', '==', category),
      orderBy('totalPoints', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    
    const users: LeadershipUser[] = []
    querySnapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() } as LeadershipUser)
    })
    
    // Return filtered mock data if Firestore is empty
    return users.length > 0 ? users : MOCK_LEADERSHIP_DATA.filter(user => user.category === category).slice(0, limitCount)
  } catch (error) {
    console.error('Error fetching top performers by category:', error)
    return MOCK_LEADERSHIP_DATA.filter(user => user.category === category).slice(0, limitCount)
  }
}

export async function initializeLeadershipData(): Promise<void> {
  try {
    // Check if data already exists
    const leadershipRef = collection(db, 'leadership')
    const snapshot = await getDocs(leadershipRef)
    
    if (snapshot.empty) {
      console.log('Initializing leadership demo data...')
      
      // Add mock users to Firestore
      for (const user of MOCK_LEADERSHIP_DATA) {
        await setDoc(doc(db, 'leadership', user.uid), {
          ...user,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      
      console.log('Leadership demo data initialized successfully')
    }
  } catch (error) {
    console.error('Error initializing leadership data:', error)
  }
}

// Helper function to calculate user rank
export function calculateUserRank(users: LeadershipUser[], uid: string): number | null {
  const userIndex = users.findIndex(user => user.uid === uid)
  return userIndex !== -1 ? userIndex + 1 : null
}

// Helper function to get badge description
export function getBadgeDescription(badge: string): string {
  const descriptions: Record<string, string> = {
    'Rising Star': 'Top 10% weekly growth',
    'Top Contributor': 'Most helpful to peers',
    'Hall of Fame': 'Legendary achievement',
    'Quick Learner': 'Fast course completion',
    'Team Player': 'Excellent collaboration',
    'Perfect Attendance': '100% attendance rate',
    'Problem Solver': 'Challenge champion',
    'Mentor': 'Outstanding peer support'
  }
  return descriptions[badge] || 'Special achievement'
} 