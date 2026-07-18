import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import Lesson from '@/models/Lesson'
import Enrollment from '@/models/Enrollment'
import { getCurrentUser } from '@/lib/session'
import { resolveVideoSource } from '@/lib/videoAccess'

// GET /api/lessons/:id/video — the ONLY place a lesson's video URL is handed to
// the client. Premium URLs are no longer embedded in the learn page HTML; the
// player fetches them here, per active lesson, after a server-side check:
//   - the user is authenticated, AND
//   - the lesson is a free preview, OR the user has an active (non-expired)
//     enrollment in the lesson's course.
export const dynamic = 'force-dynamic'

export async function GET(_req, { params }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Invalid lesson' }, { status: 400 })
  }

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })

  await dbConnect()
  const lesson = await Lesson.findById(params.id).lean()
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!lesson.isFreePreview) {
    const enrollment = await Enrollment.findOne({
      userId: user._id,
      courseId: lesson.courseId,
    }).lean()
    if (!enrollment) {
      return NextResponse.json({ error: 'Purchase required' }, { status: 403 })
    }
    if (enrollment.expiresAt && new Date() > new Date(enrollment.expiresAt)) {
      return NextResponse.json({ error: 'Access expired' }, { status: 403 })
    }
  }

  const { url, native } = resolveVideoSource(lesson)
  return NextResponse.json(
    { url, native },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
