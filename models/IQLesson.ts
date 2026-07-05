import mongoose from 'mongoose'

// A lesson inside an Important-Questions chapter. Holds a title; the questions
// themselves live in the ImportantQuestion collection (linked by lessonId).
const IQLessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IQChapter',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default (mongoose.models.IQLesson ||
  mongoose.model('IQLesson', IQLessonSchema)) as mongoose.Model<any>
