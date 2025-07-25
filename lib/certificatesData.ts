export interface CertificateCourse {
  id: string
  title: string
  provider: string
  providerLogo?: string
  description: string
  duration: string
  durationWeeks: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  skills: string[]
  category: string
  points: number
  enrollLink: string
  imageUrl: string
  trending: boolean
  editorsPick: boolean
  rating: number
  studentsEnrolled: number
  language: string
  certificate: boolean
  free: boolean
}

export interface UserCertificate {
  id: string
  courseId?: string
  title: string
  provider: string
  dateCompleted: string
  pointsEarned: number
  certificateUrl?: string
  uploadedFile?: string
  verified: boolean
  type: 'course' | 'uploaded'
  grade?: string
  skills: string[]
}

export interface CertificationLevel {
  name: string
  minCertificates: number
  maxCertificates: number
  badge: string
  color: string
  points: number
}

export const certificationLevels: CertificationLevel[] = [
  {
    name: 'Bronze Learner',
    minCertificates: 1,
    maxCertificates: 3,
    badge: '🥉',
    color: 'bg-amber-600',
    points: 50
  },
  {
    name: 'Silver Learner',
    minCertificates: 4,
    maxCertificates: 6,
    badge: '🥈',
    color: 'bg-gray-400',
    points: 150
  },
  {
    name: 'Gold Learner',
    minCertificates: 7,
    maxCertificates: 10,
    badge: '🥇',
    color: 'bg-yellow-500',
    points: 300
  },
  {
    name: 'Platinum Expert',
    minCertificates: 11,
    maxCertificates: 999,
    badge: '💎',
    color: 'bg-purple-600',
    points: 500
  }
]

export const providers = [
  'Google',
  'IBM',
  'IIT Bombay',
  'Harvard',
  'Coursera',
  'edX',
  'Udemy',
  'Microsoft',
  'Amazon',
  'Meta',
  'Stanford',
  'MIT'
]

export const skillCategories = [
  'Programming',
  'Data Science',
  'AI & Machine Learning',
  'Web Development',
  'Mobile Development',
  'Cloud Computing',
  'Cybersecurity',
  'Digital Marketing',
  'Business',
  'Design',
  'Communication',
  'Project Management'
]

