// lib/mongodb.ts - MongoDB connection with Mongoose and connection caching

import mongoose from 'mongoose'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Define the structure of our cached connection
interface CachedConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Extend the global type to include our mongoose cache
declare global {
  var mongoose: CachedConnection | undefined
}

// ============================================================================
// CONNECTION CONFIGURATION
// ============================================================================

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

// ============================================================================
// CONNECTION CACHING
// ============================================================================

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached: CachedConnection = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

// ============================================================================
// CONNECTION FUNCTION
// ============================================================================

/**
 * Connect to MongoDB using Mongoose with connection caching
 * @returns Promise<typeof mongoose> - The active Mongoose connection
 */
export async function connect(): Promise<typeof mongoose> {
  // If we have an active connection, return it
  if (cached.conn) {
    return cached.conn
  }

  // If we don't have a connection promise, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
    }

    // Create the connection promise
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('MongoDB connected successfully')
      return mongoose
    })
  }

  try {
    // Wait for the connection promise to resolve
    cached.conn = await cached.promise
  } catch (e) {
    // Reset the promise on error so we can retry
    cached.promise = null
    console.error('MongoDB connection error:', e)
    throw e
  }

  return cached.conn
}

// ============================================================================
// EXPORT DEFAULT FOR BACKWARD COMPATIBILITY
// ============================================================================

// Export the connect function as default for backward compatibility
export default connect 