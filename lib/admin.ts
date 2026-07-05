import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyAdminToken, ADMIN_TOKEN_NAME } from '@/lib/adminJwt'

const AUTH_DISABLED = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

// Roles allowed into the admin panel (course + quiz content management).
const STAFF_ROLES = ['admin', 'faculty']

// Normalizes an admin JWT payload into a session-like object.
function buildAdminSession(payload: any) {
  if (!payload || !STAFF_ROLES.includes(payload.role)) return null
  return {
    user: {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions || [],
    },
  }
}

// Returns the session if the user is staff (admin or faculty), otherwise null.
// While auth is on hold for development, returns a mock admin session.
export async function getAdminSession() {
  if (AUTH_DISABLED) {
    return {
      user: { id: 'dev', name: 'Developer', email: 'dev@local', role: 'admin', permissions: [] },
    }
  }

  const cookieStore = cookies()
  const token = cookieStore.get(ADMIN_TOKEN_NAME)?.value
  if (token) {
    const verification = await verifyAdminToken(token)
    if (verification.valid) {
      const adminSession = buildAdminSession(verification.payload)
      if (adminSession) return adminSession
    }
  }

  const session: any = await getServerSession(authOptions)
  if (!session || !STAFF_ROLES.includes(session.user?.role)) return null
  return session
}

// Stricter check for admin-only sections (user & enrollment management).
// Faculty are staff but cannot manage users.
export async function getSuperAdminSession() {
  const session: any = await getAdminSession()
  if (!session || session.user?.role !== 'admin') return null
  return session
}
