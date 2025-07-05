// app/api/users/route.ts - Users API endpoints

import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { createUserSchema, updateUserSchema, qrLoginSchema } from '@/lib/validationSchemas'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// ============================================================================
// GET /api/users - Get all users or search users
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()

    // Get session for authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const grade = searchParams.get('grade')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Build query
    const query: any = {}
    if (role) query.role = role
    if (grade) query.grade = grade

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query
    const users = await User.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const total = await User.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('GET /api/users error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/users - Create new user
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()

    // Get session for authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate input data
    const validatedData = createUserSchema.parse(body)

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: validatedData.email },
        { qrCode: validatedData.qrCode }
      ]
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email or QR code already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const user = await User.create(validatedData)

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('POST /api/users error:', error)

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT /api/users - Update user
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()

    // Get session for authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate input data
    const validatedData = updateUserSchema.parse(updateData)

    // Check if user exists
    const existingUser = await User.findById(id)
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check for duplicate email or QR code
    if (validatedData.email || validatedData.qrCode) {
      const duplicateQuery: any = { _id: { $ne: id } }
      if (validatedData.email) duplicateQuery.email = validatedData.email
      if (validatedData.qrCode) duplicateQuery.qrCode = validatedData.qrCode

      const duplicateUser = await User.findOne(duplicateQuery)
      if (duplicateUser) {
        return NextResponse.json(
          { success: false, error: 'Email or QR code already exists' },
          { status: 400 }
        )
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    })

  } catch (error: any) {
    console.error('PUT /api/users error:', error)

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/users - Delete user
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()

    // Get session for authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await User.findById(id)
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user
    await User.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('DELETE /api/users error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 