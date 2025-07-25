import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  addDoc, 
  setDoc, 
  query, 
  orderBy, 
  limit,
  where,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { toast } from 'react-toastify'

// Enhanced Types for School Lab data
export interface BonusPoints {
  uid: string
  email: string
  name: string
  dailyPoints: number
  weeklyPoints: number
  totalPoints: number
  level: number
  lastClaimedDate: string
  currentStreak: number
  category?: 'HS' | 'UP' | 'LP' // High School, Upper Primary, Lower Primary
}

export interface LeaderboardEntry {
  uid: string
  name: string
  email: string
  class: string
  category: 'Overall' | 'HS' | 'UP' | 'LP'
  totalPoints: number
  level: number
  avatar: string
  bio?: string
  achievements?: string[]
  redeemedPoints?: number
}

export interface ClassSchedule {
  id: string
  class: string
  time: string
  subject: string
  mentor: string
  day: string
  room?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  image: string
  date: string
  category: string
  type: 'LSS' | 'USS' | 'TIP' | 'Kalolsavam' | 'Sports' | 'Academic'
}

export interface TeamPoints {
  teamName: string
  points: number
  maxPoints: number
  color: string
  arts: number
  sports: number
  kalolsavam: number
}

// New Enhanced Types
export interface ABMICourse {
  id: string
  title: string
  description: string
  instructor: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  pointsRequired: number
  progress: number
  isUnlocked: boolean
  certificate?: ABMICertificate
}

export interface ABMICertificate {
  id: string
  name: string
  provider: string
  description: string
  pointsRequired: number
  isEarned: boolean
  earnedDate?: string
  image: string
}

export interface SpecialEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  type: 'Quiz' | 'Celebration' | 'Competition' | 'Workshop'
  image: string
  rsvpCount: number
  maxParticipants?: number
  isRSVPed: boolean
}

export interface StaffMember {
  id: string
  name: string
  role: 'Principal' | 'Teacher' | 'Staff'
  department: string
  qualifications: string[]
  experience: string
  image: string
  bio: string
  specializations?: string[]
}

export interface DailyReward {
  day: number
  points: number
  bonus?: string
  isCollected: boolean
}

// Bonus Points Functions
export async function getUserBonusPoints(uid: string): Promise<BonusPoints | null> {
  try {
    const bonusRef = doc(db, 'bonusPoints', uid)
    const bonusSnap = await getDoc(bonusRef)
    
    if (bonusSnap.exists()) {
      return bonusSnap.data() as BonusPoints
    }
    return null
  } catch (error) {
    console.error('Error fetching bonus points:', error)
    return null
  }
}

export async function claimDailyBonus(uid: string, email: string, name: string): Promise<boolean> {
  try {
    const today = new Date().toDateString()
    const bonusRef = doc(db, 'bonusPoints', uid)
    const bonusSnap = await getDoc(bonusRef)
    
    if (bonusSnap.exists()) {
      const data = bonusSnap.data() as BonusPoints
      
      // Check if already claimed today
      if (data.lastClaimedDate === today) {
        toast.warning('🎯 Daily bonus already claimed today!')
        return false
      }
      
      // Calculate new points and level
      const dailyBonus = 50
      const newDailyPoints = dailyBonus
      const newWeeklyPoints = data.weeklyPoints + dailyBonus
      const newTotalPoints = data.totalPoints + dailyBonus
      const newLevel = Math.floor(newTotalPoints / 500) + 1
      const newStreak = data.lastClaimedDate === new Date(Date.now() - 86400000).toDateString() 
        ? data.currentStreak + 1 
        : 1
      
      await updateDoc(bonusRef, {
        dailyPoints: newDailyPoints,
        weeklyPoints: newWeeklyPoints,
        totalPoints: newTotalPoints,
        level: newLevel,
        lastClaimedDate: today,
        currentStreak: newStreak
      })
      
      toast.success(`🎉 +${dailyBonus} bonus points claimed! Streak: ${newStreak} days`)
      return true
    } else {
      // Create new bonus points record
      const initialData: BonusPoints = {
        uid,
        email,
        name,
        dailyPoints: 50,
        weeklyPoints: 50,
        totalPoints: 50,
        level: 1,
        lastClaimedDate: today,
        currentStreak: 1
      }
      
      await setDoc(bonusRef, initialData)
      toast.success('🎉 Welcome! +50 bonus points claimed!')
      return true
    }
  } catch (error) {
    console.error('Error claiming daily bonus:', error)
    toast.error('❌ Error claiming bonus points')
    return false
  }
}

