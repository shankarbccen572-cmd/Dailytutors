import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import Category from '@/models/Category'
import { getAdminSession } from '@/lib/admin'
import { getCurrentUser } from '@/lib/session'
import { slugify, serialize, pickCourse } from '@/lib/utils'

// Validate an incoming categoryId against the DB and return the resolved
// canonical category doc, or null. Centralizes the mandatory-category rule.
async function resolveCategory(categoryId) {
  if (!categoryId) return null
  try {
    return await Category.findOne({ _id: categoryId, active: true }).lean()
  } catch {
    return null // invalid ObjectId cast, etc.
  }
}

export async function GET(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()

  // Super-admin sees all courses; co-admin sees courses only if they have 'courses' permission
  const query = {}
  if (session.user.role === 'co-admin') {
    if (!session.user.permissions.includes('courses')) {
      return NextResponse.json({ error: 'You do not have permission to view courses' }, { status: 403 })
    }
  }

  // Optional category filter (?categoryId=... or legacy ?category=name).
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('categoryId')
  const categoryName = searchParams.get('category')
  if (categoryId) query.categoryId = categoryId
  else if (categoryName) query.category = categoryName

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

  // Category is mandatory on creation and must be a real, active category.
  const category = await resolveCategory(body.categoryId)
  if (!category) {
    return NextResponse.json({ error: 'A valid category is required' }, { status: 400 })
  }

  // Build a unique slug from the title.
  const base = slugify(body.slug || body.title) || 'course'
  let slug = base
  let i = 2
  while (await Course.exists({ slug })) {
    slug = `${base}-${i++}`
  }

  // Denormalize the category name from the authoritative record (never trust
  // the client-sent name).
  const course = await Course.create({
    ...pickCourse(body),
    categoryId: category._id,
    category: category.name,
    slug,
  })
  return NextResponse.json(serialize(course.toObject()), { status: 201 })
}
