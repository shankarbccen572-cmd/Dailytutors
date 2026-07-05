import Link from 'next/link'
import { redirect } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Lesson from '@/models/Lesson'
import QuizAttempt from '@/models/QuizAttempt'
import Quiz from '@/models/Quiz'
import { getCurrentUser } from '@/lib/session'
import { serialize } from '@/lib/utils'
import ProfileForm from '@/components/dashboard/ProfileForm'
import {
  Clock,
  CheckCircle2,
  Star,
  TrendingUp,
  Trophy,
  Award,
  Target,
  Flame,
  BookOpen,
  Zap,
  Lock,
  GraduationCap,
  Compass,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

// Parse "9min" / "12:30" / "1:05:00" style durations into minutes.
function durationToMinutes(d = '') {
  if (!d) return 0
  const min = d.match(/(\d+)\s*min/i)
  if (min) return Number(min[1])
  const parts = d.split(':').map(Number)
  if (parts.some(Number.isNaN)) return 0
  if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60
  if (parts.length === 2) return parts[0] + parts[1] / 60
  return Number(d) || 0
}

function starsFor(pct) {
  if (pct >= 90) return 3
  if (pct >= 70) return 2
  if (pct > 0) return 1
  return 0
}

function initials(name = '') {
  return (
    name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

export default async function ProfilePage() {
  const userDoc = await getCurrentUser()
  if (!userDoc) redirect('/login')
  const user = serialize(userDoc)

  await dbConnect()
  const [enrollRows, attemptRows] = await Promise.all([
    Enrollment.find({ userId: user._id }).populate('courseId').lean(),
    QuizAttempt.find({ userId: user._id }).lean(),
  ])
  const enrollments = serialize(enrollRows).filter((e) => e.courseId)

  // Lessons across enrolled courses (for completion + learning time).
  const courseIds = enrollments.map((e) => e.courseId._id)
  const lessonRows = courseIds.length
    ? await Lesson.find({ courseId: { $in: courseIds } })
        .select('duration courseId')
        .lean()
    : []
  const lessons = serialize(lessonRows)

  const lessonMinutes = {}
  const lessonsByCourse = {}
  for (const l of lessons) {
    lessonMinutes[l._id] = durationToMinutes(l.duration)
    lessonsByCourse[l.courseId] = (lessonsByCourse[l.courseId] || 0) + 1
  }

  // Completion + learning-time totals.
  let completedCount = 0
  let totalLessons = 0
  let learnedMinutes = 0
  const courseProgress = enrollments.map((e) => {
    const done = (e.completedLessons || []).map(String)
    completedCount += done.length
    const total = lessonsByCourse[e.courseId._id] || 0
    totalLessons += total
    for (const id of done) learnedMinutes += lessonMinutes[id] || 0
    const pct = total ? Math.round((done.length / total) * 100) : e.progress || 0
    return { title: e.courseId.title, slug: e.courseId.slug, id: e.courseId._id, done: done.length, total, pct }
  })

  const overallPct = courseProgress.length
    ? Math.round(courseProgress.reduce((s, c) => s + c.pct, 0) / courseProgress.length)
    : 0

  // Quiz performance — best attempt per quiz.
  const bestByQuiz = {}
  for (const a of attemptRows) {
    const key = String(a.quizId)
    const pct = a.percentage || 0
    if (!bestByQuiz[key] || pct > bestByQuiz[key].percentage) {
      bestByQuiz[key] = { percentage: pct, score: a.score || 0, total: a.total || 0, quizId: key }
    }
  }
  const bestAttempts = Object.values(bestByQuiz)
  const quizCount = bestAttempts.length
  const totalCorrect = bestAttempts.reduce((s, a) => s + a.score, 0)
  const totalStars = bestAttempts.reduce((s, a) => s + starsFor(a.percentage), 0)
  const avgScore = quizCount
    ? Math.round(bestAttempts.reduce((s, a) => s + a.percentage, 0) / quizCount)
    : 0

  // Quiz titles for the breakdown.
  const quizDocs = bestAttempts.length
    ? await Quiz.find({ _id: { $in: bestAttempts.map((a) => a.quizId) } })
        .select('title')
        .lean()
    : []
  const quizTitle = {}
  for (const q of serialize(quizDocs)) quizTitle[q._id] = q.title

  // Learning level — light gamification.
  const xp = completedCount * 10 + totalStars * 15 + quizCount * 5
  const level = Math.floor(xp / 100) + 1
  const xpIntoLevel = xp % 100

  const hours = Math.floor(learnedMinutes / 60)
  const mins = Math.round(learnedMinutes % 60)
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

  const stats = [
    { icon: Clock, label: 'Learning time', value: timeLabel, hint: 'from completed lessons' },
    { icon: TrendingUp, label: 'Avg. progress', value: `${overallPct}%`, hint: `${courseProgress.length} courses` },
    { icon: CheckCircle2, label: 'Lessons done', value: `${completedCount}/${totalLessons}`, hint: 'completed' },
    { icon: Star, label: 'Stars earned', value: totalStars, hint: `${quizCount} quizzes` },
  ]

  const achievements = [
    { icon: BookOpen, label: 'Enrolled', desc: 'Joined your first course', earned: enrollments.length >= 1 },
    { icon: Zap, label: 'First Steps', desc: 'Completed a lesson', earned: completedCount >= 1 },
    { icon: Flame, label: 'On a Roll', desc: 'Completed 10 lessons', earned: completedCount >= 10 },
    { icon: Target, label: 'Quiz Taker', desc: 'Attempted a quiz', earned: quizCount >= 1 },
    { icon: Award, label: 'Sharp Shooter', desc: 'Scored 90%+ on a quiz', earned: bestAttempts.some((a) => a.percentage >= 90) },
    { icon: Trophy, label: 'Champion', desc: 'Finished a full course', earned: courseProgress.some((c) => c.pct === 100) },
  ]
  const earnedCount = achievements.filter((a) => a.earned).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brand-textPrimary">Profile</h1>
        <p className="text-sm text-brand-textSecondary">
          Track your progress, earn stars, and keep your learning streak alive.
        </p>
      </div>

      {/* Hero / level card */}
      <section className="relative overflow-hidden rounded-3xl bg-accent-gradient p-6 text-white shadow-accent sm:p-8">
        <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/10" />
        <div className="absolute -bottom-14 right-24 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              initials(user.name)
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-2xl font-bold">{user.name || 'Learner'}</h2>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur">
                Level {level}
              </span>
            </div>
            <p className="text-sm text-white/85">{user.email}</p>
            <div className="mt-3 max-w-md">
              <div className="flex items-center justify-between text-xs font-medium text-white/90">
                <span>Level {level}</span>
                <span>{xpIntoLevel}/100 XP</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${xpIntoLevel}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accentLight text-brand-accent">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-heading text-2xl font-bold text-brand-textPrimary">{s.value}</p>
              <p className="text-sm font-medium text-brand-textPrimary">{s.label}</p>
              <p className="text-xs text-brand-textSecondary">{s.hint}</p>
            </div>
          )
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Course progress */}
        <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-card">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-brand-accent" />
            <h2 className="font-heading text-lg font-bold text-brand-textPrimary">Course progress</h2>
          </div>
          {courseProgress.length === 0 ? (
            <div className="mt-4 text-center">
              <p className="text-sm text-brand-textSecondary">You haven&apos;t enrolled in any course yet.</p>
              <Link
                href="/courses"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-4 py-2 text-sm font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5"
              >
                <Compass className="h-4 w-4" /> Browse courses
              </Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {courseProgress.map((c) => (
                <li key={c.id}>
                  <div className="flex items-center justify-between text-sm">
                    <Link href={`/learn/${c.id}`} className="font-medium text-brand-textPrimary hover:text-brand-accent">
                      {c.title}
                    </Link>
                    <span className="text-xs text-brand-textSecondary">
                      {c.done}/{c.total} · {c.pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-brand-accentLight">
                    <div className="h-full rounded-full bg-accent-gradient transition-all" style={{ width: `${c.pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quiz performance */}
        <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-card">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-brand-accent" />
            <h2 className="font-heading text-lg font-bold text-brand-textPrimary">Quiz performance</h2>
          </div>
          {quizCount === 0 ? (
            <p className="mt-4 text-sm text-brand-textSecondary">
              No quizzes attempted yet. Take a course quiz to start earning stars ⭐
            </p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-brand-surface p-3">
                  <p className="font-heading text-xl font-bold text-brand-textPrimary">{avgScore}%</p>
                  <p className="text-xs text-brand-textSecondary">Avg score</p>
                </div>
                <div className="rounded-xl bg-brand-surface p-3">
                  <p className="font-heading text-xl font-bold text-brand-textPrimary">{totalCorrect}</p>
                  <p className="text-xs text-brand-textSecondary">Correct</p>
                </div>
                <div className="rounded-xl bg-brand-surface p-3">
                  <p className="font-heading text-xl font-bold text-brand-accent">{totalStars}★</p>
                  <p className="text-xs text-brand-textSecondary">Stars</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {bestAttempts.map((a) => {
                  const stars = starsFor(a.percentage)
                  return (
                    <li key={a.quizId} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-brand-textPrimary">
                        {quizTitle[a.quizId] || 'Quiz'}
                      </span>
                      <span className="flex shrink-0 items-center gap-0.5">
                        {[1, 2, 3].map((n) => (
                          <Star
                            key={n}
                            className={`h-4 w-4 ${n <= stars ? 'fill-brand-warning text-brand-warning' : 'text-brand-border'}`}
                          />
                        ))}
                        <span className="ml-1 text-xs text-brand-textSecondary">{a.percentage}%</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </section>
      </div>

      {/* Achievements */}
      <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-brand-accent" />
            <h2 className="font-heading text-lg font-bold text-brand-textPrimary">Achievements</h2>
          </div>
          <span className="text-sm font-medium text-brand-textSecondary">
            {earnedCount}/{achievements.length} unlocked
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => {
            const Icon = a.earned ? a.icon : Lock
            return (
              <div
                key={a.label}
                className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${
                  a.earned
                    ? 'border-brand-accent/30 bg-brand-accentLight/40'
                    : 'border-brand-border bg-brand-surface opacity-70'
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    a.earned ? 'bg-accent-gradient text-white shadow-accent' : 'bg-brand-border/60 text-brand-textSecondary'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-textPrimary">{a.label}</p>
                  <p className="text-xs text-brand-textSecondary">{a.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Editable details */}
      <ProfileForm initialData={user} />
    </div>
  )
}
