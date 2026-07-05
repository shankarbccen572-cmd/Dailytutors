import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Quiz from '@/models/Quiz'
import Question from '@/models/Question'
import Enrollment from '@/models/Enrollment'
import QuizAttempt from '@/models/QuizAttempt'
import { getCurrentUser } from '@/lib/session'
import { gradeAnswer } from '@/lib/question'

// Grade a quiz submission server-side (so answers are never exposed to the
// client) and store the attempt.
export async function POST(req, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in first' }, { status: 401 })

  await dbConnect()
  const quiz = await Quiz.findById(params.id).lean()
  if (!quiz || quiz.status !== 'published') {
    return NextResponse.json({ error: 'Quiz not available' }, { status: 404 })
  }

  // Must be enrolled in the quiz's course.
  const enrolled = await Enrollment.findOne({
    userId: user._id,
    courseId: quiz.courseId,
  }).lean()
  if (!enrolled) {
    return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
  }

  const { answers = {} } = await req.json()
  const questions = await Question.find({ quizId: params.id }).lean()

  let score = 0
  let total = 0
  const results = questions.map((q) => {
    total += q.marks || 1
    const { correct, awarded } = gradeAnswer(q, answers[q._id.toString()])
    score += awarded
    return {
      questionId: q._id.toString(),
      correct,
      awarded,
      // Reveal the answer key only after submission.
      explanation: q.explanation || '',
      correctOptions: (q.options || [])
        .map((o, i) => (o.isCorrect ? i : -1))
        .filter((i) => i >= 0),
      correctAnswer: q.correctAnswer || '',
    }
  })

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  const passed = percentage >= (quiz.passingScore || 0)

  await QuizAttempt.create({
    userId: user._id,
    quizId: quiz._id,
    courseId: quiz.courseId,
    answers,
    score,
    total,
    percentage,
    passed,
  })

  return NextResponse.json({ score, total, percentage, passed, results })
}
