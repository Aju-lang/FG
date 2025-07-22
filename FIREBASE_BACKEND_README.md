# FG School Firebase Backend

A comprehensive backend system for the FG School full-stack project built with Next.js 15, Firebase Firestore, and NextAuth.js.

## 🏗️ Architecture Overview

```
├── lib/
│   ├── firebase.ts              # Firebase configuration
│   ├── firebase-services.ts     # Firebase service functions
│   ├── auth.ts                  # NextAuth configuration
│   └── validationSchemas.ts     # Zod validation schemas
├── app/api/
│   ├── auth/
│   │   ├── [...nextauth]/route.ts # NextAuth handler
│   │   └── qr-login/route.ts      # QR code login
│   ├── users/route.ts          # User CRUD operations
│   ├── classes/route.ts        # Class management
│   ├── leaderboard/route.ts    # Student rankings
│   └── certificates/route.ts   # Achievement tracking
└── env.example                 # Environment variables template
```

## 🚀 Quick Start

### 1. Environment Setup

Copy `env.example` to `.env.local` and configure:

```bash
cp env.example .env.local
```

**Required environment variables:**
- `NEXTAUTH_SECRET` - NextAuth secret key (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for development)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth credentials

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret to your `.env.local`

### 3. Firebase Setup

The Firebase configuration is already set up in `lib/firebase.ts` with your project credentials.

## 📚 API Endpoints

### Authentication

#### `POST /api/auth/qr-login`
QR code login for students
```json
{
  "qrCode": "QR_123456789"
}
```

### Users

#### `GET /api/users`
Get all users with filtering
```
Query params: role, grade, limit, page
```

#### `POST /api/users`
Create new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "qrCode": "QR_123456789",
  "studentId": "STU001",
  "grade": "5th"
}
```

#### `PUT /api/users`
Update user
```json
{
  "id": "user_id",
  "name": "Updated Name",
  "points": 100
}
```

#### `DELETE /api/users?id=user_id`
Delete user

### Classes

#### `GET /api/classes`
Get classes with filtering
```
Query params: subject, grade, teacher, student, isActive, limit, page
```

#### `POST /api/classes`
Create new class
```json
{
  "name": "Advanced Mathematics",
  "description": "Advanced math concepts",
  "subject": "Mathematics",
  "grade": "10th",
  "teacher": "teacher_id",
  "schedule": {
    "day": "Monday",
    "startTime": "09:00",
    "endTime": "10:30",
    "room": "Room 101"
  },
  "maxStudents": 25
}
```

### Leaderboard

#### `GET /api/leaderboard`
Get top students by points
```
Query params: limit, grade
```

#### `POST /api/leaderboard`
Add points to student
```json
{
  "studentId": "student_id",
  "points": 50,
  "reason": "Perfect attendance"
}
```

### Certificates

#### `GET /api/certificates`
Get certificates with filtering
```
Query params: student, type, awardedBy, isActive, limit, page
```

#### `POST /api/certificates`
Create new certificate
```json
{
  "name": "Perfect Attendance",
  "description": "Awarded for perfect attendance",
  "type": "achievement",
  "student": "student_id",
  "awardedBy": "admin_id",
  "class": "class_id",
  "points": 25
}
```

## 🔐 Authentication & Authorization

### User Roles
- **Student**: Can view classes, certificates, leaderboard
- **Admin**: Full CRUD access to all resources

### Authentication Methods
1. **Google OAuth**: Social login (recommended)
2. **Email/Password**: Traditional login
3. **QR Code**: Student-specific quick login

### Session Management
- JWT-based sessions
- 30-day session duration
- Role-based access control

## 📊 Data Models

### User Model
```typescript
{
  id: string
  name: string
  email: string
  role: 'student' | 'admin'
  qrCode: string
  studentId?: string
  grade?: string
  points: number
  certificates: string[]
  enrolledClasses: string[]
  createdAt: Date
  updatedAt: Date
}
```

### Class Model
```typescript
{
  id: string
  name: string
  description: string
  subject: string
  grade: string
  teacher: string
  students: string[]
  schedule: {
    day: string
    startTime: string
    endTime: string
    room: string
  }
  maxStudents: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Certificate Model
```typescript
{
  id: string
  name: string
  description: string
  type: 'achievement' | 'completion' | 'excellence' | 'participation'
  student: string
  awardedBy: string
  class?: string
  points: number
  imageUrl?: string
  issuedAt: Date
  expiresAt?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

## 🛠️ Development

### Running the Backend

```bash
npm run dev
```

The backend will be available at `http://localhost:3000`

### Testing API Endpoints

You can test the API endpoints using tools like:
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client) (VS Code extension)

### Example API Calls

```bash
# Get all users
curl http://localhost:3000/api/users

# Create a new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "qrCode": "QR_123456789",
    "studentId": "STU001",
    "grade": "5th"
  }'

# Get leaderboard
curl http://localhost:3000/api/leaderboard?limit=10&grade=5th
```

## 🔧 Configuration

### Firebase Rules

Make sure your Firestore security rules allow read/write access for authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### NextAuth Configuration

The NextAuth configuration is in `lib/auth.ts` and includes:
- Google OAuth provider
- Credentials provider (for email/password)
- JWT session strategy
- Role-based callbacks

## 🚀 Deployment

### Environment Variables for Production

Update your `.env.local` with production values:

```bash
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret-key
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
```

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📝 Notes

- All data is stored in Firebase Firestore
- Authentication is handled by NextAuth.js
- Input validation uses Zod schemas
- Error handling is comprehensive
- API responses are consistent and well-structured

## 🔗 Useful Links

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Zod Validation](https://zod.dev/) 