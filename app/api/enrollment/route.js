import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Course from '@/models/Course'
import { getCurrentUser } from '@/lib/session'

// Enroll the current user into a course (free enrollment for now).
export async function POST(req) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in first' }, { status: 401 })

  const { courseId } = await req.json()
  if (!courseId || !mongoose.isValidObjectId(courseId)) {
    return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 })
  }

  await dbConnect()
  const course = await Course.findById(courseId).lean()
  if (!course || course.status !== 'published') {
    return NextResponse.json({ error: 'Course not available' }, { status: 404 })
  }

  // Calculate expiration date based on course's expirationDays
  // If expirationDays is null, it means lifetime access (no expiration)
  let expiresAt = null
  if (course.expirationDays !== null && course.expirationDays !== undefined) {
    expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + course.expirationDays)
  }

  // Idempotent: reuse the existing enrollment if one exists.
  const enrollment = await Enrollment.findOneAndUpdate(
    { userId: user._id, courseId },
    {
      $setOnInsert: {
        userId: user._id,
        courseId,
        status: 'active',
        expiresAt,
      },
    },
    { new: true, upsert: true }
  ).lean()

  return NextResponse.json({
    ok: true,
    enrollmentId: enrollment._id.toString(),
    expiresAt: enrollment.expiresAt,
  })
}
