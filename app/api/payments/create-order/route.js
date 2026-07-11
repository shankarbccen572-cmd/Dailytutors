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

    const existingPayment = await Payment.findOne({ userId: user._id, courseId, status: { $in: ['created', 'authorized', 'captured'] } }).lean()
    if (existingPayment) {
      return NextResponse.json({ error: 'A payment for this course is already in progress.' }, { status: 409 })
    }

    const amount = Number(course.discountPrice > 0 ? course.discountPrice : course.originalPrice || 0)
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'This course is currently free.' }, { status: 400 })
    }

    const razorpay = getRazorpayClient()
    const options = {
      amount: toRazorpayAmount(amount),
      currency: 'INR',
      // Razorpay limits receipt length to 40 chars. Use a compact receipt id.
      receipt: `c${course._id.toString().slice(-8)}u${user._id.toString().slice(-8)}`,
      notes: {
        userId: user._id.toString(),
        courseId: course._id.toString(),
      },
    }

    const order = await razorpay.orders.create(options)

    await Payment.create({
      userId: user._id,
      courseId,
      orderId: order.id,
      amount,
      currency: order.currency,
      status: 'created',
      purchaseDate: new Date(),
      notes: { receipt: options.receipt },
    })

    return NextResponse.json({
      ok: true,
      order,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      courseTitle: course.title,
      amount,
    })
  } catch (error) {
    console.error('Create Razorpay order failed:', error)
    return NextResponse.json(
      { error: error?.message || 'Unable to initialize payment right now.' },
      { status: 500 }
    )
  }
}
