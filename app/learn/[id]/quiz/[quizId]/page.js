import { redirect, notFound } from 'next/navigation'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import Quiz from '@/models/Quiz'
import Question from '@/models/Question'
import Enrollment from '@/models/Enrollment'
import { getCurrentUser } from '@/lib/session'
import { serialize } from '@/lib/utils'
import { safeQuestion as stripQuestion } from '@/lib/question'
import QuizRunner from '@/components/learn/QuizRunner'

export const dynamic = 'force-dynamic'

export default async function QuizPage({ params }) {
  if (!mongoose.isValidObjectId(params.quizId)) notFound()

  const user = await getCurrentUser()
  if (!user) redirect('/login')

  await dbConnect()
  const quizDoc = await Quiz.findById(params.quizId).lean()
  if (!quizDoc || quizDoc.status !== 'published') notFound()

  // Gate: enrolled in the course.
  const enrollment = await Enrollment.findOne({
    userId: user._id,
    courseId: quizDoc.courseId,
  }).lean()
  if (!enrollment) redirect(`/learn/${params.id}`)

  // Check expiration
  if (enrollment.expiresAt && new Date() > new Date(enrollment.expiresAt)) {
    // Course access has expired
    redirect(`/courses/${params.id}?expired=true`)
  }

  const questionDocs = await Question.find({ quizId: params.quizId })
    .sort({ order: 1, createdAt: 1 })
    .lean()

  const quiz = serialize(quizDoc)
  // Strip correct answers before sending to the client.
  const questions = serialize(questionDocs.map(stripQuestion))

  return (
    <QuizRunner courseId={params.id} quiz={quiz} questions={questions} />
  )
}
