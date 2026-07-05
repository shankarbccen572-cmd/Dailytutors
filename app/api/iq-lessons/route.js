import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import IQLesson from '@/models/IQLesson'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'

export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const { courseId, chapterId, title } = await req.json()
  if (!courseId || !chapterId || !(title || '').trim()) {
    return NextResponse.json(
      { error: 'courseId, chapterId and title are required' },
      { status: 400 }
    )
  }

  const order = await IQLesson.countDocuments({ chapterId })
  const lesson = await IQLesson.create({
    courseId,
    chapterId,
    title: title.trim(),
    order,
  })
  return NextResponse.json(serialize(lesson.toObject()), { status: 201 })
}
