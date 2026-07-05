import { redirect } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Enrollment from '@/models/Enrollment'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'
import UsersTable from '@/components/admin/UsersTable'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin')

  const isAdmin = session.user?.role === 'admin'
  const permissions = session.user?.permissions || []

  // Only super-admin or co-admin with 'users' permission can access
  if (!isAdmin && !permissions.includes('users')) {
    redirect('/admin')
  }

  await dbConnect()
  const userDocs = await User.find().sort({ createdAt: -1 }).lean()

  // Enrollment count per user.
  const counts = await Enrollment.aggregate([
    { $group: { _id: '$userId', n: { $sum: 1 } } },
  ])
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.n]))

  const users = serialize(userDocs).map((u) => ({
    ...u,
    enrollments: countMap[u._id] || 0,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-textPrimary">
          Users
        </h1>
        <p className="text-sm text-brand-textSecondary">
          {users.length} {users.length === 1 ? 'user' : 'users'} total
        </p>
      </div>

      <UsersTable initialUsers={users} currentUserId={session.user?.id} />
    </div>
  )
}
