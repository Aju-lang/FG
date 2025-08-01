# 🚀 FG School Custom Authentication Setup Guide

## 📋 Overview

This guide will help you set up a complete custom authentication system for FG School using:
- **Backend**: Express.js + JWT + Supabase
- **Frontend**: Next.js + Zustand + EmailJS
- **Features**: Username/Password login, QR Code login, Student registration, Email automation

## 🛠️ Prerequisites

1. **Node.js** (v16 or higher)
2. **Supabase Account** (free tier)
3. **EmailJS Account** (free tier)
4. **Git** (for version control)

## 📦 Installation Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp config.env.example config.env
```

### 2. Supabase Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Run Database Schema**:
   - Go to SQL Editor in Supabase Dashboard
   - Copy and paste the contents of `backend/supabase-schema.sql`
   - Execute the SQL to create tables

3. **Update Environment Variables**:
   ```bash
   # In backend/config.env
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

### 3. Frontend Setup

```bash
# Install additional dependencies
npm install @emailjs/browser
```

### 4. EmailJS Setup

1. **Create EmailJS Account**:
   - Go to [emailjs.com](https://emailjs.com)
   - Create a free account
   - Create a new service (Gmail, Outlook, etc.)

2. **Create Email Template**:
   ```html
   <h2>Welcome to FG School!</h2>
   <p>Hello {{student_name}},</p>
   <p>Your account has been created successfully.</p>
   
   <h3>Login Credentials:</h3>
   <p><strong>Username:</strong> {{username}}</p>
   <p><strong>Password:</strong> {{password}}</p>
   
   <h3>QR Code Login:</h3>
   <p>You can also login using the QR code below:</p>
   <img src="{{qr_code}}" alt="Login QR Code" style="width: 200px; height: 200px;">
   
   <p>Best regards,<br>FG School Team</p>
   ```

3. **Update Environment Variables**:
   ```bash
   # In .env.local
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your-service-id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your-template-id
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your-public-key
   ```

## 🚀 Running the Application

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### 2. Start Frontend Server

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📱 Features

### 🔐 Authentication
- **Username/Password Login**: Traditional login method
- **QR Code Login**: Quick login using generated QR codes
- **JWT Tokens**: Secure session management
- **Auto-logout**: Session expiration handling

### 👨‍🎓 Student Management
- **Bulk Registration**: Upload CSV files to register multiple students
- **Manual Registration**: Add individual students
- **Auto-generated Credentials**: Username and password generation
- **QR Code Generation**: Automatic QR code creation for each student

### 📧 Email Automation
- **Welcome Emails**: Automatic emails with login credentials
- **QR Code Attachments**: QR codes included in emails
- **EmailJS Integration**: Reliable email delivery

### 🎨 About Me Lab
- **Personal Profiles**: Students can edit their profiles
- **Skills Management**: Add/remove skills with categories
- **Mission Statements**: Personal goals and objectives
- **Achievement Tracking**: Display student achievements
- **QR Code Display**: Show login QR codes

## 🔧 API Endpoints

### Authentication
- `POST /register` - Register new student
- `POST /login` - Username/password login
- `POST /login-qr` - QR code login
- `GET /me` - Get user profile (protected)
- `PUT /me` - Update user profile (protected)

### Bulk Operations
- `POST /register-bulk` - Register multiple students from CSV

## 📊 Database Schema

### Students Table
```sql
- id (UUID, Primary Key)
- username (VARCHAR, Unique)
- password (VARCHAR, Hashed)
- email (VARCHAR, Unique)
- name (VARCHAR)
- class (VARCHAR)
- division (VARCHAR)
- parentName (VARCHAR)
- place (VARCHAR)
- qrToken (VARCHAR, Unique)
- qrCodeImage (TEXT)
- role (VARCHAR, Default: 'student')
- isActive (BOOLEAN, Default: true)
- bio (TEXT)
- mission (TEXT)
- skills (TEXT[])
- interests (TEXT[])
- academicGoals (TEXT[])
- achievements (JSONB)
- totalPoints (INTEGER)
- certificates (INTEGER)
- rewardPoints (INTEGER)
```

## 🎯 Usage Examples

### 1. Register a Student

```javascript
// Frontend
const studentData = {
  name: "Ahmed Hassan",
  email: "ahmed@example.com",
  class: "10th",
  division: "A",
  parentName: "Mohammed Hassan",
  place: "Dubai"
}

const response = await authAPI.register(studentData)
// Returns: { username, password, qrCodeImage }
```

### 2. Login with Username/Password

```javascript
// Frontend
const response = await authAPI.login("ahmedhassan101", "AhmedHassan1234")
// Returns: { token, user }
```

### 3. Login with QR Code

```javascript
// Frontend
const response = await authAPI.loginQR("qr_token_123456")
// Returns: { token, user }
```

### 4. Get User Profile

```javascript
// Frontend (requires authentication)
const response = await authAPI.getProfile()
// Returns: { user }
```

## 🔒 Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Secure session management
3. **CORS Protection**: Configured for frontend domain
4. **Input Validation**: Zod schema validation
5. **Rate Limiting**: Built-in Express rate limiting
6. **SQL Injection Protection**: Parameterized queries

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check `FRONTEND_URL` in backend config
   - Ensure frontend is running on correct port

2. **Supabase Connection Errors**:
   - Verify API keys in config.env
   - Check if Supabase project is active

3. **EmailJS Errors**:
   - Verify service ID and template ID
   - Check if EmailJS account is active

4. **JWT Token Errors**:
   - Ensure JWT_SECRET is set
   - Check token expiration settings

### Debug Mode

```bash
# Backend debug
cd backend
DEBUG=* npm run dev

# Frontend debug
NODE_ENV=development npm run dev
```

## 📈 Performance Optimization

1. **Database Indexes**: Already configured in schema
2. **Caching**: Implement Redis for session storage
3. **CDN**: Use CDN for static assets
4. **Compression**: Enable gzip compression
5. **Rate Limiting**: Implement API rate limiting

## 🔄 Deployment

### Backend Deployment (Railway/Heroku)

```bash
# Railway
railway login
railway init
railway up

# Heroku
heroku create
git push heroku main
```

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check Supabase and EmailJS logs
4. Create an issue in the repository

## 🎉 Success!

Your FG School custom authentication system is now ready! Students can:
- Register and receive login credentials via email
- Login with username/password or QR codes
- Manage their personal profiles
- View achievements and statistics

The system is scalable, secure, and ready for production use. 