import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import ImportantQuestion from '@/models/ImportantQuestion'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'
import { normalizeImportantQuestion } from '@/lib/importantQuestion'

export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()
  const { courseId } = body
  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
  }

  const { data, error } = normalizeImportantQuestion(body)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const order = await ImportantQuestion.countDocuments({
    courseId,
    lessonId: data.lessonId,
  })
  const created = await ImportantQuestion.create({ courseId, order, ...data })
  return NextResponse.json(serialize(created.toObject()), { status: 201 })
}
