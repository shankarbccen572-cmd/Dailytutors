import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BankSubject from '@/models/BankSubject'
import { getAdminSession } from '@/lib/admin'
import { serialize } from '@/lib/utils'

// List all subjects in the faculty question bank.
export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const subjects = await BankSubject.find().sort({ order: 1, createdAt: 1 }).lean()
  return NextResponse.json(serialize(subjects))
}

export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()
  const name = (body.name || '').toString().trim()
  if (!name) return NextResponse.json({ error: 'Subject name is required' }, { status: 400 })

  const order = await BankSubject.countDocuments()
  const subject = await BankSubject.create({
    name,
    board: (body.board || '').toString().trim(),
    grade: (body.grade || '').toString().trim(),
    exams: Array.isArray(body.exams)
      ? body.exams.map((e) => e.toString().trim()).filter(Boolean)
      : [],
    order,
  })
  return NextResponse.json(serialize(subject.toObject()), { status: 201 })
}
