/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import { serialize } from '@/lib/utils'
import { getAdminSession } from '@/lib/admin'
import { redirect } from 'next/navigation'
import DeleteCourseButton from '@/components/admin/DeleteCourseButton'
import { Plus, Pencil, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_STYLES = {
  draft: 'bg-brand-border/60 text-brand-textSecondary',
  published: 'bg-brand-success/15 text-brand-success',
  archived: 'bg-brand-warning/20 text-brand-warning',
}

const STATUS_DOT = {
  draft: 'bg-brand-textSecondary',
  published: 'bg-brand-success',
  archived: 'bg-brand-warning',
}

function price(course) {
  if (!course.originalPrice && !course.discountPrice) return 'Free'
  if (course.discountPrice && course.discountPrice < course.originalPrice) {
    return `₹${course.discountPrice}`
  }
  return `₹${course.originalPrice || course.discountPrice}`
}

export default async function AdminCoursesPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  await dbConnect()
  
  // Super-admin sees all courses; co-admin sees courses only if they have 'courses' permission
  let courses = []
  if (session.user.role === 'co-admin') {
    if (!session.user.permissions.includes('courses')) {
      // Co-admin doesn't have courses permission, show empty
      courses = []
    } else {
      courses = serialize(await Course.find().sort({ createdAt: -1 }).lean())
    }
  } else {
    // Super-admin sees all courses
    courses = serialize(await Course.find().sort({ createdAt: -1 }).lean())
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-textPrimary">
            Courses
          </h1>
          <p className="text-sm text-brand-textSecondary">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} total
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> New course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-border bg-white p-12 text-center shadow-card">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accentLight text-brand-accent">
            <BookOpen className="h-6 w-6" />
          </span>
          <p className="mt-4 text-brand-textSecondary">No courses yet.</p>
          <Link
            href="/admin/courses/new"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" /> Create your first course
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-border bg-white shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-brand-border bg-brand-surface text-xs uppercase tracking-wide text-brand-textSecondary">
              <tr>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr
                  key={c._id}
                  className="border-b border-brand-border transition-colors last:border-0 hover:bg-brand-surface"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-brand-border bg-brand-accentLight/40 text-brand-accent/50">
                        {c.thumbnail ? (
                          <img src={c.thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <BookOpen className="h-4 w-4" />
                        )}
                      </div>
                      <span className="font-medium text-brand-textPrimary">{c.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-textSecondary">
                    {c.category || '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-textPrimary">
                    {price(c)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        STATUS_STYLES[c.status] || STATUS_STYLES.draft
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          STATUS_DOT[c.status] || STATUS_DOT.draft
                        }`}
                      />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/courses/${c._id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-3 py-1.5 text-sm font-medium text-brand-textPrimary transition-colors hover:bg-brand-accentLight"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <DeleteCourseButton id={c._id} title={c.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
