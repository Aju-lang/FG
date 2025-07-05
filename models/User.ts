// models/User.ts - User schema for students and admins

import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  role: 'student' | 'admin'
  qrCode: string
  studentId?: string
  grade?: string
  points: number
  certificates: mongoose.Types.ObjectId[]
  enrolledClasses: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
    required: true
  },
  qrCode: {
    type: String,
    required: [true, 'QR code is required'],
    unique: true
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness
    required: function() {
      return this.role === 'student'
    }
  },
  grade: {
    type: String,
    required: function() {
      return this.role === 'student'
    }
  },
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  certificates: [{
    type: Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  enrolledClasses: [{
    type: Schema.Types.ObjectId,
    ref: 'Class'
  }]
}, {
  timestamps: true
})

// Index for faster queries
UserSchema.index({ email: 1 })
UserSchema.index({ qrCode: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ points: -1 }) // For leaderboard queries

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return this.name
})

// Method to add points
UserSchema.methods.addPoints = function(points: number) {
  this.points += points
  return this.save()
}

// Method to check if user is admin
UserSchema.methods.isAdmin = function() {
  return this.role === 'admin'
}

// Static method to find by QR code
UserSchema.statics.findByQRCode = function(qrCode: string) {
  return this.findOne({ qrCode })
}

// Static method to get leaderboard
UserSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find({ role: 'student' })
    .sort({ points: -1 })
    .limit(limit)
    .select('name points grade')
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema) 