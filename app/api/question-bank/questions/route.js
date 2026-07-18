import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BankQuestion from '@/models/BankQuestion'
import BankSubject from '@/models/BankSubject'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'
import { normalizeBankQuestion, pickBankFilter } from '@/lib/bankQuestion'

// Filtered listing for the bank browser / (future) selection engine. Accepts
// subjectId, chapterId, topicId, type, difficulty, source, accessTier, status,
// exam. Capped so a 10-lakh bank can't dump everything into one response.
export async function GET(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const params = Object.fromEntries(new URL(req.url).searchParams.entries())
  const filter = pickBankFilter(params)
  const limit = Math.min(Number(params.limit) || 100, 500)

  const questions = await BankQuestion.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
  const total = await BankQuestion.countDocuments(filter)
  return NextResponse.json({ questions: serialize(questions), total })
}

export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()
  const { data, error } = normalizeBankQuestion(body)
  if (error) return NextResponse.json({ error }, { status: 400 })

  // Denormalize categoryId from the subject so it is always correct, regardless
  // of what the client sent.
  const subject = await BankSubject.findById(data.subjectId).select('categoryId').lean()
  data.categoryId = subject?.categoryId || data.categoryId || null

  const created = await BankQuestion.create({
    ...data,
    createdBy: session.user?.id || null,
  })
  return NextResponse.json(serialize(created.toObject()), { status: 201 })
}
