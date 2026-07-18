import Enrollment from '@/models/Enrollment'

// Idempotently ensure an active enrollment exists for (userId, course). Used by
// BOTH the client verify-payment call and the Razorpay webhook, so a purchase
// always grants access exactly once regardless of which path lands first (e.g.
// the browser closing before the verify handler runs). Computes expiresAt from
// the course's expirationDays (null = lifetime). Returns the enrollment.
export async function ensureEnrollment(userId, course) {
  const existing = await Enrollment.findOne({ userId, courseId: course._id }).lean()
  if (existing) return existing

  let expiresAt = null
  if (course.expirationDays !== null && course.expirationDays !== undefined) {
    expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + course.expirationDays)
  }

  try {
    return await Enrollment.create({
      userId,
      courseId: course._id,
      status: 'active',
      expiresAt,
    })
  } catch (err) {
    // Unique (userId, courseId) index — a concurrent path created it first.
    if (err?.code === 11000) {
      return Enrollment.findOne({ userId, courseId: course._id }).lean()
    }
    throw err
  }
}
