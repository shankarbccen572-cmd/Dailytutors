import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Quiz from '@/models/Quiz'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'

export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const { courseId, title } = await req.json()

  if (!courseId || !title?.trim()) {
    return NextResponse.json(
      { error: 'courseId and title are required' },
      { status: 400 }
    )
  }

  const order = await Quiz.countDocuments({ courseId })
  const quiz = await Quiz.create({ courseId, title: title.trim(), order })
  return NextResponse.json(serialize(quiz.toObject()), { status: 201 })
}
