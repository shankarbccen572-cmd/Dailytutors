import mongoose from 'mongoose'

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    orderId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String, default: '' },
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'cancelled', 'refunded'],
      default: 'created',
    },
    paymentMethod: { type: String, default: '' },
    purchaseDate: { type: Date, default: Date.now },
    notes: { type: Object, default: {} },
  },
  { timestamps: true }
)

export default (mongoose.models.Payment || mongoose.model('Payment', PaymentSchema)) as mongoose.Model<any>
