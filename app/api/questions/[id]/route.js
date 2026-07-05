import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Question from '@/models/Question'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'
import { normalizeQuestion } from '@/lib/question'

export async function PATCH(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()

  const { data, error } = normalizeQuestion(body)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const updated = await Question.findByIdAndUpdate(
    params.id,
    { $set: data },
    { new: true }
  ).lean()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(serialize(updated))
}

export async function DELETE(_req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  await Question.findByIdAndDelete(params.id)
  return NextResponse.json({ ok: true })
}
