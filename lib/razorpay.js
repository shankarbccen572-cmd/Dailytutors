import crypto from 'crypto'
import Razorpay from 'razorpay'

let razorpayClient = null

export function getRazorpayClient() {
  if (razorpayClient) return razorpayClient

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error('Razorpay environment variables are not configured')
  }

  razorpayClient = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })

  return razorpayClient
}

export function getRazorpayPublicKey() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || ''
}

export function toRazorpayAmount(amount) {
  return Math.round(Number(amount || 0) * 100)
}

export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    throw new Error('Razorpay secret is not configured')
  }

  const payload = `${orderId}|${paymentId}`
  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(payload)
    .digest('hex')

  return generatedSignature === signature
}
