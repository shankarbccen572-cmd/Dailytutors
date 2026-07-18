import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BankQuestion from '@/models/BankQuestion'
import BankSubject from '@/models/BankSubject'
import BankTopic from '@/models/BankTopic'
import { getAdminSession } from '@/lib/admin'
import { normalizeBankQuestion } from '@/lib/bankQuestion'
import { parseUpload, rowToQuestionBody, buildTemplateCsv } from '@/lib/bulkQuestions'

export const dynamic = 'force-dynamic'

// GET → download the CSV template.
export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return new NextResponse(buildTemplateCsv(), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="question-bank-template.csv"',
    },
  })
}

// POST (multipart) → parse a CSV/Excel file and bulk-insert into the given
// chapter. Returns a per-row report so faculty can fix and re-upload rejects.
export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let form
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected a multipart file upload' }, { status: 400 })
  }

  const file = form.get('file')
  const subjectId = form.get('subjectId')
  const chapterId = form.get('chapterId')
  const topicId = form.get('topicId') || null
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!subjectId || !chapterId) {
    return NextResponse.json({ error: 'Select a subject and chapter first' }, { status: 400 })
  }

  await dbConnect()

  // Parse the file into row objects.
  let rows
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const text = buffer.toString('utf8')
    rows = parseUpload(file.name || 'upload.csv', buffer, text)
  } catch (err) {
    return NextResponse.json({ error: `Could not read file: ${err?.message || 'parse error'}` }, { status: 400 })
  }
  if (!rows.length) {
    return NextResponse.json({ error: 'No data rows found' }, { status: 400 })
  }

  // Context: subject's category (denormalized onto each question) + topic map.
  const subject = await BankSubject.findById(subjectId).select('categoryId').lean()
  const topics = await BankTopic.find({ chapterId }).select('title').lean()
  const topicByName = {}
  for (const t of topics) topicByName[t.title.toLowerCase()] = t._id
  const ctx = { subjectId, chapterId, topicId, topicByName }

  const toInsert = []
  const failed = []
  rows.forEach((row, i) => {
    const rowNum = i + 2 // +1 for header, +1 for 1-based
    const { body, error } = rowToQuestionBody(row, ctx)
    if (error) {
      failed.push({ row: rowNum, error })
      return
    }
    const { data, error: normError } = normalizeBankQuestion(body)
    if (normError) {
      failed.push({ row: rowNum, error: normError })
      return
    }
    toInsert.push({
      ...data,
      categoryId: subject?.categoryId || null,
      createdBy: session.user?.id || null,
    })
  })

  let inserted = 0
  if (toInsert.length) {
    const docs = await BankQuestion.insertMany(toInsert, { ordered: false })
    inserted = docs.length
  }

  return NextResponse.json({
    total: rows.length,
    inserted,
    failedCount: failed.length,
    failed: failed.slice(0, 50), // cap the report
  })
}
