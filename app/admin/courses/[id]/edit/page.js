import Link from 'next/link'
import { notFound } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import Section from '@/models/Section'
import Lesson from '@/models/Lesson'
import Quiz from '@/models/Quiz'
import Question from '@/models/Question'
import IQChapter from '@/models/IQChapter'
import IQLesson from '@/models/IQLesson'
import ImportantQuestion from '@/models/ImportantQuestion'
import { serialize } from '@/lib/utils'
import CourseForm from '@/components/admin/CourseForm'
import CurriculumBuilder from '@/components/admin/CurriculumBuilder'
import ImportantQuestionsBuilder from '@/components/admin/ImportantQuestionsBuilder'
import PublishControl from '@/components/admin/PublishControl'

export const dynamic = 'force-dynamic'

export default async function EditCoursePage({ params }) {
  await dbConnect()

  const courseDoc = await Course.findById(params.id).lean()
  if (!courseDoc) notFound()

  const sectionDocs = await Section.find({ courseId: params.id })
    .sort({ order: 1, createdAt: 1 })
    .lean()
  const lessonDocs = await Lesson.find({ courseId: params.id })
    .sort({ order: 1, createdAt: 1 })
    .lean()

  const quizDocs = await Quiz.find({ courseId: params.id })
    .sort({ order: 1, createdAt: 1 })
    .lean()
  const questionDocs = await Question.find({ courseId: params.id })
    .sort({ order: 1, createdAt: 1 })
    .lean()
  const importantQuestionDocs = await ImportantQuestion.find({
    courseId: params.id,
  })
    .sort({ order: 1, createdAt: 1 })
    .lean()
  const iqChapterDocs = await IQChapter.find({ courseId: params.id })
    .sort({ order: 1, createdAt: 1 })
    .lean()
  const iqLessonDocs = await IQLesson.find({ courseId: params.id })
    .sort({ order: 1, createdAt: 1 })
    .lean()

  const course = serialize(courseDoc)
  const sections = serialize(sectionDocs)
  const lessons = serialize(lessonDocs)
  const quizzes = serialize(quizDocs)
  const questions = serialize(questionDocs)
  const importantQuestions = serialize(importantQuestionDocs)
  const iqChapters = serialize(iqChapterDocs)
  const iqLessons = serialize(iqLessonDocs)

  // Nest lessons under their section for the curriculum builder.
  const sectionsWithLessons = sections.map((s) => ({
    ...s,
    lessons: lessons.filter((l) => l.sectionId === s._id),
  }))

  // Nest questions under their quiz for the quiz builder.
  const quizzesWithQuestions = quizzes.map((q) => ({
    ...q,
    questions: questions.filter((qn) => qn.quizId === q._id),
  }))

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/admin/courses"
            className="text-sm text-brand-textSecondary hover:text-brand-textPrimary"
          >
            ← Back to courses
          </Link>
          <span className="rounded-full bg-brand-accentLight px-3 py-1 text-xs font-semibold capitalize text-brand-accentDark">
            {course.status}
          </span>
        </div>
        <h1 className="mt-2 font-heading text-2xl font-bold text-brand-textPrimary">
          Edit course
        </h1>
      </div>

      <CourseForm mode="edit" initialData={course} courseId={course._id} />

      <section>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-bold text-brand-textPrimary">
            Curriculum — chapters &amp; topics
          </h2>
          <PublishControl
            courseId={course._id}
            field="curriculumPublished"
            initial={course.curriculumPublished ?? true}
            noun="curriculum"
          />
        </div>
        <p className="mb-5 text-sm text-brand-textSecondary">
          Add a <b>Section</b> (chapter), then add <b>Lessons</b> (topics) under
          it. Click <b>Edit</b> on any lesson to upload its video, attach
          resources (PDF notes, extra videos, files) and add <b>tests &amp;
          quizzes</b> — create the quiz and its questions right there. This is
          exactly what students see in the course player.
        </p>
        <CurriculumBuilder
          courseId={course._id}
          initialSections={sectionsWithLessons}
          quizzes={quizzesWithQuestions}
        />
      </section>

      <section>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-bold text-brand-textPrimary">
            Important Questions (chapter-wise)
          </h2>
          <PublishControl
            courseId={course._id}
            field="importantQuestionsPublished"
            initial={course.importantQuestionsPublished ?? false}
            noun="questions"
          />
        </div>
        <p className="mb-5 text-sm text-brand-textSecondary">
          A separate, chapter-wise question bank for this course. Add a{' '}
          <b>chapter</b>, add <b>lessons</b> inside it, then add questions to
          each lesson. Supported types: <b>Assertion &amp; Reason</b>,{' '}
          <b>Statement-based</b>, and <b>Match the Column</b>.
        </p>
        <ImportantQuestionsBuilder
          courseId={course._id}
          initialChapters={iqChapters}
          initialLessons={iqLessons}
          initialQuestions={importantQuestions}
        />
      </section>
    </div>
  )
}
