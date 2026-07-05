import mongoose from 'mongoose'

const SectionSchema = new mongoose.Schema(
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

export default (mongoose.models.Section ||
  mongoose.model('Section', SectionSchema)) as mongoose.Model<any>