// Enhanced Leaderboard Functions
export async function getLeaderboardByCategory(category: 'Overall' | 'HS' | 'UP' | 'LP', limitCount: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const leaderboardQuery = query(
      collection(db, 'bonusPoints'),
      orderBy('totalPoints', 'desc'),
      limit(limitCount * 2) // Get more to filter by category
    )
    
    const querySnapshot = await getDocs(leaderboardQuery)
    const leaderboard: LeaderboardEntry[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as BonusPoints
      const entryCategory = data.category || getRandomCategory()
      
      if (category === 'Overall' || entryCategory === category) {
        leaderboard.push({
          uid: data.uid,
          name: data.name,
          email: data.email,
          class: `Class ${Math.floor(Math.random() * 5) + 8}`,
          category: entryCategory,
          totalPoints: data.totalPoints,
          level: data.level,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
          bio: `Passionate student excelling in ${entryCategory} studies with ${data.totalPoints} points earned.`,
          achievements: getRandomAchievements(),
          redeemedPoints: Math.floor(data.totalPoints * 0.8)
        })
      }
    })
    
    return leaderboard.slice(0, limitCount)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
}

function getRandomCategory(): 'HS' | 'UP' | 'LP' {
  const categories = ['HS', 'UP', 'LP'] as const
  return categories[Math.floor(Math.random() * categories.length)]
}

function getRandomAchievements(): string[] {
  const achievements = [
    'Top Performer 🏆',
    'Perfect Attendance 📅',
    'Math Wizard 🧮',
    'Science Star ⭐',
    'Literary Champion 📚',
    'Sports Excellence 🏃‍♂️',
    'Team Leader 👑',
    'Creative Genius 🎨'
  ]
  return achievements.slice(0, Math.floor(Math.random() * 4) + 2)
}

// ABMI Courses Functions
export async function getABMICourses(uid: string): Promise<ABMICourse[]> {
  try {
    const coursesRef = collection(db, 'abmiCourses')
    const querySnapshot = await getDocs(coursesRef)
    const courses: ABMICourse[] = []
    
    // Get user points to determine unlocked courses
    const userPoints = await getUserBonusPoints(uid)
    const totalPoints = userPoints?.totalPoints || 0
    
    querySnapshot.forEach((doc) => {
      const course = { id: doc.id, ...doc.data() } as ABMICourse
      course.isUnlocked = totalPoints >= course.pointsRequired
      courses.push(course)
    })
    
    return courses.length > 0 ? courses : getDefaultABMICourses(totalPoints)
  } catch (error) {
    console.error('Error fetching ABMI courses:', error)
    return getDefaultABMICourses(0)
  }
}

