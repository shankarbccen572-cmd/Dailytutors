import { NextResponse } from 'next/server'
import { ADMIN_TOKEN_NAME } from '@/lib/adminJwt'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: ADMIN_TOKEN_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  return response
}
