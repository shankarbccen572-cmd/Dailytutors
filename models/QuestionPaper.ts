import mongoose from 'mongoose'

// A section of a paper (Section A / B / C…). Holds an ordered list of question
// references from the Bank plus its own instructions. Marks/duration are
// computed from the referenced questions at export time (authoritative), with a
// cached total stored for fast listing.
const PaperSectionSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Section A' },
    instructions: { type: String, default: '' },
    order: { type: Number, default: 0 },
    questionIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BankQuestion' }],
      default: [],
    },
  },
  { _id: false }
)

// An immutable snapshot pushed onto the version history each time a published
// paper is edited — so faculty can see/restore what a paper looked like before.
const PaperVersionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    note: { type: String, default: '' },
    savedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    savedAt: { type: Date, default: Date.now },
    // Full snapshot of the paper's editable fields at that version.
    snapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
)

// A generated question paper. Persisted (unlike the old ephemeral browser-only
// generator) so it can be edited, duplicated, versioned, published and
// re-downloaded as PDF/DOCX.
const QuestionPaperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    // Branding / header metadata.
    institution: { type: String, default: 'Daily Tutors' },
    logoUrl: { type: String, default: '' },
    examName: { type: String, default: '' },
    teacher: { type: String, default: '' },

    // Taxonomy context (denormalized names for display + fast filtering).
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    category: { type: String, default: '' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankSubject', default: null },
    subject: { type: String, default: '' },

    timeMinutes: { type: Number, default: 180 },
    // Cached from the referenced questions on save (recomputed on export).
    totalMarks: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },

    instructions: { type: String, default: '' },
    headerText: { type: String, default: '' },
    footerText: { type: String, default: '' },
    includeAnswerKey: { type: Boolean, default: false },

    sections: { type: [PaperSectionSchema], default: [] },

    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    version: { type: Number, default: 1 },
    history: { type: [PaperVersionSchema], default: [] },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  },
  { timestamps: true }
)

QuestionPaperSchema.index({ createdBy: 1, status: 1, updatedAt: -1 })

export default (mongoose.models.QuestionPaper ||
  mongoose.model('QuestionPaper', QuestionPaperSchema)) as mongoose.Model<any>
