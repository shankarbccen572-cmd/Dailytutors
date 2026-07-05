import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Lesson from '@/models/Lesson'
import Enrollment from '@/models/Enrollment'
import { getAdminSession } from '@/lib/admin'
import { serialize, pickLesson } from '@/lib/utils'

export async function PATCH(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const update = pickLesson(await req.json())
  if (typeof update.title === 'string') update.title = update.title.trim()

  const lesson = await Lesson.findByIdAndUpdate(params.id, update, {
    new: true,
  }).lean()
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(serialize(lesson))
}

export async function DELETE(_req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const lesson = await Lesson.findByIdAndDelete(params.id).lean()
  if (!lesson) return NextResponse.json({ ok: true })

  // Remove this lesson from any student's completed list and recompute their
  // course progress so percentages can't exceed 100%.
  await Enrollment.updateMany(
    { courseId: lesson.courseId },
    { $pull: { completedLessons: lesson._id } }
  )
  const total = await Lesson.countDocuments({ courseId: lesson.courseId })
  const affected = await Enrollment.find({ courseId: lesson.courseId }).lean()
  await Promise.all(
    affected.map((e) => {
      const done = (e.completedLessons || []).length
      const progress = total > 0 ? Math.round((done / total) * 100) : 0
      return Enrollment.updateOne({ _id: e._id }, { progress })
    })
  )

  return NextResponse.json({ ok: true })
}
