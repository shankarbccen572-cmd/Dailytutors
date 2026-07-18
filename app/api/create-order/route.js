import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import Enrollment from '@/models/Enrollment'
import Payment from '@/models/Payment'
import { getCurrentUser } from '@/lib/session'
import { getRazorpayClient, toRazorpayAmount } from '@/lib/razorpay'

export async function POST(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 })
    }

    const { courseId } = await req.json()
    if (!courseId || !mongoose.isValidObjectId(courseId)) {
      return NextResponse.json({ error: 'Invalid course selected.' }, { status: 400 })
    }

    await dbConnect()

    const course = await Course.findById(courseId).lean()
    if (!course || course.status !== 'published') {
      return NextResponse.json({ error: 'This course is not available for purchase.' }, { status: 404 })
    }

    const existingEnrollment = await Enrollment.findOne({ userId: user._id, courseId }).lean()
    if (existingEnrollment) {
      return NextResponse.json({ error: 'You already have access to this course.' }, { status: 409 })
    }

    // Abandoned checkouts (tab closed without cancelling) leave a stale
    // "created"/"authorized" Payment. Cancel any such rows so the user can
    // always start a fresh attempt instead of being blocked with a 409.
    await Payment.updateMany(
      { userId: user._id, courseId, status: { $in: ['created', 'authorized'] } },
      { $set: { status: 'cancelled' } }
    )

    const amountInRupees = Number(course.discountPrice > 0 ? course.discountPrice : course.originalPrice || 0)
    const amountInPaise = toRazorpayAmount(amountInRupees)

    if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json({ error: 'The minimum order amount is ₹1.00.' }, { status: 400 })
    }

    const razorpay = getRazorpayClient()
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      // Razorpay limits receipt length to 40 chars. Create a short deterministic receipt.
      receipt: `c${course._id.toString().slice(-8)}u${user._id.toString().slice(-8)}`,
      notes: {
        userId: user._id.toString(),
        courseId: course._id.toString(),
      },
    })

    await Payment.create({
      userId: user._id,
      courseId,
      orderId: order.id,
      amount: amountInRupees,
      currency: order.currency,
      status: 'created',
      purchaseDate: new Date(),
      notes: { receipt: order.receipt },
    })

    return NextResponse.json({
      ok: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Create order failed:', error)
    // Return the underlying error message to help the frontend surface useful
    // diagnostics while keeping secrets out of responses.
    return NextResponse.json(
      { error: error?.message || 'Unable to initialize payment right now.' },
      { status: 500 }
    )
  }
}