export const certificateCourses: CertificateCourse[] = [
  {
    id: 'cs50',
    title: 'Harvard CS50: Introduction to Computer Science',
    provider: 'Harvard',
    description: 'An introduction to the intellectual enterprises of computer science and the art of programming.',
    duration: '12 weeks',
    durationWeeks: 12,
    difficulty: 'Beginner',
    skills: ['Programming', 'C', 'Python', 'SQL', 'Web Development'],
    category: 'Programming',
    points: 50,
    enrollLink: 'https://cs50.harvard.edu/x/',
    imageUrl: '/api/placeholder/300/200',
    trending: true,
    editorsPick: true,
    rating: 4.8,
    studentsEnrolled: 50000,
    language: 'English',
    certificate: true,
    free: true
  },
  {
    id: 'google-ai',
    title: 'Google AI for Everyone',
    provider: 'Google',
    description: 'Learn the fundamentals of artificial intelligence and machine learning.',
    duration: '4 weeks',
    durationWeeks: 4,
    difficulty: 'Beginner',
    skills: ['AI', 'Machine Learning', 'Neural Networks'],
    category: 'AI & Machine Learning',
    points: 30,
    enrollLink: 'https://www.coursera.org/learn/ai-for-everyone',
    imageUrl: '/api/placeholder/300/200',
    trending: true,
    editorsPick: false,
    rating: 4.6,
    studentsEnrolled: 75000,
    language: 'English',
    certificate: true,
    free: true
  },
  {
    id: 'ibm-data-science',
    title: 'IBM Data Science Professional Certificate',
    provider: 'IBM',
    description: 'Master data science skills with Python, SQL, and machine learning.',
    duration: '8 weeks',
    durationWeeks: 8,
    difficulty: 'Intermediate',
    skills: ['Python', 'Data Science', 'SQL', 'Machine Learning', 'Pandas'],
    category: 'Data Science',
    points: 40,
    enrollLink: 'https://www.coursera.org/professional-certificates/ibm-data-science',
    imageUrl: '/api/placeholder/300/200',
    trending: false,
    editorsPick: true,
    rating: 4.7,
    studentsEnrolled: 60000,
    language: 'English',
    certificate: true,
    free: false
  },
  {
    id: 'meta-frontend',
    title: 'Meta Front-End Developer',
    provider: 'Meta',
    description: 'Learn to build responsive websites and user interfaces.',
    duration: '6 weeks',
    durationWeeks: 6,
    difficulty: 'Intermediate',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'UI/UX'],
    category: 'Web Development',
    points: 35,
    enrollLink: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
    imageUrl: '/api/placeholder/300/200',
    trending: true,
    editorsPick: false,
    rating: 4.5,
    studentsEnrolled: 45000,
    language: 'English',
    certificate: true,
    free: false
  },
  {
    id: 'aws-cloud',
    title: 'AWS Cloud Practitioner Essentials',
    provider: 'Amazon',
    description: 'Fundamental understanding of AWS cloud computing concepts.',
    duration: '3 weeks',
    durationWeeks: 3,
    difficulty: 'Beginner',
    skills: ['AWS', 'Cloud Computing', 'DevOps'],
    category: 'Cloud Computing',
    points: 25,
    enrollLink: 'https://aws.amazon.com/training/course-descriptions/cloud-practitioner-essentials/',
    imageUrl: '/api/placeholder/300/200',
    trending: false,
    editorsPick: true,
    rating: 4.4,
    studentsEnrolled: 30000,
    language: 'English',
    certificate: true,
    free: true
  },
  {
    id: 'microsoft-azure',
    title: 'Microsoft Azure Fundamentals',
    provider: 'Microsoft',
    description: 'Introduction to cloud services and Microsoft Azure.',
    duration: '4 weeks',
    durationWeeks: 4,
    difficulty: 'Beginner',
    skills: ['Azure', 'Cloud Computing', 'Microsoft'],
    category: 'Cloud Computing',
    points: 30,
    enrollLink: 'https://learn.microsoft.com/en-us/certifications/azure-fundamentals/',
    imageUrl: '/api/placeholder/300/200',
    trending: true,
    editorsPick: false,
    rating: 4.3,
    studentsEnrolled: 35000,
    language: 'English',
    certificate: true,
    free: true
  },
  {
    id: 'stanford-ml',
    title: 'Stanford Machine Learning Course',
    provider: 'Stanford',
    description: 'Comprehensive introduction to machine learning algorithms.',
    duration: '10 weeks',
    durationWeeks: 10,
    difficulty: 'Advanced',
    skills: ['Machine Learning', 'Python', 'Mathematics', 'Algorithms'],
    category: 'AI & Machine Learning',
    points: 45,
    enrollLink: 'https://www.coursera.org/learn/machine-learning',
    imageUrl: '/api/placeholder/300/200',
    trending: false,
    editorsPick: true,
    rating: 4.9,
    studentsEnrolled: 85000,
    language: 'English',
    certificate: true,
    free: true
  },
  {
    id: 'google-ux',
    title: 'Google UX Design Professional Certificate',
    provider: 'Google',
    description: 'Learn user experience design fundamentals and tools.',
    duration: '5 weeks',
    durationWeeks: 5,
    difficulty: 'Beginner',
    skills: ['UX Design', 'Figma', 'Prototyping', 'User Research'],
    category: 'Design',
    points: 35,
    enrollLink: 'https://www.coursera.org/professional-certificates/google-ux-design',
    imageUrl: '/api/placeholder/300/200',
    trending: true,
    editorsPick: true,
    rating: 4.6,
    studentsEnrolled: 40000,
    language: 'English',
    certificate: true,
    free: false
  }
] 