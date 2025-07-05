# FG School Backend Documentation

A comprehensive backend system for the FG School full-stack project built with Next.js 14 App Router, MongoDB, and NextAuth.js.

## 🏗️ Architecture Overview

```
├── lib/
│   ├── mongodb.ts          # Database connection
│   ├── auth.ts            # NextAuth configuration
│   └── validationSchemas.ts # Zod validation schemas
├── models/
│   ├── User.ts            # User/Student/Admin model
│   ├── Class.ts           # Class schedule model
│   └── Certificate.ts     # Achievement certificates model
├── app/api/
│   ├── auth/
│   │   ├── [...nextauth]/route.ts # NextAuth handler
│   │   └── qr-login/route.ts      # QR code login
│   ├── users/route.ts     # User CRUD operations
│   ├── classes/route.ts   # Class management
│   ├── leaderboard/route.ts # Student rankings
│   └── certificates/route.ts # Achievement tracking
└── env.example            # Environment variables template
```

## 🚀 Quick Start

### 1. Environment Setup

Copy `env.example` to `.env.local` and configure:

```bash
cp env.example .env.local
```

Required environment variables:
- `MONGO_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Your app URL
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (optional)

### 2. Database Setup

The system uses MongoDB with Mongoose ODM. Models include:

- **Users**: Students and admins with QR codes
- **Classes**: Course schedules and enrollments
- **Certificates**: Achievement tracking

### 3. Authentication

- **NextAuth.js**: Email/password and Google OAuth
- **QR Code Login**: Student-specific QR code authentication
- **Role-based Access**: Student vs Admin permissions

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
1. **Email/Password**: Traditional login
2. **Google OAuth**: Social login
3. **QR Code**: Student-specific quick login

### Session Management
- JWT-based sessions
- 30-day session duration
- Role-based access control

## 📊 Data Models

### User Model
```typescript
{
  name: string
  email: string
  role: 'student' | 'admin'
  qrCode: string
  studentId?: string
  grade?: string
  points: number
  certificates: ObjectId[]
  enrolledClasses: ObjectId[]
}
```

### Class Model
```typescript
{
  name: string
  description: string
  subject: string
  grade: string
  teacher: ObjectId
  students: ObjectId[]
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

### Certificate Model
```typescript
{
  name: string
  description: string
  type: 'achievement' | 'completion' | 'excellence' | 'participation'
  student: ObjectId
  awardedBy: ObjectId
  class?: ObjectId
  points: number
  imageUrl?: string
  issuedAt: Date
  expiresAt?: Date
  isActive: boolean
}
```

## 🛡️ Security Features

### Input Validation
- **Zod schemas** for all API endpoints
- **Type safety** with TypeScript
- **Sanitization** of user inputs

### Error Handling
- **Structured error responses**
- **Proper HTTP status codes**
- **Detailed error messages**

### Database Security
- **Connection pooling** with Mongoose
- **Indexed queries** for performance
- **Data validation** at schema level

## 🔧 Development

### Running the Backend
```bash
npm run dev
```

### Database Connection
The system uses a cached connection to prevent connection leaks in development.

### API Testing
All endpoints return structured JSON responses:
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

## 📈 Performance Features

### Database Optimization
- **Indexed fields** for fast queries
- **Connection pooling** for efficiency
- **Selective population** to reduce payload

### API Features
- **Pagination** for large datasets
- **Filtering** by multiple criteria
- **Sorting** by relevant fields

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production.

### Database
Use MongoDB Atlas or self-hosted MongoDB for production.

### Security
- Generate strong `NEXTAUTH_SECRET`
- Use HTTPS in production
- Configure CORS if needed

## 📝 API Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [...]
}
```

## 🔄 Next Steps

1. **Set up MongoDB** database
2. **Configure environment variables**
3. **Test API endpoints**
4. **Implement frontend integration**
5. **Add more features** as needed

## 📞 Support

For questions or issues:
1. Check the API documentation
2. Review error logs
3. Test with Postman/Insomnia
4. Check database connectivity

Happy coding! 🎉 