import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import Lesson from '@/models/Lesson'
import Enrollment from '@/models/Enrollment'
import { getCurrentUser } from '@/lib/session'

// Toggle a lesson's completion for the signed-in (enrolled) student and
// recompute the enrollment's overall progress %. Body: { completed: boolean }.
export async function POST(req, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in first' }, { status: 401 })

  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Invalid lesson' }, { status: 400 })
  }

  await dbConnect()
  const lesson = await Lesson.findById(params.id).lean()
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const enrollment = await Enrollment.findOne({
    userId: user._id,
    courseId: lesson.courseId,
  })
  if (!enrollment) {
    return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
  }

  const { completed } = await req.json()
  const op = completed
    ? { $addToSet: { completedLessons: lesson._id } }
    : { $pull: { completedLessons: lesson._id } }
  await Enrollment.updateOne({ _id: enrollment._id }, op)

  // Recompute progress against the current number of lessons in the course.
  const [total, fresh] = await Promise.all([
    Lesson.countDocuments({ courseId: lesson.courseId }),
    Enrollment.findById(enrollment._id).lean(),
  ])
  const done = (fresh.completedLessons || []).length
  const progress = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
  await Enrollment.updateOne({ _id: enrollment._id }, { progress })

  return NextResponse.json({
    ok: true,
    completedLessons: (fresh.completedLessons || []).map((id) => id.toString()),
    progress,
  })
}
