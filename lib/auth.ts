// lib/auth.ts - NextAuth configuration

import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from './mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Credentials provider for email/password
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await dbConnect()
          
          // Find user by email
          const user = await User.findOne({ email: credentials.email })
          
          if (!user) {
            return null
          }

          // For now, we'll skip password verification since we're using QR codes
          // In a real app, you'd verify the password here
          // const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.qrCode // Using QR code as image for now
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          role: user.role,
          id: user.id
        }
      }
      return token
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect()
          
          // Check if user exists
          const existingUser = await User.findOne({ email: user.email })
          
          if (!existingUser) {
            // Create new user from Google
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              role: 'student', // Default role
              qrCode: `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              studentId: `STU_${Date.now()}`,
              grade: '1st' // Default grade
            })
            
            user.id = newUser._id.toString()
            user.role = newUser.role
          } else {
            user.id = existingUser._id.toString()
            user.role = existingUser.role
          }
          
          return true
        } catch (error) {
          console.error('Google sign in error:', error)
          return false
        }
      }
      
      return true
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
}

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    role?: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      image?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    id?: string
  }
} 