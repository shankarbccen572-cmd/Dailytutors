import mongoose from 'mongoose'

// A chapter in the "Important Questions" area — its own hierarchy, separate
// from the curriculum Sections but belonging to the same course.
const IQChapterSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default (mongoose.models.IQChapter ||
  mongoose.model('IQChapter', IQChapterSchema)) as mongoose.Model<any>
