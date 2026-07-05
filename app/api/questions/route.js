import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Question from '@/models/Question'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'
import { normalizeQuestion } from '@/lib/question'

export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()
  const { quizId, courseId } = body

  if (!quizId || !courseId) {
    return NextResponse.json(
      { error: 'quizId and courseId are required' },
      { status: 400 }
    )
  }

  const { data, error } = normalizeQuestion(body)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const order = await Question.countDocuments({ quizId })
  const question = await Question.create({ quizId, courseId, order, ...data })
  return NextResponse.json(serialize(question.toObject()), { status: 201 })
}
