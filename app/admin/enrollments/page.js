import { redirect } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import User from '@/models/User'
import Course from '@/models/Course'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'
import EnrollmentsManager from '@/components/admin/EnrollmentsManager'

export const dynamic = 'force-dynamic'

export default async function AdminEnrollmentsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin')

  const isAdmin = session.user?.role === 'admin'
  const permissions = session.user?.permissions || []

  // Only super-admin or co-admin with 'enrollments' permission can access
  if (!isAdmin && !permissions.includes('enrollments')) {
    redirect('/admin')
  }

  await dbConnect()
  const [enrollmentDocs, userDocs, courseDocs] = await Promise.all([
    Enrollment.find()
      .populate('userId', 'name email')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .lean(),
    User.find().sort({ name: 1 }).select('name email').lean(),
    Course.find().sort({ title: 1 }).select('title status').lean(),
  ])

  // Drop enrollments whose user or course was deleted.
  const enrollments = serialize(enrollmentDocs).filter(
    (e) => e.userId && e.courseId
  )
  const users = serialize(userDocs)
  const courses = serialize(courseDocs)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-textPrimary">
          Enrollments
        </h1>
        <p className="text-sm text-brand-textSecondary">
          {enrollments.length} active {enrollments.length === 1 ? 'enrollment' : 'enrollments'}
        </p>
      </div>

      <EnrollmentsManager
        initialEnrollments={enrollments}
        users={users}
        courses={courses}
      />
    </div>
  )
}