function getDefaultABMICourses(userPoints: number): ABMICourse[] {
  const courses = [
    {
      id: '1',
      title: 'Google Digital Marketing',
      description: 'Learn digital marketing fundamentals and get Google certified',
      instructor: 'Google Garage',
      duration: '40 hours',
      difficulty: 'Beginner' as const,
      pointsRequired: 100,
      progress: 0,
      isUnlocked: userPoints >= 100,
      certificate: {
        id: 'goog1',
        name: 'Google Digital Marketing Certificate',
        provider: 'Google',
        description: 'Industry-recognized digital marketing certification',
        pointsRequired: 500,
        isEarned: false,
        image: '/api/placeholder/300/200'
      }
    },
    {
      id: '2',
      title: 'Big Communication Skills',
      description: 'Master professional communication and presentation skills',
      instructor: 'Communication Experts',
      duration: '30 hours',
      difficulty: 'Intermediate' as const,
      pointsRequired: 200,
      progress: 0,
      isUnlocked: userPoints >= 200,
      certificate: {
        id: 'comm1',
        name: 'Professional Communication Certificate',
        provider: 'Big Communication',
        description: 'Advanced communication and leadership skills',
        pointsRequired: 400,
        isEarned: false,
        image: '/api/placeholder/300/200'
      }
    },
    {
      id: '3',
      title: 'Microsoft Office Specialist',
      description: 'Become proficient in Microsoft Office suite',
      instructor: 'Microsoft Learn',
      duration: '25 hours',
      difficulty: 'Beginner' as const,
      pointsRequired: 150,
      progress: 0,
      isUnlocked: userPoints >= 150,
      certificate: {
        id: 'ms1',
        name: 'Microsoft Office Specialist',
        provider: 'Microsoft',
        description: 'Certification in Microsoft Office productivity tools',
        pointsRequired: 300,
        isEarned: false,
        image: '/api/placeholder/300/200'
      }
    }
  ]
  
  return courses
}

// Special Events Functions
export async function getSpecialEvents(): Promise<SpecialEvent[]> {
  try {
    const eventsRef = collection(db, 'specialEvents')
    const querySnapshot = await getDocs(eventsRef)
    const events: SpecialEvent[] = []
    
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() } as SpecialEvent)
    })
    
    return events.length > 0 ? events : getDefaultSpecialEvents()
  } catch (error) {
    console.error('Error fetching special events:', error)
    return getDefaultSpecialEvents()
  }
}

function getDefaultSpecialEvents(): SpecialEvent[] {
  return [
    {
      id: '1',
      title: 'Gandhi Jayanthi Quiz',
      description: 'Test your knowledge about Mahatma Gandhi and win exciting prizes',
      date: '2024-10-02',
      time: '10:00 AM',
      type: 'Quiz',
      image: '/api/placeholder/400/250',
      rsvpCount: 145,
      maxParticipants: 200,
      isRSVPed: false
    },
    {
      id: '2',
      title: 'World Rose Day Celebration',
      description: 'Join us for a beautiful celebration of roses and nature',
      date: '2024-09-22',
      time: '2:00 PM',
      type: 'Celebration',
      image: '/api/placeholder/400/250',
      rsvpCount: 89,
      maxParticipants: 150,
      isRSVPed: false
    },
    {
      id: '3',
      title: 'Health & Wellness Day',
      description: 'Learn about healthy living and participate in wellness activities',
      date: '2024-10-15',
      time: '9:00 AM',
      type: 'Workshop',
      image: '/api/placeholder/400/250',
      rsvpCount: 76,
      maxParticipants: 100,
      isRSVPed: false
    }
  ]
}

// Staff Members Functions
export async function getStaffMembers(): Promise<StaffMember[]> {
  try {
    const staffRef = collection(db, 'staffMembers')
    const querySnapshot = await getDocs(staffRef)
    const staff: StaffMember[] = []
    
    querySnapshot.forEach((doc) => {
      staff.push({ id: doc.id, ...doc.data() } as StaffMember)
    })
    
    return staff.length > 0 ? staff : getDefaultStaffMembers()
  } catch (error) {
    console.error('Error fetching staff members:', error)
    return getDefaultStaffMembers()
  }
}

