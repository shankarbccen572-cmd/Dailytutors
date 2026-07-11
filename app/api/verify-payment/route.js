import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Payment from '@/models/Payment'
import Course from '@/models/Course'
import { getCurrentUser } from '@/lib/session'
import { verifyRazorpaySignature } from '@/lib/razorpay'

export async function POST(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 })
    }

    const { order_id, payment_id, signature, courseId } = await req.json()
    if (!order_id || !payment_id || !signature || !courseId || !mongoose.isValidObjectId(courseId)) {
      return NextResponse.json({ error: 'Missing or invalid payment details.' }, { status: 400 })
    }

    await dbConnect()

    const paymentRecord = await Payment.findOne({ orderId: order_id, userId: user._id }).lean()
    if (!paymentRecord) {
      return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 })
    }

    const isValid = verifyRazorpaySignature({ orderId: order_id, paymentId: payment_id, signature })
    if (!isValid) {
      await Payment.updateOne({ _id: paymentRecord._id }, { $set: { status: 'failed', paymentId: payment_id } })
      return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 })
    }

    const course = await Course.findById(courseId).lean()
    if (!course || course.status !== 'published') {
      return NextResponse.json({ error: 'The selected course is no longer available.' }, { status: 404 })
    }

    const existingEnrollment = await Enrollment.findOne({ userId: user._id, courseId }).lean()
    if (!existingEnrollment) {
      let expiresAt = null
      if (course.expirationDays !== null && course.expirationDays !== undefined) {
        expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + course.expirationDays)
      }

      await Enrollment.create({
        userId: user._id,
        courseId,
        status: 'active',
        expiresAt,
      })
    }

    await Payment.updateOne(
      { _id: paymentRecord._id },
      {
        $set: {
          status: 'captured',
          paymentId: payment_id,
          purchaseDate: new Date(),
        },
      }
    )

    return NextResponse.json({ ok: true, redirectTo: `/learn/${courseId}` })
  } catch (error) {
    console.error('Verify payment failed:', error)
    return NextResponse.json(
      { error: error?.message || 'Unable to verify payment right now.' },
      { status: 500 }
    )
  }
}
