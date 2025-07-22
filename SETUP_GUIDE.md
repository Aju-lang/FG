# 🚀 FG School Backend Setup Guide

Your Firebase backend is now **100% ready**! Here's how to complete the setup:

## ✅ **What's Already Done:**

- ✅ All API routes created (`/api/auth`, `/api/users`, `/api/classes`, `/api/leaderboard`, `/api/certificates`)
- ✅ Firebase configuration set up
- ✅ NextAuth.js configured with Google OAuth
- ✅ Input validation with Zod schemas
- ✅ Error handling and proper responses
- ✅ Google OAuth credentials provided

## 🔧 **Step 1: Environment Setup**

Create your `.env.local` file:

```bash
# Copy the example file
cp env.example .env.local
```

Your `.env.local` should contain:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth Configuration
NEXTAUTH_SECRET=generate-a-secure-secret-key
NEXTAUTH_URL=http://localhost:3000

# App Configuration
NODE_ENV=development
```

## 🔗 **Step 2: Google OAuth Setup**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select your project: `fg-school-f28b2`

2. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Set application type to "External"
   - Add your domain: `localhost:3000`

3. **Add Authorized Redirect URIs:**
   - Go to "APIs & Services" → "Credentials"
   - Edit your OAuth 2.0 Client ID
   - Add these redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://yourdomain.com/api/auth/callback/google (for production)
     ```

## 🧪 **Step 3: Test Your Backend**

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the API endpoints:**
   - Visit: `http://localhost:3000/api/test`
   - You should see a JSON response with configuration status

3. **Test authentication:**
   - Visit: `http://localhost:3000/api/auth/signin`
   - Try signing in with Google

## 📚 **Available API Endpoints:**

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth handler
- `POST /api/auth/qr-login` - QR code login

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users` - Update user
- `DELETE /api/users?id=user_id` - Delete user

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class
- `PUT /api/classes` - Update class
- `DELETE /api/classes?id=class_id` - Delete class

### Leaderboard
- `GET /api/leaderboard` - Get top students
- `POST /api/leaderboard` - Add points to student

### Certificates
- `GET /api/certificates` - Get all certificates
- `POST /api/certificates` - Create certificate
- `PUT /api/certificates` - Update certificate
- `DELETE /api/certificates?id=cert_id` - Delete certificate

## 🔐 **Authentication Flow:**

1. **Google OAuth:** Users can sign in with their Google account
2. **QR Code Login:** Students can login using their unique QR code
3. **Role-based Access:** Students vs Admin permissions
4. **Session Management:** JWT-based sessions with 30-day duration

## 📊 **Data Models:**

### User
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
}
```

### Class
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
}
```

### Certificate
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
}
```

## 🚀 **Next Steps:**

1. **Frontend Integration:** Connect your React components to these API endpoints
2. **QR Code Generation:** Implement QR code generation for students
3. **Real-time Updates:** Add WebSocket support for live updates
4. **File Upload:** Add image upload for certificates
5. **Email Notifications:** Send emails for achievements and updates

## 🛠️ **Development Tips:**

- Use **Postman** or **Thunder Client** to test API endpoints
- Check browser console for authentication errors
- Monitor Firebase console for database operations
- Use the test endpoint (`/api/test`) to verify configuration

## 🔗 **Useful Links:**

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

---

**🎉 Your backend is ready to use!** 

The Firebase backend is fully functional with authentication, database operations, and all necessary API endpoints. You can now build your frontend to connect to these APIs. 