// app/api/certificates/route.ts - Certificates API endpoints

import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Certificate from '@/models/Certificate'
import User from '@/models/User'
import { createCertificateSchema, updateCertificateSchema } from '@/lib/validationSchemas'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// ============================================================================
// GET /api/certificates - Get all certificates or filter by parameters
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
    const student = searchParams.get('student')
    const type = searchParams.get('type')
    const awardedBy = searchParams.get('awardedBy')
    const isActive = searchParams.get('isActive')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Build query
    const query: any = {}
    if (student) query.student = student
    if (type) query.type = type
    if (awardedBy) query.awardedBy = awardedBy
    if (isActive !== null) query.isActive = isActive === 'true'

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query with population
    const certificates = await Certificate.find(query)
      .populate('student', 'name email studentId grade')
      .populate('awardedBy', 'name email')
      .populate('class', 'name subject')
      .select('-__v')
      .sort({ issuedAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const total = await Certificate.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: certificates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('GET /api/certificates error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/certificates - Create new certificate
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
    const validatedData = createCertificateSchema.parse(body)

    // Check if student exists
    const student = await User.findById(validatedData.student)
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if awardedBy exists
    const awardedBy = await User.findById(validatedData.awardedBy)
    if (!awardedBy) {
      return NextResponse.json(
        { success: false, error: 'Awarded by user not found' },
        { status: 404 }
      )
    }

    // Check if class exists (if provided)
    if (validatedData.class) {
      const Class = (await import('@/models/Class')).default
      const classExists = await Class.findById(validatedData.class)
      if (!classExists) {
        return NextResponse.json(
          { success: false, error: 'Class not found' },
          { status: 404 }
        )
      }
    }

    // Create new certificate
    const certificate = await Certificate.create({
      ...validatedData,
      issuedAt: new Date()
    })

    // Add points to student if certificate has points
    if (validatedData.points > 0) {
      student.points += validatedData.points
      await student.save()
    }

    // Populate certificate data
    await certificate.populate('student', 'name email studentId grade')
    await certificate.populate('awardedBy', 'name email')
    if (certificate.class) {
      await certificate.populate('class', 'name subject')
    }

    return NextResponse.json({
      success: true,
      data: certificate,
      message: 'Certificate created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('POST /api/certificates error:', error)

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
// PUT /api/certificates - Update certificate
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
        { success: false, error: 'Certificate ID is required' },
        { status: 400 }
      )
    }

    // Validate input data
    const validatedData = updateCertificateSchema.parse(updateData)

    // Check if certificate exists
    const existingCertificate = await Certificate.findById(id)
    if (!existingCertificate) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      )
    }

    // Update certificate
    const updatedCertificate = await Certificate.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    ).populate('student', 'name email studentId grade')
     .populate('awardedBy', 'name email')

    return NextResponse.json({
      success: true,
      data: updatedCertificate,
      message: 'Certificate updated successfully'
    })

  } catch (error: any) {
    console.error('PUT /api/certificates error:', error)

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
// DELETE /api/certificates - Delete certificate
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
        { success: false, error: 'Certificate ID is required' },
        { status: 400 }
      )
    }

    // Check if certificate exists
    const existingCertificate = await Certificate.findById(id)
    if (!existingCertificate) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      )
    }

    // Delete certificate
    await Certificate.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Certificate deleted successfully'
    })

  } catch (error) {
    console.error('DELETE /api/certificates error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 