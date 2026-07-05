import mongoose from 'mongoose'

// One choice for option-based questions (mcq, multiple, truefalse).
const OptionSchema = new mongoose.Schema(
  {
    text: { type: String, default: '' },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
)

const QuestionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    // mcq         = one correct option (radio)
    // multiple    = one or more correct options (checkbox)
    // truefalse   = True / False
    // numeric     = student types a number / short text answer
    type: {
      type: String,
      enum: ['mcq', 'multiple', 'truefalse', 'numeric'],
      default: 'mcq',
    },
    text: { type: String, required: true },
    // Used by mcq / multiple / truefalse.
    options: { type: [OptionSchema], default: [] },
    // Used by numeric / short answer (stored as a string, compared trimmed).
    correctAnswer: { type: String, default: '' },
    explanation: { type: String, default: '' },
    marks: { type: Number, default: 1 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default (mongoose.models.Question ||
  mongoose.model('Question', QuestionSchema)) as mongoose.Model<any>
