import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Payment from '@/models/Payment'
import { getCurrentUser } from '@/lib/session'

export async function POST(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 })
    }

    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Missing order identifier.' }, { status: 400 })
    }

    await dbConnect()
    await Payment.updateOne({ orderId, userId: user._id }, { $set: { status: 'cancelled' } })

    return NextResponse.json({ ok: true, message: 'Payment cancelled.' })
  } catch (error) {
    console.error('Cancel Razorpay payment failed:', error)
    return NextResponse.json({ error: 'Unable to process cancellation.' }, { status: 500 })
  }
}
