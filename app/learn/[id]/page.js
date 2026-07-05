import { redirect, notFound } from 'next/navigation'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import Section from '@/models/Section'
import Lesson from '@/models/Lesson'
import Quiz from '@/models/Quiz'
import ImportantQuestion from '@/models/ImportantQuestion'
import Enrollment from '@/models/Enrollment'
import { getCurrentUser } from '@/lib/session'
import { serialize } from '@/lib/utils'
import CoursePlayer from '@/components/learn/CoursePlayer'

export const dynamic = 'force-dynamic'

export default async function LearnPage({ params }) {
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

  const [sectionDocs, lessonDocs, quizDocs, importantCount] = await Promise.all([
    Section.find({ courseId: params.id }).sort({ order: 1, createdAt: 1 }).lean(),
    Lesson.find({ courseId: params.id }).sort({ order: 1, createdAt: 1 }).lean(),
    Quiz.find({ courseId: params.id, status: 'published' })
      .sort({ order: 1, createdAt: 1 })
      .lean(),
    ImportantQuestion.countDocuments({ courseId: params.id }),
  ])

  const course = serialize(courseDoc)
  const sections = serialize(sectionDocs)
  const lessons = serialize(lessonDocs)
  const quizzes = serialize(quizDocs)
  const completed = (enrollment.completedLessons || []).map((id) =>
    id.toString()
  )

  // Independent publish switches per content area.
  const curriculumPublished = course.curriculumPublished !== false
  const importantPublished = course.importantQuestionsPublished === true

  const sectionsWithLessons = sections.map((s) => ({
    ...s,
    lessons: lessons.filter((l) => l.sectionId === s._id),
  }))

  return (
    <CoursePlayer
      course={course}
      sections={curriculumPublished ? sectionsWithLessons : []}
      quizzes={curriculumPublished ? quizzes : []}
      curriculumPublished={curriculumPublished}
      importantCount={importantPublished ? importantCount : 0}
      initialCompleted={completed}
    />
  )
}
