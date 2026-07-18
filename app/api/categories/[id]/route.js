import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Category from '@/models/Category'
import Course from '@/models/Course'
import { getSuperAdminSession } from '@/lib/admin'
import { serialize, slugify } from '@/lib/utils'

// PATCH /api/categories/:id — rename / reorder / (de)activate. Super-admin only.
export async function PATCH(req, { params }) {
  const session = await getSuperAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json().catch(() => ({}))
  const update = {}
  if (typeof body.name === 'string' && body.name.trim()) update.name = body.name.trim()
  if (typeof body.slug === 'string' && body.slug.trim()) update.slug = slugify(body.slug)
  if (body.kind === 'school' || body.kind === 'exam') update.kind = body.kind
  if (typeof body.order === 'number') update.order = body.order
  if (typeof body.active === 'boolean') update.active = body.active

  const updated = await Category.findByIdAndUpdate(params.id, { $set: update }, { new: true }).lean()
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Keep denormalized course.category names in sync on rename.
  if (update.name) {
    await Course.updateMany({ categoryId: params.id }, { $set: { category: update.name } })
  }
  return NextResponse.json(serialize(updated))
}

// DELETE /api/categories/:id — blocked while any course still references it.
export async function DELETE(_req, { params }) {
  const session = await getSuperAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const inUse = await Course.countDocuments({ categoryId: params.id })
  if (inUse > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${inUse} course(s) still use this category. Reassign them first.` },
      { status: 409 }
    )
  }
  const deleted = await Category.findByIdAndDelete(params.id).lean()
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
