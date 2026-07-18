import mongoose from 'mongoose'

// One answer choice (reused across option-based types).
const OptionSchema = new mongoose.Schema(
  {
    text: { type: String, default: '' },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
)

// A numbered statement (statement-based / case-study questions).
const StatementSchema = new mongoose.Schema(
  { text: { type: String, default: '' } },
  { _id: false }
)

// One row in a match-the-column question.
const MatchItemSchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    text: { type: String, default: '' },
  },
  { _id: false }
)

// The faculty Question Bank — a standalone reservoir of tagged, categorized
// questions. NOT linked to a Course and NEVER served to students; it exists so
// faculty can filter/select questions into generated papers, worksheets and
// tests. All API access is gated to staff (admin + faculty).
const BankQuestionSchema = new mongoose.Schema(
  {
    // Category (standard / exam) — denormalized from the subject so the bank
    // browser, advanced search and paper generator can filter by standard
    // without a join. Kept in sync on create/update.
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    // Taxonomy (independent of Courses / IQChapter).
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankSubject',
      required: true,
      index: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankChapter',
      required: true,
      index: true,
    },
    // Optional: topic-level classification for finer filtering.
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankTopic',
      default: null,
      index: true,
    },
    // Which exams this question is valid for (subset of the subject's exams).
    exams: { type: [String], default: [] }, // e.g. ["CBSE","JEE"]

    // Question format. Objective types are auto-gradable; subjective types
    // carry a model answer for the solutions PDF only.
    type: {
      type: String,
      enum: [
        'mcq', // single correct
        'multiple', // one or more correct
        'truefalse',
        'fill-blank',
        'one-word',
        'numeric',
        'assertion-reason',
        'match-column',
        'case-study', // passage + sub-question stem
        'passage', // reading passage based
        'picture-based',
        'map-based',
        'subjective-short',
        'subjective-long',
      ],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
      index: true,
    },
    // Provenance drives the free vs paid tier split.
    source: {
      type: String,
      enum: [
        'ncert-textbook',
        'ncert-exemplar',
        'pyq', // previous years' paper
        'faculty-created',
        'teacher-contributed',
      ],
      default: 'faculty-created',
      index: true,
    },
    // free = NCERT textbook only; all = every source (paid "All Questions").
    accessTier: {
      type: String,
      enum: ['free', 'all'],
      default: 'all',
      index: true,
    },

    marks: { type: Number, default: 1 },
    // Estimated solve time — feeds the paper's total duration calculation.
    expectedTimeSeconds: { type: Number, default: 60 },

    // Core content.
    text: { type: String, required: true }, // question stem
    imageUrl: { type: String, default: '' }, // picture / map based
    options: { type: [OptionSchema], default: [] }, // option-based types
    correctAnswer: { type: String, default: '' }, // fill-blank / one-word / numeric
    explanation: { type: String, default: '' }, // shown in solutions PDF
    modelAnswer: { type: String, default: '' }, // ideal answer for subjective types

    // assertion-reason
    assertion: { type: String, default: '' },
    reason: { type: String, default: '' },

    // statement / passage / case-study
    intro: { type: String, default: '' }, // passage or context block
    statements: { type: [StatementSchema], default: [] },

    // match-column
    columnITitle: { type: String, default: '' },
    columnIITitle: { type: String, default: '' },
    leftItems: { type: [MatchItemSchema], default: [] },
    rightItems: { type: [MatchItemSchema], default: [] },

    // Optional language of the question (for multi-language subjects like
    // Kannada / Hindi papers). Blank = the subject's default / not applicable.
    language: { type: String, default: '' },

    // Provenance for PYQ / attribution + free-form tags for search.
    year: { type: Number, default: null }, // e.g. 2023 (PYQ)
    examName: { type: String, default: '' }, // e.g. "JEE Main 2023 Shift 1"
    tags: { type: [String], default: [] },

    // Lifecycle + authorship (faculty who owns the entry). 'archived' hides a
    // question from the default browser/generator without deleting it; it can
    // be restored.
    status: {
      type: String,
      enum: ['draft', 'review', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // How many times pulled into a generated paper (for "avoid repeats" logic).
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Compound index matching the selection engine's primary filter path.
BankQuestionSchema.index({
  subjectId: 1,
  chapterId: 1,
  topicId: 1,
  type: 1,
  difficulty: 1,
  status: 1,
})

export default (mongoose.models.BankQuestion ||
  mongoose.model('BankQuestion', BankQuestionSchema)) as mongoose.Model<any>
