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

    const { orderId, paymentId, signature, courseId } = await req.json()
    if (!orderId || !paymentId || !signature || !courseId || !mongoose.isValidObjectId(courseId)) {
      return NextResponse.json({ error: 'Invalid payment verification payload.' }, { status: 400 })
    }

    await dbConnect()

    const paymentRecord = await Payment.findOne({ orderId, userId: user._id }).lean()
    if (!paymentRecord) {
      return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 })
    }

    const isValidSignature = verifyRazorpaySignature({ orderId, paymentId, signature })
    if (!isValidSignature) {
      await Payment.updateOne({ _id: paymentRecord._id }, { $set: { status: 'failed', paymentId } })
      return NextResponse.json({ error: 'Payment verification failed. Please try again.' }, { status: 400 })
    }

    const existingEnrollment = await Enrollment.findOne({ userId: user._id, courseId }).lean()
    if (existingEnrollment) {
      await Payment.updateOne({ _id: paymentRecord._id }, { $set: { status: 'captured', paymentId, purchaseDate: new Date() } })
      return NextResponse.json({ ok: true, enrolled: true, redirectTo: `/learn/${courseId}` })
    }

    const course = await Course.findById(courseId).lean()
    if (!course || course.status !== 'published') {
      return NextResponse.json({ error: 'The selected course is no longer available.' }, { status: 404 })
    }

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

    await Payment.updateOne(
      { _id: paymentRecord._id },
      {
        $set: {
          status: 'captured',
          paymentId,
          purchaseDate: new Date(),
        },
      }
    )

    return NextResponse.json({ ok: true, enrolled: true, redirectTo: `/learn/${courseId}` })
  } catch (error) {
    console.error('Verify Razorpay payment failed:', error)
    return NextResponse.json(
      { error: error?.message || 'Unable to verify payment right now.' },
      { status: 500 }
    )
  }
}
