import { NextResponse } from 'next/server'
import { ADMIN_TOKEN_NAME } from '@/lib/adminJwt'
import { STUDENT_TOKEN_NAME } from '@/lib/studentJwt'

export async function POST(req: Request) {
  const url = new URL(req.url)
  const redirectTo = url.searchParams.get('redirect') || '/' 
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

  response.cookies.set({
    name: STUDENT_TOKEN_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })

  response.headers.set('Location', redirectTo)
  return response
}