function getDefaultStaffMembers(): StaffMember[] {
  return [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      role: 'Principal',
      department: 'Administration',
      qualifications: ['Ph.D. in Education', 'M.Ed.', 'B.Ed.'],
      experience: '20+ years in educational leadership',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=principal',
      bio: 'Dr. Sharma brings two decades of educational excellence and innovative leadership to FG School.',
      specializations: ['Educational Leadership', 'Curriculum Development', 'Student Welfare']
    },
    {
      id: '2',
      name: 'Prof. Rajesh Kumar',
      role: 'Teacher',
      department: 'Mathematics',
      qualifications: ['M.Sc. Mathematics', 'B.Ed.', 'Certified Math Teacher'],
      experience: '15 years teaching experience',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=math-teacher',
      bio: 'Prof. Kumar is passionate about making mathematics accessible and enjoyable for all students.',
      specializations: ['Advanced Mathematics', 'Problem Solving', 'Mathematical Modeling']
    },
    {
      id: '3',
      name: 'Ms. Anita Menon',
      role: 'Teacher',
      department: 'Science',
      qualifications: ['M.Sc. Physics', 'B.Ed.', 'Research Scholar'],
      experience: '12 years in science education',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=science-teacher',
      bio: 'Ms. Menon inspires students through hands-on experiments and real-world applications.',
      specializations: ['Physics', 'Laboratory Management', 'Scientific Research']
    }
  ]
}

// RSVP Functions
export async function toggleEventRSVP(uid: string, eventId: string): Promise<boolean> {
  try {
    const rsvpRef = doc(db, 'eventRSVPs', `${uid}_${eventId}`)
    const rsvpSnap = await getDoc(rsvpRef)
    
    if (rsvpSnap.exists()) {
      // Cancel RSVP
      await updateDoc(rsvpRef, { isRSVPed: false })
      return false
    } else {
      // Create RSVP
      await setDoc(rsvpRef, {
        uid,
        eventId,
        isRSVPed: true,
        rsvpDate: new Date().toISOString()
      })
      return true
    }
  } catch (error) {
    console.error('Error toggling RSVP:', error)
    return false
  }
}

// Enhanced Team Points Functions
export async function getEnhancedTeamPoints(): Promise<TeamPoints[]> {
  try {
    const teamsRef = collection(db, 'enhancedTeamPoints')
    const querySnapshot = await getDocs(teamsRef)
    const teams: TeamPoints[] = []
    
    querySnapshot.forEach((doc) => {
      teams.push(doc.data() as TeamPoints)
    })
    
    return teams.length > 0 ? teams : getDefaultEnhancedTeams()
  } catch (error) {
    console.error('Error fetching enhanced team points:', error)
    return getDefaultEnhancedTeams()
  }
}

function getDefaultEnhancedTeams(): TeamPoints[] {
  return [
    {
      teamName: 'Alpha',
      points: 2150,
      maxPoints: 3000,
      color: 'red-500',
      arts: 750,
      sports: 680,
      kalolsavam: 720
    },
    {
      teamName: 'Beta',
      points: 1980,
      maxPoints: 3000,
      color: 'green-500',
      arts: 720,
      sports: 650,
      kalolsavam: 610
    },
    {
      teamName: 'Gamma',
      points: 2320,
      maxPoints: 3000,
      color: 'yellow-500',
      arts: 820,
      sports: 750,
      kalolsavam: 750
    }
  ]
}

// Daily Reward System Functions
export async function getUserDailyRewards(uid: string): Promise<DailyReward[]> {
  try {
    const rewardsRef = doc(db, 'dailyRewards', uid)
    const rewardsSnap = await getDoc(rewardsRef)
    
    if (rewardsSnap.exists()) {
      return rewardsSnap.data().rewards || getDefaultDailyRewards()
    }
    return getDefaultDailyRewards()
  } catch (error) {
    console.error('Error fetching daily rewards:', error)
    return getDefaultDailyRewards()
  }
}

function getDefaultDailyRewards(): DailyReward[] {
  return [
    { day: 1, points: 50, isCollected: false },
    { day: 2, points: 75, isCollected: false },
    { day: 3, points: 100, bonus: '🎁 Bonus Item', isCollected: false },
    { day: 4, points: 125, isCollected: false },
    { day: 5, points: 150, isCollected: false },
    { day: 6, points: 200, bonus: '💎 Premium Reward', isCollected: false },
    { day: 7, points: 300, bonus: '👑 Weekly Champion', isCollected: false },
  ]
}

