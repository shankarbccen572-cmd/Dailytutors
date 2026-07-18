import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import QuestionPaper from '@/models/QuestionPaper'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'
import { normalizePaper } from '@/lib/questionPaper'

export async function GET(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const { searchParams } = new URL(req.url)
  const query = {}
  if (searchParams.get('status')) query.status = searchParams.get('status')
  if (searchParams.get('categoryId')) query.categoryId = searchParams.get('categoryId')

  const papers = await QuestionPaper.find(query)
    .select('-history') // keep the list light
    .sort({ updatedAt: -1 })
    .limit(200)
    .lean()
  return NextResponse.json(serialize(papers))
}

export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()
  const { data, error } = await normalizePaper(body)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const paper = await QuestionPaper.create({ ...data, createdBy: session.user?.id || null })
  return NextResponse.json(serialize(paper.toObject()), { status: 201 })
}
