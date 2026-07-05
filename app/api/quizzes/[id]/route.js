import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Quiz from '@/models/Quiz'
import Question from '@/models/Question'
import { getAdminSession } from '@/lib/admin'
import { serialize, pickQuiz } from '@/lib/utils'

export async function PATCH(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()
  const updated = await Quiz.findByIdAndUpdate(
    params.id,
    { $set: pickQuiz(body) },
    { new: true }
  ).lean()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(serialize(updated))
}

export async function DELETE(_req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  // Cascade: remove the quiz and all its questions.
  await Promise.all([
    Quiz.findByIdAndDelete(params.id),
    Question.deleteMany({ quizId: params.id }),
  ])

  return NextResponse.json({ ok: true })
}
