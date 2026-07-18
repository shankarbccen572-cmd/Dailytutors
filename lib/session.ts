import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { verifyStudentToken, STUDENT_TOKEN_NAME } from '@/lib/studentJwt'

const AUTH_DISABLED = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

// Resolves the current user as a real MongoDB document (so queries that need a
// real userId work). While auth is on hold for development, it find-or-creates
// a stable local dev user so the dashboard has something to work with.
export async function getCurrentUser() {
  if (!process.env.MONGODB_URI) return null
  await dbConnect()

  if (AUTH_DISABLED) {
    let user = await User.findOne({ email: 'dev@local' })
    if (!user) {
      user = await User.create({
        googleId: 'dev-local',
        email: 'dev@local',
        name: 'Developer',
        role: 'admin',
      })
    }
    return user
  }

  const session = await getServerSession(authOptions)
  if (session?.user?.email) {
    const existing = await User.findOne({ email: session.user.email })
    if (existing) return existing
  }

  const cookieStore = cookies()
  const token = cookieStore.get(STUDENT_TOKEN_NAME)?.value
  if (!token) return null

  const verification = await verifyStudentToken(token)
  if (!verification.valid || !verification.payload.userId) return null

  return User.findById(verification.payload.userId)
}
