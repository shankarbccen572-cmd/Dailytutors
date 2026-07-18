import mongoose from 'mongoose'

// Top level of the faculty Question-Bank taxonomy — independent of Courses.
// A subject spans one or more exams (a Physics chapter can serve both CBSE and
// JEE, for example), so exam targeting lives here as a list and is inherited /
// overridable per question.
const BankSubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Physics", "Biology"
    // Category (standard / exam) this subject belongs to. The spec's subject
    // sets differ per category (School vs NEET vs KCET), so subjects are scoped
    // to a category. Nullable for backward compatibility with pre-existing rows.
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    // Optional board + grade for school subjects (blank for pure exam subjects).
    board: { type: String, default: '' }, // e.g. "CBSE", "ICSE"
    grade: { type: String, default: '' }, // e.g. "11", "12"
    // Exams this subject's questions can be tagged against.
    exams: { type: [String], default: [] }, // e.g. ["CBSE","JEE","NEET","CUET"]
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default (mongoose.models.BankSubject ||
  mongoose.model('BankSubject', BankSubjectSchema)) as mongoose.Model<any>
