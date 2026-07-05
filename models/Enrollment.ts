import mongoose from 'mongoose'

const EnrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    // Lessons this student has marked complete (drives the progress %).
    completedLessons: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
      default: [],
    },
    expiresAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
)

// One enrollment per user per course.
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true })

export default (mongoose.models.Enrollment ||
  mongoose.model('Enrollment', EnrollmentSchema)) as mongoose.Model<any>
