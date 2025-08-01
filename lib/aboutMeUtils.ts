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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'
import { toast } from 'react-toastify'

// Types
export interface UserProfile {
  uid: string
  name: string
  email: string
  role: 'Student' | 'Teacher' | 'Controller'
  grade?: string
  bio?: string
  mission?: string
  skills: string[]
  profileImage?: string
  phone?: string
  location?: string
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

export interface UserActivity {
  totalPoints: number
  certificates: number
  lastLogin: string
  rewardPoints: number
  timeline: TimelineEvent[]
}

export interface UserContribution {
  id: string
  type: 'event' | 'project' | 'leadership' | 'recognition'
  title: string
  description: string
  date: string
  points?: number
  status?: 'completed' | 'ongoing' | 'pending'
}

export interface TimelineEvent {
  id: string
  type: 'certificate' | 'achievement' | 'event' | 'project' | 'recognition'
  title: string
  description: string
  date: string
  points?: number
  icon?: string
}

// Mock data for demonstration
const MOCK_USER_PROFILE: Partial<UserProfile> = {
  role: 'Student',
  grade: 'Grade 10',
  bio: 'Passionate about technology and learning. I love exploring new programming languages and working on innovative projects that can make a difference in the world.',
  mission: 'To become a skilled software engineer and contribute to building technology that solves real-world problems and helps make education more accessible.',
  skills: ['Programming', 'Mathematics', 'Leadership', 'Communication'],
  phone: '+91 98765 43210',
  location: 'Mumbai, Maharashtra',
  isPrivate: false
}

const MOCK_USER_ACTIVITY: UserActivity = {
  totalPoints: 2450,
  certificates: 8,
  lastLogin: 'Today',
  rewardPoints: 150,
  timeline: [
    {
      id: '1',
      type: 'certificate',
      title: 'React Fundamentals',
      description: 'Completed advanced React course with 95% score',
      date: '2024-01-20',
      points: 100
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Top Performer',
      description: 'Ranked #1 in monthly coding challenge',
      date: '2024-01-15',
      points: 200
    },
    {
      id: '3',
      type: 'event',
      title: 'Tech Conference 2024',
      description: 'Attended annual technology conference and workshops',
      date: '2024-01-10',
      points: 50
    },
    {
      id: '4',
      type: 'project',
      title: 'School Management System',
      description: 'Built a full-stack web application for school administration',
      date: '2024-01-05',
      points: 150
    },
    {
      id: '5',
      type: 'recognition',
      title: 'Student of the Month',
      description: 'Recognized for outstanding academic performance and leadership',
      date: '2023-12-30',
      points: 100
    }
  ]
}

const MOCK_USER_CONTRIBUTIONS: UserContribution[] = [
  {
    id: '1',
    type: 'event',
    title: 'Annual Science Fair',
    description: 'Presented project on renewable energy solutions',
    date: '2024-01-15',
    points: 100,
    status: 'completed'
  },
  {
    id: '2',
    type: 'project',
    title: 'Student Portal Development',
    description: 'Collaborated on building the school student portal',
    date: '2024-01-10',
    points: 200,
    status: 'completed'
  },
  {
    id: '3',
    type: 'leadership',
    title: 'Class Representative',
    description: 'Served as class representative for academic year 2023-24',
    date: '2023-09-01',
    status: 'ongoing'
  },
  {
    id: '4',
    type: 'recognition',
    title: 'Academic Excellence Award',
    description: 'Received award for maintaining top 5 rank throughout the year',
    date: '2023-12-20',
    points: 150,
    status: 'completed'
  },
  {
    id: '5',
    type: 'event',
    title: 'Mathematics Olympiad',
    description: 'Participated in state-level mathematics competition',
    date: '2023-11-25',
    points: 75,
    status: 'completed'
  },
  {
    id: '6',
    type: 'project',
    title: 'Environmental Awareness Campaign',
    description: 'Led campaign for plastic-free school initiative',
    date: '2023-10-15',
    points: 125,
    status: 'completed'
  }
]

// API Functions
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    // Check both collections for backward compatibility
    let userDoc = await getDoc(doc(db, 'aboutMeProfiles', uid))
    
    if (!userDoc.exists()) {
      // Fallback to old collection
      userDoc = await getDoc(doc(db, 'userProfiles', uid))
    }
    
    if (userDoc.exists()) {
      const data = userDoc.data()
      return { 
        uid, 
        name: data.name || 'Student',
        email: data.email || 'student@school.edu',
        ...data 
      } as UserProfile
    }
    
