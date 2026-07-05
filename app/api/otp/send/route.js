import { NextResponse } from 'next/server'
import { sendOtp } from '@/lib/msg91'

// POST /api/otp/send  { phone: "9071366466" }
// Sends an OTP via MSG91 (or dev-mode fallback). The authkey stays server-side.
export async function POST(req) {
  try {
    const { phone } = await req.json()
    if (!phone) {
      return NextResponse.json({ ok: false, message: 'Phone number required.' }, { status: 400 })
    }
    const result = await sendOtp(phone)
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  } catch (err) {
    console.error('POST /api/otp/send error', err)
    return NextResponse.json({ ok: false, message: 'Failed to send OTP.' }, { status: 500 })
  }
}
