import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const hasPublic = Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID)
    const hasSecret = Boolean(process.env.RAZORPAY_KEY_SECRET)
    return NextResponse.json({ ok: true, hasPublic, hasSecret })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 })
  }
}
