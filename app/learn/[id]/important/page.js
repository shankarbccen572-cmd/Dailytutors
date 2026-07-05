import { redirect, notFound } from 'next/navigation'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import IQChapter from '@/models/IQChapter'
import IQLesson from '@/models/IQLesson'
import ImportantQuestion from '@/models/ImportantQuestion'
import Enrollment from '@/models/Enrollment'
import { getCurrentUser } from '@/lib/session'
import { serialize } from '@/lib/utils'
import { safeImportantQuestion } from '@/lib/importantQuestion'
import ImportantQuestionsRunner from '@/components/learn/ImportantQuestionsRunner'

export const dynamic = 'force-dynamic'

export default async function ImportantQuestionsPage({ params }) {
  if (!mongoose.isValidObjectId(params.id)) notFound()

  const user = await getCurrentUser()
  if (!user) redirect('/login')

  await dbConnect()
  const courseDoc = await Course.findById(params.id).lean()
  if (!courseDoc) notFound()

  // Gate: must be enrolled.
  const enrollment = await Enrollment.findOne({
    userId: user._id,
    courseId: params.id,
  }).lean()
  if (!enrollment) redirect(`/courses/${courseDoc.slug}`)

  // Check expiration
  if (enrollment.expiresAt && new Date() > new Date(enrollment.expiresAt)) {
    // Course access has expired
    redirect(`/courses/${courseDoc.slug}?expired=true`)
  }

  // Gate: important questions must be published.
  if (!courseDoc.importantQuestionsPublished) redirect(`/learn/${params.id}`)

  const [chapterDocs, lessonDocs, questionDocs] = await Promise.all([
    IQChapter.find({ courseId: params.id }).sort({ order: 1, createdAt: 1 }).lean(),
    IQLesson.find({ courseId: params.id }).sort({ order: 1, createdAt: 1 }).lean(),
    ImportantQuestion.find({ courseId: params.id })
      .sort({ order: 1, createdAt: 1 })
      .lean(),
  ])

  const course = serialize(courseDoc)
  const chaptersRaw = serialize(chapterDocs)
  const lessonsRaw = serialize(lessonDocs)
  // Strip the answer key before sending to the client.
  const questions = serialize(questionDocs.map(safeImportantQuestion))

  // Nest: chapter → lessons → questions.
  const chapters = chaptersRaw.map((c) => ({
    _id: c._id,
    title: c.title,
    lessons: lessonsRaw
      .filter((l) => l.chapterId === c._id)
      .map((l) => ({
        _id: l._id,
        title: l.title,
        questions: questions.filter((q) => q.lessonId === l._id),
      })),
  }))

  return (
    <ImportantQuestionsRunner
      courseId={params.id}
      course={course}
      chapters={chapters}
    />
  )
}