export async function claimDailyReward(uid: string, day: number): Promise<boolean> {
  try {
    const rewardsRef = doc(db, 'dailyRewards', uid)
    const rewardsSnap = await getDoc(rewardsRef)
    
    let rewards = rewardsSnap.exists() 
      ? rewardsSnap.data().rewards 
      : getDefaultDailyRewards()
    
    const reward = rewards.find((r: DailyReward) => r.day === day)
    if (!reward || reward.isCollected) {
      return false
    }
    
    // Mark as collected
    reward.isCollected = true
    
    await setDoc(rewardsRef, { rewards }, { merge: true })
    
    // Update user points
    const bonusRef = doc(db, 'bonusPoints', uid)
    const bonusSnap = await getDoc(bonusRef)
    
    if (bonusSnap.exists()) {
      const data = bonusSnap.data() as BonusPoints
      await updateDoc(bonusRef, {
        totalPoints: data.totalPoints + reward.points,
        weeklyPoints: data.weeklyPoints + reward.points
      })
    }
    
    return true
  } catch (error) {
    console.error('Error claiming daily reward:', error)
    return false
  }
}

// Achievements Functions
export async function getSchoolAchievements(): Promise<Achievement[]> {
  try {
    const achievementsRef = collection(db, 'achievements')
    const querySnapshot = await getDocs(achievementsRef)
    const achievements: Achievement[] = []
    
    querySnapshot.forEach((doc) => {
      achievements.push({
        id: doc.id,
        ...doc.data()
      } as Achievement)
    })
    
    return achievements.length > 0 ? achievements : getDefaultAchievements()
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return getDefaultAchievements()
  }
}

function getDefaultAchievements(): Achievement[] {
  return [
    {
      id: '1',
      title: '🏆 Science Fair Winner',
      description: 'Outstanding innovation in renewable energy solutions that impressed all judges.',
      image: '/api/placeholder/300/200',
      date: '2024-01-15',
      category: 'Academic'
    },
    {
      id: '2',
      title: '🎭 Drama Excellence',
      description: 'Spectacular performance in annual school play received standing ovation.',
      image: '/api/placeholder/300/200',
      date: '2024-01-10',
      category: 'Arts'
    },
    {
      id: '3',
      title: '⚽ Sports Championship',
      description: 'Incredible teamwork led to victory in inter-school football tournament.',
      image: '/api/placeholder/300/200',
      date: '2024-01-05',
      category: 'Sports'
    },
    {
      id: '4',
      title: '🌱 Environmental Impact',
      description: 'Student-led initiative planted 500 trees and reduced school carbon footprint.',
      image: '/api/placeholder/300/200',
      date: '2023-12-20',
      category: 'Environment'
    }
  ]
}

// Team Competition Functions
export async function getTeamPoints(): Promise<TeamPoints[]> {
  try {
    const teamsRef = collection(db, 'teamCompetition')
    const querySnapshot = await getDocs(teamsRef)
    const teams: TeamPoints[] = []
    
    querySnapshot.forEach((doc) => {
      teams.push(doc.data() as TeamPoints)
    })
    
    return teams.length > 0 ? teams : getDefaultTeams()
  } catch (error) {
    console.error('Error fetching team points:', error)
    return getDefaultTeams()
  }
}

function getDefaultTeams(): TeamPoints[] {
  return [
    {
      teamName: 'Alpha',
      points: 750,
      maxPoints: 1000,
      color: 'red-500'
    },
    {
      teamName: 'Beta',
      points: 680,
      maxPoints: 1000,
      color: 'green-500'
    },
    {
      teamName: 'Gamma',
      points: 820,
      maxPoints: 1000,
      color: 'yellow-500'
    }
  ]
}

