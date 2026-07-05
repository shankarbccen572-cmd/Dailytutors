import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    // Optional: credential (admin/faculty) accounts have no Google account.
    googleId: { type: String, unique: true, sparse: true, index: true },
    // Login ID for credential accounts (admin/faculty). Lowercase.
    username: { type: String, unique: true, sparse: true, index: true },
    // scrypt "salt:hash". Never selected by default queries.
    password: { type: String, select: false },
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    image: { type: String },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin', 'co-admin'],
      default: 'student',
    },
    // For co-admins: which sections can they access (overview, courses, enrollments, users)
    permissions: { type: [String], default: [] }, // enum: ['overview', 'courses', 'enrollments', 'users']
    // For co-admins: which admin created them
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    examTarget: { type: String, default: null },
    phone: { type: String, default: null },
    city: { type: String, default: null },
  },
  { timestamps: true }
)

// Reuse the compiled model across hot reloads to avoid OverwriteModelError.
export default (mongoose.models.User ||
  mongoose.model('User', UserSchema)) as mongoose.Model<any>
