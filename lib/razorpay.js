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

  return timingSafeEqualHex(generatedSignature, signature)
}

// Verify a Razorpay webhook payload. The signature is an HMAC-SHA256 of the
// RAW request body keyed by the webhook secret (a separate secret from the API
// key, set in the Razorpay dashboard). Must be computed over the exact bytes
// received — never over a re-serialized JSON object.
export function verifyRazorpayWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) throw new Error('Razorpay webhook secret is not configured')
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return timingSafeEqualHex(expected, signature)
}

// Constant-time hex string comparison (avoids leaking length/among-equal timing).
function timingSafeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const ab = Buffer.from(a, 'hex')
  const bb = Buffer.from(b, 'hex')
  if (ab.length !== bb.length || ab.length === 0) return false
  return crypto.timingSafeEqual(ab, bb)
}
