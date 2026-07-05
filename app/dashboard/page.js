/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { redirect } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Course from '@/models/Course'
import { getCurrentUser } from '@/lib/session'
import { serialize } from '@/lib/utils'
import CourseCard from '@/components/CourseCard'
import {
  Play,
  RotateCcw,
  BookOpen,
  GraduationCap,
  Sparkles,
  Clock,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function StudentHome() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  await dbConnect()
  const [enrollRows, publishedDocs] = await Promise.all([
    Enrollment.find({ userId: user._id })
      .populate('courseId')
      .sort({ createdAt: -1 })
      .lean(),
    Course.find({ status: 'published' }).sort({ createdAt: -1 }).lean(),
  ])

  const enrollments = serialize(enrollRows).filter((e) => e.courseId)
  const published = serialize(publishedDocs)

  const enrolledIds = new Set(enrollments.map((e) => e.courseId._id))
  const available = published.filter((c) => !enrolledIds.has(c._id))
  const now = Date.now()

  const firstName = (user.name || 'there').split(' ')[0]
  const avgProgress = enrollments.length
    ? Math.round(
        enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
          enrollments.length
      )
    : 0

  return (
    <div className="space-y-12">
      {/* Greeting banner */}
      <section className="relative overflow-hidden rounded-3xl bg-accent-gradient p-6 text-white shadow-accent sm:p-8">
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 right-20 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Keep your streak going
          </span>
          <h1 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-white/85 sm:text-base">
            {enrollments.length > 0
              ? `You're enrolled in ${enrollments.length} course${enrollments.length === 1 ? '' : 's'} · ${avgProgress}% average progress.`
              : 'Pick a course below and start your learning journey today.'}
          </p>
        </div>
      </section>

      {/* Continue learning */}
      {enrollments.length > 0 && (
        <section>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand-accent" />
            <h2 className="font-heading text-xl font-bold text-brand-textPrimary">
              Continue Learning
            </h2>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((e) => {
              const c = e.courseId
              const expired = e.expiresAt && new Date(e.expiresAt).getTime() < now
              const progress = Math.min(100, Math.max(0, e.progress || 0))
              return (
                <div
                  key={e._id}
                  className="group flex flex-col rounded-2xl border border-brand-border bg-white p-3 shadow-card transition-all hover:-translate-y-1 hover:border-brand-accent/40 hover:shadow-cardHover"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-brand-accentLight/40">
                    <span
                      className={`absolute left-0 top-3 z-10 inline-flex items-center gap-1.5 rounded-r-md py-1 pl-3 pr-3.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-accent ${
                        expired ? 'bg-brand-textSecondary' : 'bg-accent-gradient'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      {expired ? 'Expired' : 'Online'}
                    </span>
                    {c.thumbnail ? (
                      <img
                        src={c.thumbnail}
                        alt={c.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-brand-accent/40">
                        <GraduationCap className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col px-1 pt-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-base font-semibold text-brand-textPrimary">
                        {c.title}
                      </h3>
                      {c.language && (
                        <span className="shrink-0 rounded-full bg-brand-surface px-2.5 py-1 text-xs font-medium text-brand-textSecondary">
                          {c.language}
                        </span>
                      )}
                    </div>
                    {c.instructorName && (
                      <p className="mt-1 flex items-center gap-2 text-sm text-brand-textSecondary">
                        <GraduationCap className="h-4 w-4 shrink-0 text-brand-accent" />
                        {c.instructorName}
                      </p>
                    )}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs font-medium text-brand-textSecondary">
                        <span>Progress</span>
                        <span className="text-brand-accent">{progress}%</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-brand-accentLight">
                        <div
                          className="h-full rounded-full bg-accent-gradient transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-brand-textSecondary">
                      <Clock className="h-3.5 w-3.5" />
                      {e.expiresAt
                        ? `${expired ? 'Expired on' : 'Valid until'} ${formatDate(e.expiresAt)}`
                        : 'Lifetime access'}
                    </p>
                    <div className="mt-4 flex-1" />
                    {expired ? (
                      <Link
                        href={`/courses/${c.slug}`}
                        className="flex items-center justify-center gap-2 rounded-xl bg-accent-gradient px-4 py-2.5 text-center text-sm font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5"
                      >
                        <RotateCcw className="h-4 w-4" /> Renew
                      </Link>
                    ) : (
                      <Link
                        href={`/learn/${c._id}`}
                        className="flex items-center justify-center gap-2 rounded-xl bg-accent-gradient px-4 py-2.5 text-center text-sm font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        {progress > 0 ? 'Resume' : 'Start'}
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Available courses */}
      <section>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-brand-accent" />
          <h2 className="font-heading text-xl font-bold text-brand-textPrimary">
            {enrollments.length > 0 ? 'Explore More Courses' : 'Available Courses'}
          </h2>
        </div>
        <p className="mt-1 text-sm text-brand-textSecondary">
          {available.length} course{available.length === 1 ? '' : 's'} available
        </p>

        {available.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-brand-border bg-white p-12 text-center">
            <p className="text-brand-textSecondary">
              {published.length === 0
                ? 'No courses have been launched yet. Please check back soon.'
                : 'You’re enrolled in all available courses 🎉'}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((c) => (
              <CourseCard key={c._id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
