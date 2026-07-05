import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import IQChapter from '@/models/IQChapter'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'

export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const { courseId, title } = await req.json()
  if (!courseId || !(title || '').trim()) {
    return NextResponse.json(
      { error: 'courseId and title are required' },
      { status: 400 }
    )
  }

  const order = await IQChapter.countDocuments({ courseId })
  const chapter = await IQChapter.create({
    courseId,
    title: title.trim(),
    order,
  })
  return NextResponse.json(serialize(chapter.toObject()), { status: 201 })
}
