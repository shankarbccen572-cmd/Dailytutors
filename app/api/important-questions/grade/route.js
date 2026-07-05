import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import ImportantQuestion from '@/models/ImportantQuestion'
import Enrollment from '@/models/Enrollment'
import { getCurrentUser } from '@/lib/session'
import { gradeImportant } from '@/lib/importantQuestion'

// Grade an important-questions practice submission server-side so the answer
// key is never exposed before submitting. Practice only — not persisted.
export async function POST(req) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in first' }, { status: 401 })

  await dbConnect()
  const { courseId, answers = {} } = await req.json()
  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
  }

  const course = await Course.findById(courseId).lean()
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!course.importantQuestionsPublished) {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  // Must be enrolled in the course.
  const enrolled = await Enrollment.findOne({
    userId: user._id,
    courseId,
  }).lean()
  if (!enrolled) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })

  const questions = await ImportantQuestion.find({ courseId }).lean()

  let score = 0
  let total = 0
  const results = questions.map((q) => {
    total += q.marks || 1
    const { correct, correctIndex, awarded } = gradeImportant(
      q,
      answers[q._id.toString()]
    )
    score += awarded
    return {
      questionId: q._id.toString(),
      correct,
      correctIndex,
      explanation: q.explanation || '',
    }
  })

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  return NextResponse.json({ score, total, percentage, results })
}
