import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Section from '@/models/Section'
import Lesson from '@/models/Lesson'
import { getAdminSession } from '@/lib/admin'

export async function DELETE(_req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  // Cascade: remove the section and all its lessons.
  await Promise.all([
    Section.findByIdAndDelete(params.id),
    Lesson.deleteMany({ sectionId: params.id }),
  ])

  return NextResponse.json({ ok: true })
}
