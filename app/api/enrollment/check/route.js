import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { getCurrentUser } from '@/lib/session'

const NOT_ENROLLED = { enrolled: false, expired: false, expiresAt: null }

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')

  if (!courseId || !mongoose.isValidObjectId(courseId)) {
    return NextResponse.json(NOT_ENROLLED)
  }

  const user = await getCurrentUser()
  if (!user) return NextResponse.json(NOT_ENROLLED)

  await dbConnect()
  const enrollment = await Enrollment.findOne({
    userId: user._id,
    courseId,
  }).lean()

  if (!enrollment) return NextResponse.json(NOT_ENROLLED)

  const expired = enrollment.expiresAt
    ? new Date(enrollment.expiresAt) < new Date()
    : false

  return NextResponse.json({
    enrolled: true,
    expired,
    expiresAt: enrollment.expiresAt || null,
  })
}
