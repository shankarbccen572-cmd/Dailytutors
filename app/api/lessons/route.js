import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Lesson from '@/models/Lesson'
import { getAdminSession } from '@/lib/admin'
import { serialize, pickLesson } from '@/lib/utils'

export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()
  const { courseId, sectionId, title } = body

  if (!courseId || !sectionId || !title?.trim()) {
    return NextResponse.json(
      { error: 'courseId, sectionId and title are required' },
      { status: 400 }
    )
  }

  const order = await Lesson.countDocuments({ sectionId })
  const lesson = await Lesson.create({
    courseId,
    sectionId,
    order,
    ...pickLesson(body),
    title: title.trim(),
  })

  return NextResponse.json(serialize(lesson.toObject()), { status: 201 })
}
