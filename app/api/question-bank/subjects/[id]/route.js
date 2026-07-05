import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BankSubject from '@/models/BankSubject'
import BankChapter from '@/models/BankChapter'
import BankTopic from '@/models/BankTopic'
import BankQuestion from '@/models/BankQuestion'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'

export async function PATCH(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()
  const patch = {}
  if (body.name !== undefined) patch.name = body.name.toString().trim()
  if (body.board !== undefined) patch.board = body.board.toString().trim()
  if (body.grade !== undefined) patch.grade = body.grade.toString().trim()
  if (Array.isArray(body.exams)) {
    patch.exams = body.exams.map((e) => e.toString().trim()).filter(Boolean)
  }
  const updated = await BankSubject.findByIdAndUpdate(params.id, patch, { new: true }).lean()
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(serialize(updated))
}

// Cascade: drop the subject, all its chapters, topics and questions.
export async function DELETE(_req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  await Promise.all([
    BankSubject.findByIdAndDelete(params.id),
    BankChapter.deleteMany({ subjectId: params.id }),
    BankTopic.deleteMany({ subjectId: params.id }),
    BankQuestion.deleteMany({ subjectId: params.id }),
  ])
  return NextResponse.json({ ok: true })
}
