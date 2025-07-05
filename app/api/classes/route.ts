// app/api/classes/route.ts - Classes API endpoints

import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Class from '@/models/Class'
import User from '@/models/User'
import { createClassSchema, updateClassSchema, enrollStudentSchema } from '@/lib/validationSchemas'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// ============================================================================
// GET /api/classes - Get all classes or filter by parameters
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
    const subject = searchParams.get('subject')
    const grade = searchParams.get('grade')
    const teacher = searchParams.get('teacher')
    const student = searchParams.get('student')
    const isActive = searchParams.get('isActive')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Build query
    const query: any = {}
    if (subject) query.subject = subject
    if (grade) query.grade = grade
    if (teacher) query.teacher = teacher
    if (isActive !== null) query.isActive = isActive === 'true'
    if (student) query.students = student

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query with population
    const classes = await Class.find(query)
      .populate('teacher', 'name email')
      .populate('students', 'name email studentId')
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const total = await Class.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: classes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('GET /api/classes error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/classes - Create new class
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
    const validatedData = createClassSchema.parse(body)

    // Check if teacher exists
    const teacher = await User.findById(validatedData.teacher)
    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Check if teacher is an admin or has appropriate role
    if (teacher.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only admins can create classes' },
        { status: 403 }
      )
    }

    // Create new class
    const newClass = await Class.create(validatedData)

    // Populate teacher data
    await newClass.populate('teacher', 'name email')

    return NextResponse.json({
      success: true,
      data: newClass,
      message: 'Class created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('POST /api/classes error:', error)

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
// PUT /api/classes - Update class
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
        { success: false, error: 'Class ID is required' },
        { status: 400 }
      )
    }

    // Validate input data
    const validatedData = updateClassSchema.parse(updateData)

    // Check if class exists
    const existingClass = await Class.findById(id)
    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      )
    }

    // Update class
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    ).populate('teacher', 'name email')

    return NextResponse.json({
      success: true,
      data: updatedClass,
      message: 'Class updated successfully'
    })

  } catch (error: any) {
    console.error('PUT /api/classes error:', error)

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
// DELETE /api/classes - Delete class
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
        { success: false, error: 'Class ID is required' },
        { status: 400 }
      )
    }

    // Check if class exists
    const existingClass = await Class.findById(id)
    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      )
    }

    // Delete class
    await Class.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Class deleted successfully'
    })

  } catch (error) {
    console.error('DELETE /api/classes error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 