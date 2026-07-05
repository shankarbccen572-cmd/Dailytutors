import mongoose from 'mongoose'

// A chapter under a Question-Bank subject. `weightage` feeds the future
// blueprint / selection engine (chapter weightage in a balanced paper).
const BankChapterSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankSubject',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    // Relative weight (%) the selection engine gives this chapter. 0 = unset.
    weightage: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default (mongoose.models.BankChapter ||
  mongoose.model('BankChapter', BankChapterSchema)) as mongoose.Model<any>