// Initialize demo data if needed
export async function initializeDemoData(): Promise<void> {
  try {
    // Initialize enhanced demo data first
    await initializeEnhancedDemoData()
    
    // Initialize default class schedule
    const scheduleData = getDefaultSchedule()
    for (const item of scheduleData) {
      const scheduleRef = doc(db, 'classSchedule', item.id)
      await setDoc(scheduleRef, item, { merge: true })
    }
    
    // Initialize default achievements
    const achievementsData = getDefaultAchievements()
    for (const achievement of achievementsData) {
      const achievementRef = doc(db, 'achievements', achievement.id)
      await setDoc(achievementRef, achievement, { merge: true })
    }
    
    // Initialize default team points
    const teamsData = getDefaultTeams()
    for (const team of teamsData) {
      const teamRef = doc(db, 'teamCompetition', team.teamName.toLowerCase())
      await setDoc(teamRef, team, { merge: true })
    }
    
    console.log('Demo data initialized successfully')
  } catch (error) {
    console.error('Error initializing demo data:', error)
  }
} 

// Initialize enhanced demo data
export async function initializeEnhancedDemoData(): Promise<void> {
  try {
    // Initialize ABMI courses
    const coursesData = getDefaultABMICourses(0)
    for (const course of coursesData) {
      const courseRef = doc(db, 'abmiCourses', course.id)
      await setDoc(courseRef, course, { merge: true })
    }
    
    // Initialize special events
    const eventsData = getDefaultSpecialEvents()
    for (const event of eventsData) {
      const eventRef = doc(db, 'specialEvents', event.id)
      await setDoc(eventRef, event, { merge: true })
    }
    
    // Initialize staff members
    const staffData = getDefaultStaffMembers()
    for (const staff of staffData) {
      const staffRef = doc(db, 'staffMembers', staff.id)
      await setDoc(staffRef, staff, { merge: true })
    }
    
    // Initialize enhanced team points
    const teamsData = getDefaultEnhancedTeams()
    for (const team of teamsData) {
      const teamRef = doc(db, 'enhancedTeamPoints', team.teamName.toLowerCase())
      await setDoc(teamRef, team, { merge: true })
    }
    
    console.log('Enhanced demo data initialized successfully')
  } catch (error) {
    console.error('Error initializing enhanced demo data:', error)
  }
}

// Class Schedule Functions
export async function getClassSchedule(): Promise<ClassSchedule[]> {
  try {
    const scheduleRef = collection(db, 'classSchedule')
    const querySnapshot = await getDocs(scheduleRef)
    const schedule: ClassSchedule[] = []
    
    querySnapshot.forEach((doc) => {
      schedule.push({
        id: doc.id,
        ...doc.data()
      } as ClassSchedule)
    })
    
    return schedule.length > 0 ? schedule : getDefaultSchedule()
  } catch (error) {
    console.error('Error fetching class schedule:', error)
    return getDefaultSchedule()
  }
}

function getDefaultSchedule(): ClassSchedule[] {
  return [
    {
      id: '1',
      class: 'Math Advanced',
      time: '09:00 - 10:30',
      subject: 'Calculus',
      mentor: 'Dr. Sarah Johnson',
      day: 'Monday'
    },
    {
      id: '2',
      class: 'Science Lab',
      time: '10:45 - 12:15',
      subject: 'Physics',
      mentor: 'Prof. Mike Chen',
      day: 'Monday'
    },
    {
      id: '3',
      class: 'Literature',
      time: '13:30 - 15:00',
      subject: 'English',
      mentor: 'Ms. Emily Rodriguez',
      day: 'Monday'
    },
    {
      id: '4',
      class: 'Programming',
      time: '15:15 - 16:45',
      subject: 'Computer Science',
      mentor: 'Dr. Alex Kumar',
      day: 'Monday'
    }
  ]
}

// Legacy function for backward compatibility
export async function getLeaderboard(limitCount: number = 10): Promise<LeaderboardEntry[]> {
  return getLeaderboardByCategory('Overall', limitCount)
}

 