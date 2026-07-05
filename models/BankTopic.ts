import mongoose from 'mongoose'

// A topic inside a chapter — enables topic-level (not just chapter-level)
// filtering when building a paper. Optional: a question can sit directly under
// a chapter with no topic.
const BankTopicSchema = new mongoose.Schema(
  {
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
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default (mongoose.models.BankTopic ||
  mongoose.model('BankTopic', BankTopicSchema)) as mongoose.Model<any>
