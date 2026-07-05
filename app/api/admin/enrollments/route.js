import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { getSuperAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'

// Admin manually enrolls a user into a course.
export async function POST(req) {
  const session = await getSuperAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, courseId } = await req.json()
  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(courseId)
  ) {
    return NextResponse.json({ error: 'Invalid user or course' }, { status: 400 })
  }

  await dbConnect()
  const existing = await Enrollment.findOne({ userId, courseId }).lean()
  if (existing) {
    return NextResponse.json({ error: 'Already enrolled' }, { status: 409 })
  }

  const enrollment = await Enrollment.create({ userId, courseId, status: 'active' })
  const populated = await Enrollment.findById(enrollment._id)
    .populate('userId', 'name email')
    .populate('courseId', 'title')
    .lean()

  return NextResponse.json(serialize(populated), { status: 201 })
}
