import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Payment from '@/models/Payment'
import Course from '@/models/Course'
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay'
import { ensureEnrollment } from '@/lib/enrollment'

// Razorpay server-to-server webhook. This is the authoritative reconciliation
// path: even if the browser closes before /api/verify-payment runs, Razorpay
// still calls this endpoint, so a captured payment always grants enrollment.
//
// Security: no user session (Razorpay calls it). Instead we verify the
// x-razorpay-signature HMAC over the RAW body with RAZORPAY_WEBHOOK_SECRET.
// Idempotent: safe to receive the same event multiple times.
export const dynamic = 'force-dynamic'

export async function POST(req) {
  const signature = req.headers.get('x-razorpay-signature') || ''
  const rawBody = await req.text()

  try {
    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } catch (err) {
    // Misconfiguration (no webhook secret) — fail closed, do not process.
    console.error('Webhook verification error:', err?.message)
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Bad payload' }, { status: 400 })
  }

  await dbConnect()

  const type = event?.event
  const paymentEntity = event?.payload?.payment?.entity
  const orderEntity = event?.payload?.order?.entity
  const refundEntity = event?.payload?.refund?.entity
  const orderId = paymentEntity?.order_id || orderEntity?.id || refundEntity?.order_id

  try {
    if (type === 'payment.captured' || type === 'order.paid') {
      if (orderId) await reconcileCaptured(orderId, paymentEntity)
    } else if (type === 'payment.failed') {
      if (orderId) {
        await Payment.updateOne(
          { orderId, status: { $nin: ['captured', 'refunded'] } },
          { $set: { status: 'failed', paymentId: paymentEntity?.id || '' } }
        )
      }
    } else if (type === 'refund.created' || type === 'refund.processed') {
      if (orderId) await Payment.updateOne({ orderId }, { $set: { status: 'refunded' } })
    }
    // Always 200 for recognized-but-unhandled events so Razorpay stops retrying.
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    // 500 asks Razorpay to retry later (transient DB issue, etc.).
    return NextResponse.json({ error: 'Processing error' }, { status: 500 })
  }
}

async function reconcileCaptured(orderId, paymentEntity) {
  const payment = await Payment.findOne({ orderId })
  if (!payment) return // Unknown order (not created by us) — ignore.

  // Grant access idempotently.
  const course = await Course.findById(payment.courseId).lean()
  if (course) await ensureEnrollment(payment.userId, course)

  if (payment.status !== 'captured') {
    payment.status = 'captured'
    if (paymentEntity?.id) payment.paymentId = paymentEntity.id
    if (paymentEntity?.method) payment.paymentMethod = paymentEntity.method
    payment.purchaseDate = payment.purchaseDate || new Date()
    await payment.save()
  }
}
