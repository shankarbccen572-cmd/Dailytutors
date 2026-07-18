/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import Section from '@/models/Section'
import Lesson from '@/models/Lesson'
import Quiz from '@/models/Quiz'
import Enrollment from '@/models/Enrollment'
import { getCurrentUser } from '@/lib/session'
import { serialize } from '@/lib/utils'
import SignInCta from '@/components/SignInCta'
import EnrollButton from '@/components/EnrollButton'
import PreviewPlayer from '@/components/PreviewPlayer'
import {
  ArrowLeft,
  Check,
  PlayCircle,
  PlaySquare,
  Layers,
  FileText,
  Clock,
  GraduationCap,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  await dbConnect()
  const courseDoc = await Course.findOne({ slug: params.slug, status: 'published' }).lean()

  if (!courseDoc) {
    return {
      title: 'Course Not Found',
      description: 'The requested course is not available right now.',
    }
  }

  const description =
    courseDoc.description?.slice(0, 155) ||
    `Learn ${courseDoc.title} with structured lessons, tests and expert guidance from Daily Tutors.`

  return {
    title: courseDoc.title,
    description,
    alternates: {
      canonical: `/courses/${courseDoc.slug}`,
    },
    openGraph: {
      title: courseDoc.title,
      description,
      type: 'article',
      url: `https://dailytutors.in/courses/${courseDoc.slug}`,
      images: [courseDoc.thumbnail ? courseDoc.thumbnail : '/logo-full.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: courseDoc.title,
      description,
      images: [courseDoc.thumbnail ? courseDoc.thumbnail : '/logo-full.png'],
    },
  }
}

export default async function CourseDetail({ params }) {
  await dbConnect()
  const courseDoc = await Course.findOne({ slug: params.slug }).lean()
  if (!courseDoc || courseDoc.status !== 'published') notFound()

  const [sectionDocs, lessonDocs, quizDocs] = await Promise.all([
    Section.find({ courseId: courseDoc._id }).sort({ order: 1, createdAt: 1 }).lean(),
    Lesson.find({ courseId: courseDoc._id }).sort({ order: 1, createdAt: 1 }).lean(),
    Quiz.find({ courseId: courseDoc._id, status: 'published' })
      .sort({ order: 1, createdAt: 1 })
      .lean(),
  ])

  const course = serialize(courseDoc)
  const sections = serialize(sectionDocs)
  const lessons = serialize(lessonDocs)
  const quizzes = serialize(quizDocs)

  const sectionsWithLessons = sections.map((s) => ({
    ...s,
    lessons: lessons.filter((l) => l.sectionId === s._id),
  }))

  const user = await getCurrentUser()
  let enrolled = false
  let enrollment = null
  if (user) {
    enrollment = await Enrollment.findOne({
      userId: user._id,
      courseId: course._id,
    }).lean()
    enrolled = Boolean(enrollment)
  }

  const price =
    course.discountPrice > 0 ? course.discountPrice : course.originalPrice

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description || `Learn ${course.title} with structured lessons and expert guidance.`,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Daily Tutors',
      sameAs: 'https://dailytutors.in',
    },
    educationalLevel: 'Intermediate',
    teaches: [course.examTarget || 'Exam preparation', course.category || 'Online learning'].filter(Boolean),
    url: `https://dailytutors.in/courses/${course.slug}`,
  }

  return (
    <div className="min-h-screen bg-brand-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <header className="sticky top-0 z-20 border-b border-brand-border bg-brand-primary/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/courses">
            <img src="/logo-full.png" alt="Daily Tutors" style={{ width: '200px', height: 'auto' }} />
          </Link>
          <SignInCta
            label="Sign in"
            authedLabel="Dashboard"
            className="rounded-xl bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5"
          />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm text-brand-textSecondary transition-colors hover:text-brand-textPrimary"
          >
            <ArrowLeft className="h-4 w-4" /> All courses
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {course.category && (
              <span className="w-fit rounded-full bg-brand-accent px-3 py-1 text-xs font-semibold text-white">
                {course.category}
              </span>
            )}
            {course.examTarget && (
              <span className="w-fit rounded-full bg-brand-accentLight px-3 py-1 text-xs font-semibold text-brand-accentDark">
                {course.examTarget}
              </span>
            )}
          </div>
          <h1 className="mt-3 font-heading text-3xl font-bold text-brand-textPrimary sm:text-4xl">
            {course.title}
          </h1>
          {course.description && (
            <p className="mt-3 text-brand-textSecondary">{course.description}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-brand-textSecondary">
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-brand-accent" />
              {sectionsWithLessons.length} sections
            </span>
            <span className="flex items-center gap-1.5">
              <PlaySquare className="h-4 w-4 text-brand-accent" />
              {lessons.length} lessons
            </span>
            {quizzes.length > 0 && (
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-brand-accent" />
                {quizzes.length} tests
              </span>
            )}
          </div>

          {course.previewVideo && (
            <PreviewPlayer
              url={course.previewVideo}
              poster={course.thumbnail}
              title={`${course.title} — free preview`}
            />
          )}

          {course.whatYouLearn?.length > 0 && (
            <section className="mt-8 rounded-2xl border border-brand-border bg-white p-6 shadow-card">
              <h2 className="font-heading text-xl font-bold text-brand-textPrimary">
                What you&apos;ll learn
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {course.whatYouLearn.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-brand-textPrimary">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-success/15 text-brand-success">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Curriculum */}
          <section className="mt-8">
            <h2 className="font-heading text-xl font-bold text-brand-textPrimary">
              Course content
            </h2>
            <p className="mt-1 text-sm text-brand-textSecondary">
              {sectionsWithLessons.length} sections · {lessons.length} lessons
            </p>
            <div className="mt-4 space-y-3">
              {sectionsWithLessons.map((s) => (
                <div
                  key={s._id}
                  className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card"
                >
                  <div className="flex items-center gap-2 border-b border-brand-border bg-brand-surface px-4 py-3">
                    <Layers className="h-4 w-4 text-brand-accent" />
                    <h3 className="font-heading text-base font-semibold text-brand-textPrimary">
                      {s.title}
                    </h3>
                    <span className="ml-auto text-xs text-brand-textSecondary">
                      {s.lessons.length} lessons
                    </span>
                  </div>
                  <ul className="divide-y divide-brand-border">
                    {s.lessons.map((l) => (
                      <li
                        key={l._id}
                        className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-brand-textSecondary"
                      >
                        <span className="flex items-center gap-2">
                          <PlayCircle className="h-4 w-4 text-brand-textSecondary" />
                          <span className="text-brand-textPrimary">{l.title}</span>
                          {l.isFreePreview && (
                            <span className="rounded-full bg-brand-success/15 px-2 py-0.5 text-xs font-medium text-brand-success">
                              Free preview
                            </span>
                          )}
                        </span>
                        {l.duration && (
                          <span className="flex items-center gap-1 text-xs">
                            <Clock className="h-3.5 w-3.5" />
                            {l.duration}
                          </span>
                        )}
                      </li>
                    ))}
                    {s.lessons.length === 0 && (
                      <li className="px-4 py-2.5 text-xs text-brand-textSecondary">
                        Lessons coming soon.
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Tests */}
          {quizzes.length > 0 && (
            <section className="mt-8">
              <h2 className="font-heading text-xl font-bold text-brand-textPrimary">
                Tests &amp; Quizzes
              </h2>
              <ul className="mt-3 space-y-2">
                {quizzes.map((q) => (
                  <li
                    key={q._id}
                    className="flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-textPrimary shadow-card"
                  >
                    <FileText className="h-4 w-4 text-brand-accent" /> {q.title}
                    {q.timeLimit > 0 && (
                      <span className="flex items-center gap-1 text-xs text-brand-textSecondary">
                        · <Clock className="h-3.5 w-3.5" /> {q.timeLimit} min
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar / purchase card */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-cardHover">
            <div className="aspect-video w-full overflow-hidden bg-brand-accentLight/40">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-brand-accent/40">
                  <GraduationCap className="h-14 w-14" />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-baseline gap-2">
                {price > 0 ? (
                  <>
                    <span className="font-heading text-3xl font-bold text-brand-textPrimary">
                      ₹{price}
                    </span>
                    {course.discountPrice > 0 && course.originalPrice > course.discountPrice && (
                      <span className="text-brand-textSecondary line-through">
                        ₹{course.originalPrice}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-heading text-3xl font-bold text-brand-success">Free</span>
                )}
              </div>

              <EnrollButton
                courseId={course._id}
                enrolled={enrolled}
                price={price}
                courseTitle={course.title}
                className="mt-4 block w-full rounded-xl bg-accent-gradient px-5 py-3 text-center font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              />

              {/* Show expiration info if enrolled */}
              {enrolled && enrollment?.expiresAt && (
                <div className="mt-4 rounded-lg border border-brand-accent/30 bg-brand-accent/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-accent">
                    Access Expires
                  </p>
                  <p className="mt-1 text-sm font-medium text-brand-textPrimary">
                    {new Date(enrollment.expiresAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {enrollment.expiresAt && new Date() > new Date(enrollment.expiresAt) && (
                    <p className="mt-1 text-xs text-brand-accent font-medium">
                      ⚠️ Your access has expired
                    </p>
                  )}
                </div>
              )}

              {course.instructorName && (
                <div className="mt-5 border-t border-brand-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-textSecondary">
                    Instructor
                  </p>
                  <p className="mt-1 font-medium text-brand-textPrimary">
                    {course.instructorName}
                  </p>
                  {course.instructorBio && (
                    <p className="mt-1 text-sm text-brand-textSecondary">
                      {course.instructorBio}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
