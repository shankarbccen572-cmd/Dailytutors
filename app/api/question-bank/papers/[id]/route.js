import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import QuestionPaper from '@/models/QuestionPaper'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'
import { normalizePaper } from '@/lib/questionPaper'

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function GET(_req, { params }) {
  const session = await getAdminSession()
  if (!session) return forbidden()

  await dbConnect()
  const paper = await QuestionPaper.findById(params.id).lean()
  if (!paper) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(serialize(paper))
}

export async function PATCH(req, { params }) {
  const session = await getAdminSession()
  if (!session) return forbidden()

  await dbConnect()
  const body = await req.json()
  const existing = await QuestionPaper.findById(params.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // --- Lightweight actions ---
  if (body.action === 'publish') {
    existing.status = 'published'
    await existing.save()
    return NextResponse.json(serialize(existing.toObject()))
  }

  if (body.action === 'duplicate') {
    const clone = existing.toObject()
    delete clone._id
    delete clone.createdAt
    delete clone.updatedAt
    const copy = await QuestionPaper.create({
      ...clone,
      title: `${clone.title} (copy)`,
      status: 'draft',
      version: 1,
      history: [],
      createdBy: session.user?.id || null,
    })
    return NextResponse.json(serialize(copy.toObject()), { status: 201 })
  }

  // --- Full edit ---
  const { data, error } = await normalizePaper(body)
  if (error) return NextResponse.json({ error }, { status: 400 })

  // Snapshot the current state into history before overwriting (version trail).
  const snapshot = {
    title: existing.title,
    sections: existing.sections,
    instructions: existing.instructions,
    headerText: existing.headerText,
    footerText: existing.footerText,
    timeMinutes: existing.timeMinutes,
    totalMarks: existing.totalMarks,
    status: existing.status,
  }
  existing.history.push({
    version: existing.version,
    note: (body.versionNote || '').toString().trim(),
    savedBy: session.user?.id || null,
    snapshot,
  })
  // Cap history to the last 30 snapshots.
  if (existing.history.length > 30) existing.history = existing.history.slice(-30)

  Object.assign(existing, data, { version: existing.version + 1 })
  await existing.save()
  return NextResponse.json(serialize(existing.toObject()))
}

export async function DELETE(_req, { params }) {
  const session = await getAdminSession()
  if (!session) return forbidden()

  await dbConnect()
  const deleted = await QuestionPaper.findByIdAndDelete(params.id).lean()
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
