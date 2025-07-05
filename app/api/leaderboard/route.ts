// app/api/leaderboard/route.ts - Leaderboard API endpoint

import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { leaderboardQuerySchema } from '@/lib/validationSchemas'

// ============================================================================
// GET /api/leaderboard - Get top students by points
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()

    const { searchParams } = new URL(request.url)
    
    // Validate query parameters
    const validatedParams = leaderboardQuerySchema.parse({
      limit: searchParams.get('limit'),
      grade: searchParams.get('grade')
    })

    const { limit, grade } = validatedParams

    // Build query for students only
    const query: any = { role: 'student' }
    if (grade) query.grade = grade

    // Get leaderboard data
    const leaderboard = await User.find(query)
      .select('name points grade studentId')
      .sort({ points: -1 })
      .limit(limit)

    // Get additional statistics
    const totalStudents = await User.countDocuments({ role: 'student' })
    const averagePoints = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: null, avgPoints: { $avg: '$points' } } }
    ])

    // Calculate rankings
    const leaderboardWithRank = leaderboard.map((student, index) => ({
      rank: index + 1,
      name: student.name,
      points: student.points,
      grade: student.grade,
      studentId: student.studentId
    }))

    // Get grade-specific statistics if grade is specified
    let gradeStats = null
    if (grade) {
      const gradeStudents = await User.countDocuments({ role: 'student', grade })
      const gradeAverage = await User.aggregate([
        { $match: { role: 'student', grade } },
        { $group: { _id: null, avgPoints: { $avg: '$points' } } }
      ])
      
      gradeStats = {
        totalStudents: gradeStudents,
        averagePoints: gradeAverage[0]?.avgPoints || 0
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: leaderboardWithRank,
        statistics: {
          totalStudents,
          averagePoints: averagePoints[0]?.avgPoints || 0,
          gradeStats
        },
        filters: {
          limit,
          grade: grade || 'all'
        }
      }
    })

  } catch (error: any) {
    console.error('GET /api/leaderboard error:', error)

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.errors },
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
// POST /api/leaderboard - Add points to student (for achievements)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()

    // Parse request body
    const body = await request.json()
    const { studentId, points, reason } = body

    if (!studentId || !points) {
      return NextResponse.json(
        { success: false, error: 'Student ID and points are required' },
        { status: 400 }
      )
    }

    // Find student
    const student = await User.findById(studentId)
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if student role
    if (student.role !== 'student') {
      return NextResponse.json(
        { success: false, error: 'Can only add points to students' },
        { status: 400 }
      )
    }

    // Add points
    const oldPoints = student.points
    student.points += points
    await student.save()

    return NextResponse.json({
      success: true,
      data: {
        studentId: student._id,
        name: student.name,
        oldPoints,
        newPoints: student.points,
        pointsAdded: points,
        reason: reason || 'Points awarded'
      },
      message: 'Points added successfully'
    })

  } catch (error) {
    console.error('POST /api/leaderboard error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 