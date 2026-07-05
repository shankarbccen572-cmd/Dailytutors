import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Enrollment from '@/models/Enrollment'
import { getSuperAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'

const ROLES = ['student', 'faculty', 'admin']

export async function PATCH(req, { params }) {
  const session = await getSuperAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { role } = await req.json()
  if (!ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  await dbConnect()
  const updated = await User.findByIdAndUpdate(
    params.id,
    { $set: { role } },
    { new: true }
  ).lean()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(serialize(updated))
}

export async function DELETE(_req, { params }) {
  const session = await getSuperAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Don't allow deleting your own account.
  if (session.user?.id === params.id) {
    return NextResponse.json(
      { error: 'You cannot delete your own account' },
      { status: 400 }
    )
  }

  await dbConnect()
  // Cascade: remove the user and their enrollments.
  await Promise.all([
    User.findByIdAndDelete(params.id),
    Enrollment.deleteMany({ userId: params.id }),
  ])

  return NextResponse.json({ ok: true })
}
