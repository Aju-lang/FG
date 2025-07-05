// app/api/test-mongodb/route.ts - Test MongoDB connection

import { NextResponse } from 'next/server'
import connect from '@/lib/mongodb'

export async function GET() {
  try {
    // Connect to database using our Mongoose connection
    const connection = await connect()
    
    // Get the database instance from Mongoose connection
    const db = connection.connection.db

    if (!db) {
      return NextResponse.json({ 
        success: false,
        error: 'Database connection not available' 
      }, { status: 500 })
    }

    // Test the connection by pinging the admin database
    const adminInfo = await db.admin().ping()

    if (adminInfo.ok === 1) {
      return NextResponse.json({ 
        success: true,
        message: 'MongoDB connection successful!',
        database: db.databaseName,
        collections: await db.listCollections().toArray()
      })
    } else {
      return NextResponse.json({ 
        success: false,
        message: 'MongoDB connection failed.' 
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('MongoDB test error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
  }
} 