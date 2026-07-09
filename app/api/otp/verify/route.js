import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { verifyAccessToken, toLocalIndianPhone } from '@/lib/msg91'
import { createStudentToken, STUDENT_TOKEN_NAME, STUDENT_TOKEN_MAX_AGE } from '@/lib/studentJwt'

// POST /api/otp/verify  { token: '<widget access-token>' }
//
// The MSG91 OTP Widget has already collected and verified the OTP in the
// browser and handed the client a signed access-token. We re-verify that token
// with MSG91 server-side, then find-or-create the student and issue a JWT.
export async function POST(req) {
  try {
    const text = await req.text()
    let body = {}
    if (text) {
      try {
        body = JSON.parse(text)
      } catch {
        body = {}
      }
    }

    const { token } = body
    if (!token) {
      return NextResponse.json({ ok: false, message: 'Verification token required.' }, { status: 400 })
    }

    const result = await verifyAccessToken(token)
    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 400 })
    }

    // The verified phone comes from MSG91, never from the client.
    const phone = toLocalIndianPhone(result.mobile)
    if (!phone) {
      return NextResponse.json({ ok: false, message: 'Could not determine the verified phone number.' }, { status: 400 })
    }

    await dbConnect()
    const safeEmail = `${phone}@phone.dailytutors.local`

    let user = await User.findOne({ phone })
    if (!user) {
      user = await User.create({
        phone,
        email: safeEmail,
        name: phone,
        role: 'student',
      })
    } else if (!user.email) {
      user.email = safeEmail
      await user.save()
    }

    // Create the student JWT and set it as an HttpOnly cookie.
    const tokenPayload = { userId: user._id.toString(), email: user.email, role: user.role }
    const jwt = await createStudentToken(tokenPayload, STUDENT_TOKEN_MAX_AGE)

    const res = NextResponse.json({ ok: true, redirect: '/dashboard' })
    res.cookies.set({
      name: STUDENT_TOKEN_NAME,
      value: jwt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: STUDENT_TOKEN_MAX_AGE,
    })

    return res
  } catch (err) {
    console.error('POST /api/otp/verify error', err)
    return NextResponse.json({ ok: false, message: 'Failed to verify OTP.' }, { status: 500 })
  }
}
