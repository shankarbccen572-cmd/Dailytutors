import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BankQuestion from '@/models/BankQuestion'
import BankSubject from '@/models/BankSubject'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'
import { normalizeBankQuestion } from '@/lib/bankQuestion'

export async function PATCH(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()

  // Lightweight lifecycle action: archive / restore without touching content.
  if (body.action === 'archive' || body.action === 'restore') {
    const status = body.action === 'archive' ? 'archived' : (body.status || 'draft')
    const moved = await BankQuestion.findByIdAndUpdate(
      params.id,
      { $set: { status } },
      { new: true }
    ).lean()
    if (!moved) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(serialize(moved))
  }

  // Full edit: re-validate + re-derive the denormalized categoryId.
  const { data, error } = normalizeBankQuestion(body)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const subject = await BankSubject.findById(data.subjectId).select('categoryId').lean()
  data.categoryId = subject?.categoryId || data.categoryId || null

  const updated = await BankQuestion.findByIdAndUpdate(params.id, data, { new: true }).lean()
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(serialize(updated))
}

export async function DELETE(_req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  await BankQuestion.findByIdAndDelete(params.id)
  return NextResponse.json({ ok: true })
}
