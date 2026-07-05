import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/session'
import { serialize } from '@/lib/utils'

// name / email / photo come from Google and are not editable here.
const EDITABLE = ['phone', 'city', 'examTarget']

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(serialize(user))
}

export async function PUT(req) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const body = await req.json()

  const update = {}
  for (const f of EDITABLE) {
    if (body[f] !== undefined) update[f] = body[f]
  }

  const updated = await User.findByIdAndUpdate(
    user._id,
    { $set: update },
    { new: true }
  ).lean()

  return NextResponse.json(serialize(updated))
}
