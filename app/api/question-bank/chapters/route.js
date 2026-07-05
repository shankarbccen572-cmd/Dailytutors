import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BankChapter from '@/models/BankChapter'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'

// List chapters for a subject (?subjectId=...).
export async function GET(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const subjectId = new URL(req.url).searchParams.get('subjectId')
  const filter = subjectId ? { subjectId } : {}
  const chapters = await BankChapter.find(filter).sort({ order: 1, createdAt: 1 }).lean()
  return NextResponse.json(serialize(chapters))
}

export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()
  const title = (body.title || '').toString().trim()
  if (!body.subjectId || !title) {
    return NextResponse.json({ error: 'subjectId and title are required' }, { status: 400 })
  }

  const order = await BankChapter.countDocuments({ subjectId: body.subjectId })
  const chapter = await BankChapter.create({
    subjectId: body.subjectId,
    title,
    weightage: Number(body.weightage) > 0 ? Number(body.weightage) : 0,
    order,
  })
  return NextResponse.json(serialize(chapter.toObject()), { status: 201 })
}
