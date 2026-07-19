import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'

// Lightweight auth-state probe for client components (navbar, CTAs). Works for
// both Google (next-auth session) and phone-OTP (auth_token cookie) logins.
export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ authenticated: false })
  return NextResponse.json({
    authenticated: true,
    name: user.name || null,
    role: user.role || 'student',
  })
}
