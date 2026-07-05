import mongoose from 'mongoose'

// A downloadable / openable attachment for a lesson (PDF note, extra video,
// generic file, or an external link). Files are typically uploaded to
// Cloudinary, but any URL works.
const ResourceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['pdf', 'video', 'file', 'link'],
      default: 'file',
    },
    name: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  { _id: false }
)

const LessonSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    videoUrl: { type: String, default: '' },
    duration: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isFreePreview: { type: Boolean, default: false },
    // PDF notes / extra videos / files / links shown in the lesson's
    // "Resources" dropdown.
    resources: { type: [ResourceSchema], default: [] },
    // Quizzes from this course that relate to this lesson's topic.
    quizIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
      default: [],
    },
  },
  { timestamps: true }
)

export default (mongoose.models.Lesson ||
  mongoose.model('Lesson', LessonSchema)) as mongoose.Model<any>
