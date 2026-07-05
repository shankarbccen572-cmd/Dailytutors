import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BankTopic from '@/models/BankTopic'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'

// List topics for a chapter (?chapterId=...).
export async function GET(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const chapterId = new URL(req.url).searchParams.get('chapterId')
  const filter = chapterId ? { chapterId } : {}
  const topics = await BankTopic.find(filter).sort({ order: 1, createdAt: 1 }).lean()
  return NextResponse.json(serialize(topics))
}

export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()
  const title = (body.title || '').toString().trim()
  if (!body.subjectId || !body.chapterId || !title) {
    return NextResponse.json(
      { error: 'subjectId, chapterId and title are required' },
      { status: 400 }
    )
  }

  const order = await BankTopic.countDocuments({ chapterId: body.chapterId })
  const topic = await BankTopic.create({
    subjectId: body.subjectId,
    chapterId: body.chapterId,
    title,
    order,
  })
  return NextResponse.json(serialize(topic.toObject()), { status: 201 })
}
