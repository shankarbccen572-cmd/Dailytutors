import mongoose from 'mongoose'

// One answer choice (single correct across the set, MCQ-style).
const OptionSchema = new mongoose.Schema(
  {
    text: { type: String, default: '' },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
)

// A single numbered statement (for statement-based questions).
const StatementSchema = new mongoose.Schema(
  { text: { type: String, default: '' } },
  { _id: false }
)

// One row in a column (for match-the-column questions). `label` is the
// auto-assigned A/B/C… or 1/2/3… tag.
const MatchItemSchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    text: { type: String, default: '' },
  },
  { _id: false }
)

// Chapter-wise "important questions" bank, kept separate from the graded
// Quiz/Question machinery. Three NEET-style types share a common single-correct
// `options` array for grading; the rest of the fields hold per-type display
// content.
const ImportantQuestionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    // The Important-Questions chapter this belongs to.
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IQChapter',
      required: true,
      index: true,
    },
    // The lesson (inside the chapter) this question sits under.
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IQLesson',
      required: true,
      index: true,
    },
    // assertion-reason | statement-based | match-column
    type: {
      type: String,
      enum: ['assertion-reason', 'statement-based', 'match-column'],
      required: true,
    },
    // Shared answer choices — exactly one is correct.
    options: { type: [OptionSchema], default: [] },
    explanation: { type: String, default: '' },
    marks: { type: Number, default: 1 },
    order: { type: Number, default: 0 },

    // assertion-reason
    assertion: { type: String, default: '' },
    reason: { type: String, default: '' },

    // statement-based
    intro: { type: String, default: '' },
    statements: { type: [StatementSchema], default: [] },

    // match-column
    columnITitle: { type: String, default: '' },
    columnIITitle: { type: String, default: '' },
    leftItems: { type: [MatchItemSchema], default: [] },
    rightItems: { type: [MatchItemSchema], default: [] },
  },
  { timestamps: true }
)

export default (mongoose.models.ImportantQuestion ||
  mongoose.model(
    'ImportantQuestion',
    ImportantQuestionSchema
  )) as mongoose.Model<any>
