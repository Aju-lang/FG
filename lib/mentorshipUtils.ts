import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  query, 
  getDocs, 
  orderBy, 
  limit,
  where,
  Timestamp,
  writeBatch 
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'

// Types
export type MentorshipCategory = 'career' | 'concepts' | 'skills' | 'programmes'

export interface MentorshipItem {
  id: string
  title: string
  description: string
  category: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'video' | 'document' | 'interactive' | 'external'
  thumbnail?: string
  videoUrl?: string
  documentUrl?: string
  externalUrl?: string
  tags: string[]
  points: number
  prerequisites?: string[]
  learningOutcomes: string[]
  createdAt: string
  updatedAt: string
}

export interface MentorshipProgress {
  id: string
  userId: string
  itemId: string
  category: MentorshipCategory
  status: 'not_started' | 'in_progress' | 'completed'
  startedAt?: string
  completedAt?: string
  pointsEarned: number
  certificateUrl?: string
  notes?: string
  timeSpent?: number // in minutes
  lastAccessedAt: string
}

export interface MentorshipLevel {
  level: number
  title: string
  minPoints: number
  maxPoints: number
  badge: string
  description: string
}

// Calculate mentorship level based on points
export function calculateMentorshipLevel(totalPoints: number): MentorshipLevel {
  const levels: MentorshipLevel[] = [
    { level: 1, title: "Explorer", minPoints: 0, maxPoints: 49, badge: "🌱", description: "Starting your mentorship journey" },
    { level: 2, title: "Learner", minPoints: 50, maxPoints: 149, badge: "📚", description: "Building foundational knowledge" },
    { level: 3, title: "Scholar", minPoints: 150, maxPoints: 299, badge: "🎓", description: "Deepening your understanding" },
    { level: 4, title: "Expert", minPoints: 300, maxPoints: 499, badge: "⭐", description: "Mastering advanced concepts" },
    { level: 5, title: "Mentor", minPoints: 500, maxPoints: 999, badge: "🏆", description: "Ready to guide others" },
    { level: 6, title: "Guru", minPoints: 1000, maxPoints: Infinity, badge: "👑", description: "Master of all domains" }
  ]

  return levels.find(level => totalPoints >= level.minPoints && totalPoints <= level.maxPoints) || levels[0]
}

// Get all mentorship content
export async function getMentorshipContent(): Promise<{
  career: MentorshipItem[]
  concepts: MentorshipItem[]
  skills: MentorshipItem[]
  programmes: MentorshipItem[]
}> {
  try {
    const categories: MentorshipCategory[] = ['career', 'concepts', 'skills', 'programmes']
    const result: any = { career: [], concepts: [], skills: [], programmes: [] }

    for (const category of categories) {
      const categoryRef = collection(db, 'mentorshipContent', category, 'items')
      const categoryQuery = query(categoryRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(categoryQuery)
      
      result[category] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MentorshipItem))
    }

    return result
  } catch (error) {
    console.error('Error getting mentorship content:', error)
    return { career: [], concepts: [], skills: [], programmes: [] }
  }
}

// Get user's mentorship progress
export async function getUserMentorshipProgress(userId: string): Promise<MentorshipProgress[]> {
  try {
    const progressRef = collection(db, 'users', userId, 'mentorshipProgress')
    const progressQuery = query(progressRef, orderBy('lastAccessedAt', 'desc'))
    const snapshot = await getDocs(progressQuery)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MentorshipProgress))
  } catch (error) {
    console.error('Error getting user mentorship progress:', error)
    return []
  }
}

// Update mentorship progress
export async function updateMentorshipProgress(
  userId: string,
  itemId: string,
  category: MentorshipCategory,
  action: 'start' | 'complete' | 'reset'
): Promise<boolean> {
  try {
    const progressRef = doc(db, 'users', userId, 'mentorshipProgress', itemId)
    const now = new Date().toISOString()
    
    let updateData: Partial<MentorshipProgress> = {
      lastAccessedAt: now
    }

    if (action === 'start') {
      updateData = {
        userId,
        itemId,
        category,
        status: 'in_progress',
        startedAt: now,
        pointsEarned: 0,
        lastAccessedAt: now
      }
    } else if (action === 'complete') {
      updateData = {
        status: 'completed',
        completedAt: now,
        pointsEarned: 10, // Award 10 points for completion
        lastAccessedAt: now
      }
    } else if (action === 'reset') {
      updateData = {
        status: 'not_started',
        startedAt: undefined,
        completedAt: undefined,
        pointsEarned: 0,
        lastAccessedAt: now
      }
    }

    await setDoc(progressRef, updateData, { merge: true })
    return true
  } catch (error) {
    console.error('Error updating mentorship progress:', error)
    return false
  }
}

