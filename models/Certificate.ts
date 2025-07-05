// models/Certificate.ts - Certificate schema for tracking achievements

import mongoose, { Schema, Document } from 'mongoose'

export interface ICertificate extends Document {
  name: string
  description: string
  type: 'achievement' | 'completion' | 'excellence' | 'participation'
  student: mongoose.Types.ObjectId
  awardedBy: mongoose.Types.ObjectId
  class?: mongoose.Types.ObjectId
  points: number
  imageUrl?: string
  issuedAt: Date
  expiresAt?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CertificateSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Certificate name is required'],
    trim: true,
    maxlength: [100, 'Certificate name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Certificate description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Certificate type is required'],
    enum: ['achievement', 'completion', 'excellence', 'participation'],
    default: 'achievement'
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  awardedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Awarded by is required']
  },
  class: {
    type: Schema.Types.ObjectId,
    ref: 'Class'
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [0, 'Points cannot be negative'],
    default: 0
  },
  imageUrl: {
    type: String,
    trim: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Indexes for faster queries
CertificateSchema.index({ student: 1 })
CertificateSchema.index({ type: 1 })
CertificateSchema.index({ issuedAt: -1 })
CertificateSchema.index({ isActive: 1 })

// Virtual for certificate status
CertificateSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false
  return new Date() > this.expiresAt
})

// Virtual for certificate age
CertificateSchema.virtual('ageInDays').get(function() {
  const now = new Date()
  const issued = this.issuedAt
  const diffTime = Math.abs(now.getTime() - issued.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Method to deactivate certificate
CertificateSchema.methods.deactivate = function() {
  this.isActive = false
  return this.save()
}

// Method to reactivate certificate
CertificateSchema.methods.reactivate = function() {
  this.isActive = true
  return this.save()
}

// Static method to find certificates by student
CertificateSchema.statics.findByStudent = function(studentId: mongoose.Types.ObjectId) {
  return this.find({ student: studentId, isActive: true })
    .populate('awardedBy', 'name')
    .populate('class', 'name subject')
    .sort({ issuedAt: -1 })
}

// Static method to find certificates by type
CertificateSchema.statics.findByType = function(type: string) {
  return this.find({ type, isActive: true })
    .populate('student', 'name email')
    .populate('awardedBy', 'name')
    .sort({ issuedAt: -1 })
}

// Static method to get certificate statistics
CertificateSchema.statics.getStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalPoints: { $sum: '$points' }
      }
    }
  ])
}

export default mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', CertificateSchema) 