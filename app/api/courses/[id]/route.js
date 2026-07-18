import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import Category from '@/models/Category'
import Section from '@/models/Section'
import Lesson from '@/models/Lesson'
import Quiz from '@/models/Quiz'
import Question from '@/models/Question'
import IQChapter from '@/models/IQChapter'
import IQLesson from '@/models/IQLesson'
import ImportantQuestion from '@/models/ImportantQuestion'
import { getAdminSession } from '@/lib/admin'
import { serialize, pickCourse } from '@/lib/utils'

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function GET(_req, { params }) {
  const session = await getAdminSession()
  if (!session) return forbidden()

  await dbConnect()
  const course = await Course.findById(params.id).lean()
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sections = await Section.find({ courseId: params.id })
    .sort({ order: 1, createdAt: 1 })
    .lean()
  const lessons = await Lesson.find({ courseId: params.id })
    .sort({ order: 1, createdAt: 1 })
    .lean()

  return NextResponse.json(serialize({ course, sections, lessons }))
}

export async function PUT(req, { params }) {
  const session = await getAdminSession()
  if (!session) return forbidden()

  await dbConnect()
  const course = await Course.findById(params.id).lean()
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Co-admin must have 'courses' permission to edit courses
  if (session.user.role === 'co-admin') {
    if (!session.user.permissions.includes('courses')) {
      return forbidden()
    }
  }

  const body = await req.json()
  const update = pickCourse(body)

  // Category can be edited later, but only to a valid, active category. If a
  // categoryId is supplied it must resolve; the denormalized name is set from
  // the authoritative record. If omitted, the existing category is preserved.
  if (body.categoryId !== undefined) {
    let category = null
    try {
      category = await Category.findOne({ _id: body.categoryId, active: true }).lean()
    } catch {
      category = null
    }
    if (!category) {
      return NextResponse.json({ error: 'A valid category is required' }, { status: 400 })
    }
    update.categoryId = category._id
    update.category = category.name
  }

  const updated = await Course.findByIdAndUpdate(
    params.id,
    { $set: update },
    { new: true }
  ).lean()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(serialize(updated))
}

export async function DELETE(_req, { params }) {
  const session = await getAdminSession()
  if (!session) return forbidden()

  await dbConnect()
  const course = await Course.findById(params.id).lean()
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Co-admin must have 'courses' permission to delete courses
  if (session.user.role === 'co-admin') {
    if (!session.user.permissions.includes('courses')) {
      return forbidden()
    }
  }

  // Cascade: remove the course and all its sections, lessons, quizzes
  // and questions.
  await Promise.all([
    Course.findByIdAndDelete(params.id),
    Section.deleteMany({ courseId: params.id }),
    Lesson.deleteMany({ courseId: params.id }),
    Quiz.deleteMany({ courseId: params.id }),
    Question.deleteMany({ courseId: params.id }),
    IQChapter.deleteMany({ courseId: params.id }),
    IQLesson.deleteMany({ courseId: params.id }),
    ImportantQuestion.deleteMany({ courseId: params.id }),
  ])

  return NextResponse.json({ ok: true })
}