// Upload mentorship certificate
export async function uploadMentorshipCertificate(
  userId: string,
  itemId: string,
  file: File
): Promise<boolean> {
  try {
    // Upload file to Firebase Storage
    const timestamp = Date.now()
    const fileName = `${itemId}_${timestamp}_${file.name}`
    const storageRef = ref(storage, `user_certificates/${userId}/mentorship/${fileName}`)
    
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    
    // Update progress with certificate URL
    const progressRef = doc(db, 'users', userId, 'mentorshipProgress', itemId)
    await updateDoc(progressRef, {
      certificateUrl: downloadURL,
      lastAccessedAt: new Date().toISOString()
    })
    
    return true
  } catch (error) {
    console.error('Error uploading mentorship certificate:', error)
    return false
  }
}

// Initialize demo mentorship data
export async function initializeMentorshipDemoData(): Promise<void> {
  try {
    const batch = writeBatch(db)

    // Career Guidance Content
    const careerItems: Omit<MentorshipItem, 'id'>[] = [
      {
        title: "How to Become an Aerospace Engineer",
        description: "Complete guide to pursuing a career in aerospace engineering, including required skills, education path, and industry insights.",
        category: "intermediate",
        duration: "45 min",
        difficulty: "medium",
        type: "video",
        thumbnail: "https://example.com/aerospace.jpg",
        videoUrl: "https://example.com/video/aerospace",
        documentUrl: "https://example.com/pdf/aerospace-guide.pdf",
        tags: ["engineering", "aerospace", "career"],
        points: 15,
        prerequisites: ["Basic mathematics", "Physics fundamentals"],
        learningOutcomes: [
          "Understand aerospace engineering career paths",
          "Learn about required qualifications",
          "Explore industry opportunities"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: "Data Science Career Roadmap",
        description: "Navigate the path to becoming a data scientist with this comprehensive roadmap covering skills, tools, and career progression.",
        category: "intermediate",
        duration: "60 min",
        difficulty: "medium",
        type: "interactive",
        tags: ["data science", "analytics", "career"],
        points: 20,
        prerequisites: ["Statistics basics", "Programming fundamentals"],
        learningOutcomes: [
          "Map out data science career journey",
          "Identify key skills and tools",
          "Understand industry demands"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: "Medicine & Healthcare Careers",
        description: "Explore various career paths in medicine and healthcare, from traditional medicine to emerging fields like telemedicine.",
        category: "beginner",
        duration: "30 min",
        difficulty: "easy",
        type: "document",
        documentUrl: "https://example.com/pdf/medicine-careers.pdf",
        tags: ["medicine", "healthcare", "career"],
        points: 10,
        learningOutcomes: [
          "Discover medical career options",
          "Understand educational requirements",
          "Learn about specializations"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    // Deep Academic Concepts
    const conceptItems: Omit<MentorshipItem, 'id'>[] = [
      {
        title: "Quantum Mechanics Fundamentals",
        description: "Dive deep into the fascinating world of quantum mechanics, exploring wave-particle duality, superposition, and quantum entanglement.",
        category: "advanced",
        duration: "90 min",
        difficulty: "hard",
        type: "video",
        videoUrl: "https://example.com/video/quantum",
        tags: ["physics", "quantum", "advanced"],
        points: 25,
        prerequisites: ["Advanced mathematics", "Classical physics"],
        learningOutcomes: [
          "Understand quantum mechanical principles",
          "Explore quantum phenomena",
          "Connect theory to real-world applications"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: "Machine Learning & AI Ethics",
        description: "Explore the ethical implications of artificial intelligence and machine learning in society, business, and governance.",
        category: "intermediate",
        duration: "75 min",
        difficulty: "medium",
        type: "interactive",
        tags: ["AI", "ethics", "machine learning"],
        points: 20,
        learningOutcomes: [
          "Understand AI ethical frameworks",
          "Analyze real-world AI dilemmas",
          "Develop ethical decision-making skills"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: "Black Holes & Space-Time",
        description: "Journey into the mysteries of black holes, exploring general relativity, event horizons, and the nature of space-time.",
        category: "advanced",
        duration: "60 min",
        difficulty: "hard",
        type: "video",
        videoUrl: "https://example.com/video/blackholes",
        tags: ["astrophysics", "relativity", "space"],
        points: 25,
        prerequisites: ["Physics fundamentals", "Mathematical concepts"],
        learningOutcomes: [
          "Understand black hole physics",
          "Explore general relativity",
          "Connect to observational evidence"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    // Skill Development
    const skillItems: Omit<MentorshipItem, 'id'>[] = [
      {
        title: "Python Programming Mastery",
        description: "Master Python programming from basics to advanced concepts including data structures, algorithms, and best practices.",
        category: "intermediate",
        duration: "120 min",
        difficulty: "medium",
        type: "interactive",
        tags: ["programming", "python", "coding"],
        points: 30,
        learningOutcomes: [
          "Master Python syntax and concepts",
          "Build real-world applications",
          "Understand best practices"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: "Public Speaking Excellence",
        description: "Develop confident public speaking skills with techniques for presentation, audience engagement, and overcoming anxiety.",
        category: "beginner",
        duration: "45 min",
        difficulty: "easy",
        type: "video",
        videoUrl: "https://example.com/video/public-speaking",
        tags: ["communication", "presentation", "confidence"],
        points: 15,
        learningOutcomes: [
          "Build presentation confidence",
          "Master speaking techniques",
          "Engage audiences effectively"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: "Digital Design Fundamentals",
        description: "Learn the principles of digital design, including UI/UX concepts, color theory, and design tools proficiency.",
        category: "beginner",
        duration: "90 min",
        difficulty: "medium",
        type: "interactive",
        tags: ["design", "UI/UX", "creativity"],
        points: 20,
        learningOutcomes: [
          "Understand design principles",
          "Master design tools",
          "Create compelling visuals"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    // External Programmes
    const programmeItems: Omit<MentorshipItem, 'id'>[] = [
      {
        title: "Young Innovators Programme (YIP)",
        description: "Kerala government's flagship program for young innovators. Apply to develop your innovative ideas with mentorship and funding support.",
        category: "intermediate",
        duration: "6 months",
        difficulty: "medium",
        type: "external",
        externalUrl: "https://yip.kerala.gov.in",
        tags: ["innovation", "startup", "government"],
        points: 50,
        learningOutcomes: [
          "Develop innovative solutions",
          "Get mentorship support",
          "Access funding opportunities"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: "KSUM Startup Mission",
        description: "Kerala Startup Mission provides ecosystem support for startups. Join to access incubation, funding, and networking opportunities.",
        category: "advanced",
        duration: "12 months",
        difficulty: "hard",
        type: "external",
        externalUrl: "https://startupmission.kerala.gov.in",
        tags: ["startup", "entrepreneurship", "incubation"],
        points: 75,
        learningOutcomes: [
          "Build startup ecosystem",
          "Access funding networks",
          "Scale business operations"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: "Google AI for Everyone",
        description: "Google's comprehensive AI education program. Learn machine learning, TensorFlow, and AI applications across industries.",
        category: "intermediate",
        duration: "3 months",
        difficulty: "medium",
        type: "external",
        externalUrl: "https://ai.google/education",
        tags: ["AI", "machine learning", "google"],
        points: 40,
        learningOutcomes: [
          "Master AI fundamentals",
          "Build ML models",
          "Apply AI in real projects"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: "INSPIRE Awards Program",
        description: "National program to inspire students for science and research. Participate in competitions and showcase innovative projects.",
        category: "beginner",
        duration: "4 months",
        difficulty: "easy",
        type: "external",
        externalUrl: "https://inspire-awards.gov.in",
        tags: ["science", "research", "innovation"],
        points: 30,
        learningOutcomes: [
          "Develop scientific thinking",
          "Create innovative projects",
          "Present research findings"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    // Add career items
    careerItems.forEach((item, index) => {
      const docRef = doc(db, 'mentorshipContent', 'career', 'items', `career_${index + 1}`)
      batch.set(docRef, item)
    })

    // Add concept items
    conceptItems.forEach((item, index) => {
      const docRef = doc(db, 'mentorshipContent', 'concepts', 'items', `concept_${index + 1}`)
      batch.set(docRef, item)
    })

    // Add skill items
    skillItems.forEach((item, index) => {
      const docRef = doc(db, 'mentorshipContent', 'skills', 'items', `skill_${index + 1}`)
      batch.set(docRef, item)
    })

    // Add programme items
    programmeItems.forEach((item, index) => {
      const docRef = doc(db, 'mentorshipContent', 'programmes', 'items', `programme_${index + 1}`)
      batch.set(docRef, item)
    })

    await batch.commit()
    console.log('Mentorship demo data initialized successfully')
  } catch (error) {
    console.error('Error initializing mentorship demo data:', error)
  }
} 