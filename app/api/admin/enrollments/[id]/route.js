import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { getSuperAdminSession } from '@/lib/admin'

export async function DELETE(_req, { params }) {
  const session = await getSuperAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  await Enrollment.findByIdAndDelete(params.id)
  return NextResponse.json({ ok: true })
}
