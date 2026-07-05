import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import IQLesson from '@/models/IQLesson'
import ImportantQuestion from '@/models/ImportantQuestion'
import { getAdminSession } from '@/lib/admin'

export async function DELETE(_req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  // Cascade: drop the lesson and all its questions.
  await Promise.all([
    IQLesson.findByIdAndDelete(params.id),
    ImportantQuestion.deleteMany({ lessonId: params.id }),
  ])
  return NextResponse.json({ ok: true })
}
