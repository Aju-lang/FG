// app/api/auth/qr-login/route.ts - QR code login endpoint

import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { qrLoginSchema } from '@/lib/validationSchemas'

// ============================================================================
// POST /api/auth/qr-login - QR code login
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()

    // Parse request body
    const body = await request.json()

    // Validate QR code
    const { qrCode } = qrLoginSchema.parse(body)

    // Find user by QR code
    const user = await User.findOne({ qrCode }).select('-__v')

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid QR code' },
        { status: 401 }
      )
    }

    // Check if user is active (you can add more conditions here)
    if (user.role !== 'student') {
      return NextResponse.json(
        { success: false, error: 'QR code login is only available for students' },
        { status: 403 }
      )
    }

    // Return user data (in a real app, you'd create a session/token)
    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        grade: user.grade,
        points: user.points
      },
      message: 'Login successful'
    })

  } catch (error: any) {
    console.error('POST /api/auth/qr-login error:', error)

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid QR code format' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 