    // Return mock data for demo with user info
    return {
      uid,
      name: 'Demo Student',
      email: 'student@test.com',
      ...MOCK_USER_PROFILE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as UserProfile
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function updateUserProfile(uid: string, profileData: Partial<UserProfile>): Promise<boolean> {
  try {
    await setDoc(doc(db, 'aboutMeProfiles', uid), {
      ...profileData,
      uid,
      updatedAt: new Date().toISOString()
    }, { merge: true })
    
    return true
  } catch (error) {
    console.error('Error updating user profile:', error)
    return false
  }
}

export async function getUserActivity(uid: string): Promise<UserActivity | null> {
  try {
    // Check new collection first
    let activityDoc = await getDoc(doc(db, 'userActivity', uid))
    
    if (!activityDoc.exists()) {
      // Fallback to old collection name
      activityDoc = await getDoc(doc(db, 'userActivities', uid))
    }
    
    if (activityDoc.exists()) {
      return activityDoc.data() as UserActivity
    }
    
    // Return mock data for demo
    return MOCK_USER_ACTIVITY
  } catch (error) {
    console.error('Error fetching user activity:', error)
    return null
  }
}

export async function updateUserActivity(uid: string, activityData: Partial<UserActivity>): Promise<boolean> {
  try {
    await setDoc(doc(db, 'userActivities', uid), {
      ...activityData,
      updatedAt: new Date().toISOString()
    }, { merge: true })
    
    return true
  } catch (error) {
    console.error('Error updating user activity:', error)
    return false
  }
}

export async function getUserContributions(uid: string): Promise<UserContribution[]> {
  try {
    // Check new collection structure first
    const contributionsDoc = await getDoc(doc(db, 'userContributions', uid))
    if (contributionsDoc.exists()) {
      const data = contributionsDoc.data()
      return data.contributions || []
    }
    
    // Fallback to old subcollection structure
    const contributionsRef = collection(db, `userProfiles/${uid}/contributions`)
    const q = query(contributionsRef, orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const contributions: UserContribution[] = []
    querySnapshot.forEach((doc) => {
      contributions.push({ id: doc.id, ...doc.data() } as UserContribution)
    })
    
    // Return mock data if Firestore is empty
    return contributions.length > 0 ? contributions : MOCK_USER_CONTRIBUTIONS
  } catch (error) {
    console.error('Error fetching user contributions:', error)
    return MOCK_USER_CONTRIBUTIONS
  }
}

export async function addUserContribution(uid: string, contribution: Omit<UserContribution, 'id'>): Promise<boolean> {
  try {
    const contributionId = Date.now().toString()
    await setDoc(doc(db, `userProfiles/${uid}/contributions`, contributionId), {
      ...contribution,
      id: contributionId
    })
    
    // Also add to timeline if it has points
    if (contribution.points) {
      await addTimelineEvent(uid, {
        type: contribution.type as any,
        title: contribution.title,
        description: contribution.description,
        date: contribution.date,
        points: contribution.points
      })
    }
    
    toast.success('Contribution added successfully!')
    return true
  } catch (error) {
    console.error('Error adding user contribution:', error)
    return false
  }
}

export async function addTimelineEvent(uid: string, event: Omit<TimelineEvent, 'id'>): Promise<boolean> {
  try {
    const eventId = Date.now().toString()
    const timelineEvent = { ...event, id: eventId }
    
    // Get current activity data
    const activityDoc = await getDoc(doc(db, 'userActivities', uid))
    let currentActivity = activityDoc.exists() ? activityDoc.data() as UserActivity : MOCK_USER_ACTIVITY
    
    // Add new event to timeline
    const updatedTimeline = [timelineEvent, ...(currentActivity.timeline || [])]
    
    // Update total points if event has points
    const updatedPoints = currentActivity.totalPoints + (event.points || 0)
    
    await updateUserActivity(uid, {
      ...currentActivity,
      timeline: updatedTimeline,
      totalPoints: updatedPoints
    })
    
    return true
  } catch (error) {
    console.error('Error adding timeline event:', error)
    return false
  }
}

export async function uploadProfileImage(uid: string, file: File): Promise<string | null> {
  try {
    const storageRef = ref(storage, `profile-images/${uid}/${file.name}`)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    // Update user profile with new image URL
    await updateUserProfile(uid, { profileImage: downloadURL })
    
    toast.success('Profile image uploaded successfully!')
    return downloadURL
  } catch (error) {
    console.error('Error uploading profile image:', error)
    toast.error('Error uploading profile image')
    return null
  }
}

export async function generateQRCode(uid: string): Promise<string> {
  try {
    const dashboardUrl = `${window.location.origin}/student-dashboard/${uid}`
    // QR code generation is handled in the component using the qrcode library
    return dashboardUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    return ''
  }
}

export async function exportUserData(uid: string): Promise<Blob | null> {
  try {
    const [profile, activity, contributions] = await Promise.all([
      getUserProfile(uid),
      getUserActivity(uid),
      getUserContributions(uid)
    ])
    
    const userData = {
      profile,
      activity,
      contributions,
      exportDate: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(userData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    
    return blob
  } catch (error) {
    console.error('Error exporting user data:', error)
    return null
  }
}

export async function updatePrivacySettings(uid: string, isPrivate: boolean): Promise<boolean> {
  try {
    await updateUserProfile(uid, { isPrivate })
    toast.success(`Profile visibility updated to ${isPrivate ? 'private' : 'public'}`)
    return true
  } catch (error) {
    console.error('Error updating privacy settings:', error)
    return false
  }
}

export async function searchUsers(searchTerm: string, limitCount: number = 10): Promise<UserProfile[]> {
  try {
    // Note: This is a simplified search. In production, you'd use Algolia or similar
    const usersRef = collection(db, 'userProfiles')
    const querySnapshot = await getDocs(usersRef)
    
    const users: UserProfile[] = []
    querySnapshot.forEach((doc) => {
      const userData = { uid: doc.id, ...doc.data() } as UserProfile
      if (
        !userData.isPrivate &&
        (userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         userData.email.toLowerCase().includes(searchTerm.toLowerCase()))
      ) {
        users.push(userData)
      }
    })
    
    return users.slice(0, limitCount)
  } catch (error) {
    console.error('Error searching users:', error)
    return []
  }
}

export async function getPublicProfiles(limitCount: number = 20): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'userProfiles')
    const q = query(
      usersRef,
      where('isPrivate', '==', false),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    
    const users: UserProfile[] = []
    querySnapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() } as UserProfile)
    })
    
