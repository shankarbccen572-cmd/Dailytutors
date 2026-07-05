import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import { getAdminSession } from '@/lib/admin'
import { getCurrentUser } from '@/lib/session'
import { slugify, serialize, pickCourse } from '@/lib/utils'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  
  // Super-admin sees all courses; co-admin sees courses only if they have 'courses' permission
  let query = {}
  if (session.user.role === 'co-admin') {
    if (!session.user.permissions.includes('courses')) {
      return NextResponse.json({ error: 'You do not have permission to view courses' }, { status: 403 })
    }
  }
  
  const courses = await Course.find(query).sort({ createdAt: -1 }).lean()
  return NextResponse.json(serialize(courses))
}

export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  // Co-admin must have 'courses' permission to create courses
  if (session.user.role === 'co-admin') {
    if (!session.user.permissions.includes('courses')) {
      return NextResponse.json(
        { error: 'You do not have permission to create courses' },
        { status: 403 }
      )
    }
  }

  // Build a unique slug from the title.
  const base = slugify(body.slug || body.title) || 'course'
  let slug = base
  let i = 2
  while (await Course.exists({ slug })) {
    slug = `${base}-${i++}`
  }

  const course = await Course.create({ ...pickCourse(body), slug })
  return NextResponse.json(serialize(course.toObject()), { status: 201 })
}
