import mongoose from 'mongoose'

const QuizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    instructions: { type: String, default: '' },
    // Minutes. 0 = no time limit.
    timeLimit: { type: Number, default: 0 },
    // Percentage (0–100) needed to pass.
    passingScore: { type: Number, default: 0 },
    shuffleQuestions: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  { timestamps: true }
)

export default (mongoose.models.Quiz ||
  mongoose.model('Quiz', QuizSchema)) as mongoose.Model<any>
