import Link from 'next/link'
import { redirect } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import Quiz from '@/models/Quiz'
import Enrollment from '@/models/Enrollment'
import { getAdminSession } from '@/lib/admin'
import {
  Users,
  BookOpen,
  CheckCircle2,
  FileText,
  ClipboardList,
  ArrowRight,
  Plus,
  Settings2,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminOverview() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const isAdmin = session?.user?.role === 'admin'
  const permissions = session?.user?.permissions || []

  // Check if co-admin has 'overview' permission
  if (!isAdmin && !permissions.includes('overview')) {
    redirect('/admin/courses')
  }

  await dbConnect()
  const [students, courses, publishedCourses, quizzes, enrollments] =
    await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Course.countDocuments({ status: 'published' }),
      Quiz.countDocuments(),
      Enrollment.countDocuments(),
    ])

  const stats = [
    { label: 'Students', value: students, icon: Users, href: isAdmin || permissions.includes('users') ? '/admin/users' : null },
    { label: 'Courses', value: courses, icon: BookOpen, href: permissions.includes('courses') ? '/admin/courses' : null },
    {
      label: 'Published',
      value: publishedCourses,
      icon: CheckCircle2,
      href: permissions.includes('courses') ? '/admin/courses' : null,
    },
    { label: 'Quizzes', value: quizzes, icon: FileText, href: permissions.includes('courses') ? '/admin/courses' : null },
    {
      label: 'Enrollments',
      value: enrollments,
      icon: ClipboardList,
      href: isAdmin || permissions.includes('enrollments') ? '/admin/enrollments' : null,
    },
  ]

  const sections = [
    {
      href: '/admin/courses',
      title: 'Courses',
      desc: 'Create and edit courses, curriculum, and tests.',
      icon: BookOpen,
      show: true,
    },
    {
      href: '/admin/site-settings',
      title: 'Landing page',
      desc: 'Update the homepage hero, navigation, stats, and footer text.',
      icon: Settings2,
      show: true,
    },
    {
      href: '/admin/users',
      title: 'Users',
      desc: 'Manage students, faculty and admins, and their roles.',
      icon: Users,
      show: isAdmin,
    },
    {
      href: '/admin/enrollments',
      title: 'Enrollments',
      desc: 'See and manage who is enrolled in which course.',
      icon: ClipboardList,
      show: isAdmin,
    },
  ]

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-textPrimary">
            Dashboard
          </h1>
          <p className="text-sm text-brand-textSecondary">
            Welcome back, {session?.user?.name || 'admin'}.
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> New course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon
          const card = (
            <div className="h-full rounded-2xl border border-brand-border bg-white p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accentLight text-brand-accent">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-heading text-3xl font-bold text-brand-textPrimary">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-brand-textSecondary">{s.label}</p>
            </div>
          )
          return s.href ? (
            <Link key={s.label} href={s.href}>
              {card}
            </Link>
          ) : (
            <div key={s.label}>{card}</div>
          )
        })}
      </div>

      {/* Manage sections */}
      <div>
        <h2 className="mb-3 font-heading text-lg font-bold text-brand-textPrimary">
          Manage
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections
            .filter((s) => s.show)
            .map((s) => {
              const Icon = s.icon
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group rounded-2xl border border-brand-border bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-accentLight text-brand-accent transition-colors group-hover:bg-accent-gradient group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowRight className="h-5 w-5 text-brand-textSecondary transition-transform group-hover:translate-x-1 group-hover:text-brand-accent" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-brand-textPrimary">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm text-brand-textSecondary">{s.desc}</p>
                </Link>
              )
            })}
        </div>
      </div>
    </div>
  )
}