    return users
  } catch (error) {
    console.error('Error fetching public profiles:', error)
    return []
  }
}

// Achievement calculation functions
export function calculateUserLevel(totalPoints: number): { level: number; nextLevelPoints: number; progress: number } {
  const pointsPerLevel = 500
  const level = Math.floor(totalPoints / pointsPerLevel) + 1
  const nextLevelPoints = level * pointsPerLevel
  const progress = ((totalPoints % pointsPerLevel) / pointsPerLevel) * 100
  
  return { level, nextLevelPoints, progress }
}

export function getUserBadges(profile: UserProfile, activity: UserActivity): string[] {
  const badges = []
  
  if (activity.totalPoints > 2000) badges.push('High Achiever')
  if (activity.certificates > 5) badges.push('Certified Expert')
  if (profile.skills.length > 4) badges.push('Multi-Skilled')
  if (!profile.isPrivate) badges.push('Open Learner')
  if (profile.bio && profile.bio.length > 100) badges.push('Storyteller')
  if (profile.mission) badges.push('Goal Oriented')
  
  return badges
}

export function getSkillLevel(skill: string, activity: UserActivity): 'Beginner' | 'Intermediate' | 'Advanced' {
  const relatedCertificates = activity.timeline.filter(
    event => event.type === 'certificate' && 
    event.title.toLowerCase().includes(skill.toLowerCase())
  ).length
  
  if (relatedCertificates >= 3) return 'Advanced'
  if (relatedCertificates >= 1) return 'Intermediate'
  return 'Beginner'
}

// Demo data initialization
export async function initializeAboutMeDemoData(uid: string): Promise<void> {
  try {
    // Check if data already exists
    const profileDoc = await getDoc(doc(db, 'userProfiles', uid))
    
    if (!profileDoc.exists()) {
      console.log('Initializing About Me demo data...')
      
      // Initialize profile
      await updateUserProfile(uid, MOCK_USER_PROFILE)
      
      // Initialize activity
      await updateUserActivity(uid, MOCK_USER_ACTIVITY)
      
      // Initialize contributions
      for (const contribution of MOCK_USER_CONTRIBUTIONS) {
        await addUserContribution(uid, contribution)
      }
      
      console.log('About Me demo data initialized successfully')
    }
  } catch (error) {
    console.error('Error initializing About Me demo data:', error)
  }
} 