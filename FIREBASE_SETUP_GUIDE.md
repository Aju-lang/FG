# Firebase Setup & Migration Guide

## 🚀 Step 1: Enable Firestore in Firebase Console

### 1. Go to Firebase Console
- Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
- Select your project: `fg-school-f28b2`

### 2. Enable Firestore Database
- In the left sidebar, click on **"Firestore Database"**
- Click **"Create database"**
- Choose **"Start in test mode"** (for development)
- Select a location (choose the closest to your users)
- Click **"Done"**

### 3. Set up Security Rules (Optional)
- Go to **"Rules"** tab in Firestore
- Update rules to allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For development only
    }
  }
}
```

**⚠️ Note:** The above rules allow full access. For production, you'll want more restrictive rules.

## 🧪 Step 2: Test Your Setup

### 1. Run the Test Page
- Start your development server: `npm run dev`
- Visit: `http://localhost:3000/firebase-test`
- Click **"Test Firestore Connection"**
- If successful, you'll see: ✅ Firestore connection successful!

### 2. Initialize Sample Data
- Click **"Initialize Sample Data"**
- This will create sample users, classes, and certificates
- Click **"Get Collection Stats"** to see the data

## 🔧 Step 3: Update Frontend Components

### 1. Replace API Calls with Firebase Services

Your existing components that used API routes need to be updated to use the Firebase services. Here are the key changes:

#### Before (API Routes):
```typescript
// Old way - API calls
const response = await fetch('/api/users')
const users = await response.json()
```

#### After (Firebase Services):
```typescript
// New way - Firebase services
import { userService } from '@/lib/firebase-services'

const users = await userService.getAllUsers()
```

### 2. Update Authentication

Replace NextAuth with Firebase Authentication:

```typescript
// lib/auth.ts - Update to use Firebase Auth
import { auth } from './firebase'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

export const firebaseAuth = {
  signIn: async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password)
  },
  
  signUp: async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password)
  },
  
  signOut: async () => {
    return await signOut(auth)
  },
  
  onAuthStateChange: (callback: (user: any) => void) => {
    return onAuthStateChanged(auth, callback)
  }
}
```

### 3. Update Components

Here are examples of how to update your components:

#### User Management Component:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { userService } from '@/lib/firebase-services'
import type { User } from '@/lib/firebase-services'

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const allUsers = await userService.getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData: any) => {
    try {
      await userService.createUser(userData)
      await loadUsers() // Refresh the list
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  if (loading) return <div>Loading users...</div>

  return (
    <div>
      <h2>Users ({users.length})</h2>
      <div className="grid gap-4">
        {users.map(user => (
          <div key={user.id} className="p-4 border rounded">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <p>Role: {user.role}</p>
            <p>Points: {user.points}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### Class Management Component:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { classService } from '@/lib/firebase-services'
import type { Class } from '@/lib/firebase-services'

export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      const allClasses = await classService.getAllClasses()
      setClasses(allClasses)
    } catch (error) {
      console.error('Error loading classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const enrollStudent = async (classId: string, studentId: string) => {
    try {
      await classService.enrollStudent(classId, studentId)
      await loadClasses() // Refresh the list
    } catch (error) {
      console.error('Error enrolling student:', error)
    }
  }

  if (loading) return <div>Loading classes...</div>

  return (
    <div>
      <h2>Classes ({classes.length})</h2>
      <div className="grid gap-4">
        {classes.map(classItem => (
          <div key={classItem.id} className="p-4 border rounded">
            <h3>{classItem.name}</h3>
            <p>{classItem.description}</p>
            <p>Subject: {classItem.subject}</p>
            <p>Grade: {classItem.grade}</p>
            <p>Students: {classItem.students.length}/{classItem.maxStudents}</p>
            <p>Status: {classItem.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### Leaderboard Component:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { userService } from '@/lib/firebase-services'
import type { User } from '@/lib/firebase-services'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const topUsers = await userService.getLeaderboard(10)
      setLeaderboard(topUsers)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading leaderboard...</div>

  return (
    <div>
      <h2>Leaderboard</h2>
      <div className="space-y-2">
        {leaderboard.map((user, index) => (
          <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg">#{index + 1}</span>
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.grade}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl">{user.points}</p>
              <p className="text-sm text-gray-600">points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 🔒 Step 4: Security Rules (Production)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins can read all users
    match /users/{document=**} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Classes
    match /classes/{classId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Certificates
    match /certificates/{certId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 📊 Step 5: Monitoring & Analytics

### 1. Enable Firebase Analytics
Your Firebase config already includes analytics. Monitor usage in the Firebase Console.

### 2. Set up Error Monitoring
Consider adding Firebase Crashlytics for error monitoring.

## 🚀 Step 6: Deployment

### 1. Build and Deploy
```bash
npm run build
npm run export
firebase deploy
```

### 2. Verify Deployment
- Check your Firebase Hosting URL
- Test all functionality
- Monitor Firestore usage in the console

## 🔧 Troubleshooting

### Common Issues:

1. **"Firestore connection failed"**
   - Check if Firestore is enabled in Firebase Console
   - Verify your Firebase config in `lib/firebase.ts`
   - Check browser console for detailed errors

2. **"Permission denied"**
   - Update Firestore security rules
   - Check if you're in test mode

3. **"Collection not found"**
   - Initialize sample data using the test page
   - Check if collections exist in Firebase Console

4. **Build errors**
   - Ensure all imports are correct
   - Check TypeScript types
   - Verify all dependencies are installed

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

## ✅ Checklist

- [ ] Enable Firestore in Firebase Console
- [ ] Test connection using `/firebase-test` page
- [ ] Initialize sample data
- [ ] Update authentication to use Firebase Auth
- [ ] Update components to use Firebase services
- [ ] Test all functionality
- [ ] Deploy to Firebase Hosting
- [ ] Set up production security rules
- [ ] Monitor usage and errors

Your Firebase setup is now complete! 🎉 