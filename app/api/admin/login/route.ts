import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { verifyPassword } from '@/lib/password'
import { createAdminToken, ADMIN_TOKEN_NAME, ADMIN_TOKEN_MAX_AGE } from '@/lib/adminJwt'

export async function POST(req: Request) {
  const body = await req.json()
  const { loginId, password } = body || {}

  if (!loginId || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
  }

  await dbConnect()
  const user = await User.findOne({
    $or: [{ username: loginId.trim().toLowerCase() }, { email: loginId.trim().toLowerCase() }],
  }).select('+password role permissions name email')

  if (!user || !user.password) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  if (!verifyPassword(password, user.password)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  if (!['admin', 'faculty', 'co-admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const token = await createAdminToken({
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions || [],
  })

  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: ADMIN_TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_TOKEN_MAX_AGE,
  })

  return response
}
