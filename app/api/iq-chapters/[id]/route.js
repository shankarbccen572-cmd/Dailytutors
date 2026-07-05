import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import IQChapter from '@/models/IQChapter'
import IQLesson from '@/models/IQLesson'
import ImportantQuestion from '@/models/ImportantQuestion'
import { getAdminSession } from '@/lib/admin'

export async function DELETE(_req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  // Cascade: drop the chapter, its lessons and all their questions.
  await Promise.all([
    IQChapter.findByIdAndDelete(params.id),
    IQLesson.deleteMany({ chapterId: params.id }),
    ImportantQuestion.deleteMany({ chapterId: params.id }),
  ])
  return NextResponse.json({ ok: true })
}
