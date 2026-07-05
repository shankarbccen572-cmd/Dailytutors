import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
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
  if (body.title !== undefined) patch.title = body.title.toString().trim()
  if (body.weightage !== undefined) patch.weightage = Number(body.weightage) || 0
  const updated = await BankChapter.findByIdAndUpdate(params.id, patch, { new: true }).lean()
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(serialize(updated))
}

// Cascade: drop the chapter, its topics and questions.
export async function DELETE(_req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  await Promise.all([
    BankChapter.findByIdAndDelete(params.id),
    BankTopic.deleteMany({ chapterId: params.id }),
    BankQuestion.deleteMany({ chapterId: params.id }),
  ])
  return NextResponse.json({ ok: true })
}
