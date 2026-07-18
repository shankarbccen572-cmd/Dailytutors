import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Category from '@/models/Category'
import { getAdminSession, getSuperAdminSession } from '@/lib/admin'
import { getCurrentUser } from '@/lib/session'
import { serialize, slugify } from '@/lib/utils'

// GET /api/categories — the category taxonomy.
// Readable by any authenticated principal (staff via admin session, or a
// logged-in student), since it is non-sensitive reference data needed by both
// the admin course form and the student catalog filter. Never public.
export async function GET() {
  const staff = await getAdminSession()
  const user = staff ? null : await getCurrentUser()
  if (!staff && !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await dbConnect()
  const categories = await Category.find({ active: true })
    .sort({ order: 1, name: 1 })
    .lean()
  return NextResponse.json(serialize(categories))
}

// POST /api/categories — create a category. Super-admin only.
export async function POST(req) {
  const session = await getSuperAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json().catch(() => ({}))
  const name = (body.name || '').toString().trim()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const kind = body.kind === 'exam' ? 'exam' : 'school'
  const slug = slugify(body.slug || name)
  if (await Category.exists({ $or: [{ name }, { slug }] })) {
    return NextResponse.json({ error: 'A category with that name or slug already exists' }, { status: 409 })
  }

  const last = await Category.findOne().sort({ order: -1 }).lean()
  const category = await Category.create({
    name,
    slug,
    kind,
    order: typeof body.order === 'number' ? body.order : (last?.order || 0) + 1,
    active: body.active !== false,
  })
  return NextResponse.json(serialize(category.toObject()), { status: 201 })
}
