// models/Class.ts - Class schema for managing schedules and enrollments

import mongoose, { Schema, Document } from 'mongoose'

export interface IClass extends Document {
  name: string
  description: string
  subject: string
  grade: string
  teacher: mongoose.Types.ObjectId
  students: mongoose.Types.ObjectId[]
  schedule: {
    day: string
    startTime: string
    endTime: string
    room: string
  }
  maxStudents: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ClassSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
    maxlength: [100, 'Class name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Class description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    trim: true
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  schedule: {
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
    },
    room: {
      type: String,
      required: [true, 'Room is required'],
      trim: true
    }
  },
  maxStudents: {
    type: Number,
    required: [true, 'Maximum students is required'],
    min: [1, 'Maximum students must be at least 1'],
    max: [100, 'Maximum students cannot exceed 100']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Indexes for faster queries
ClassSchema.index({ subject: 1 })
ClassSchema.index({ grade: 1 })
ClassSchema.index({ teacher: 1 })
ClassSchema.index({ isActive: 1 })

// Virtual for available spots
ClassSchema.virtual('availableSpots').get(function() {
  return this.maxStudents - this.students.length
})

// Virtual for enrollment status
ClassSchema.virtual('isFull').get(function() {
  return this.students.length >= this.maxStudents
})

// Method to enroll a student
ClassSchema.methods.enrollStudent = function(studentId: mongoose.Types.ObjectId) {
  if (this.students.includes(studentId)) {
    throw new Error('Student is already enrolled in this class')
  }
  if (this.isFull) {
    throw new Error('Class is full')
  }
  this.students.push(studentId)
  return this.save()
}

// Method to unenroll a student
ClassSchema.methods.unenrollStudent = function(studentId: mongoose.Types.ObjectId) {
  const index = this.students.indexOf(studentId)
  if (index === -1) {
    throw new Error('Student is not enrolled in this class')
  }
  this.students.splice(index, 1)
  return this.save()
}

// Static method to find classes by grade
ClassSchema.statics.findByGrade = function(grade: string) {
  return this.find({ grade, isActive: true }).populate('teacher', 'name')
}

// Static method to find classes by teacher
ClassSchema.statics.findByTeacher = function(teacherId: mongoose.Types.ObjectId) {
  return this.find({ teacher: teacherId, isActive: true }).populate('students', 'name email')
}

export default mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema) 