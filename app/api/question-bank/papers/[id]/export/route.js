import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import QuestionPaper from '@/models/QuestionPaper'
import BankQuestion from '@/models/BankQuestion'
import { getAdminSession } from '@/lib/admin'
import { buildDocx, buildPdf } from '@/lib/paperExport'

// GET /api/question-bank/papers/:id/export?format=pdf|docx&answerKey=true|false
// Streams a generated question paper as a real .pdf or .docx download. The
// answerKey flag switches between "Question Paper Only" and "With Answer Key".
export async function GET(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const paper = await QuestionPaper.findById(params.id).lean()
  if (!paper) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') === 'docx' ? 'docx' : 'pdf'
  const includeAnswerKey = searchParams.get('answerKey') === 'true'

  // Resolve every referenced question into a lookup map (full docs).
  const allIds = (paper.sections || []).flatMap((s) => (s.questionIds || []).map(String))
  const qmap = {}
  if (allIds.length) {
    const qs = await BankQuestion.find({ _id: { $in: allIds } }).lean()
    for (const q of qs) qmap[String(q._id)] = q
  }

  const safeName =
    (paper.title || 'question-paper').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') ||
    'question-paper'
  const suffix = includeAnswerKey ? '_with_answer_key' : ''

  try {
    if (format === 'docx') {
      const buffer = await buildDocx(paper, qmap, { includeAnswerKey })
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${safeName}${suffix}.docx"`,
        },
      })
    }
    const bytes = await buildPdf(paper, qmap, { includeAnswerKey })
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}${suffix}.pdf"`,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Export failed: ${err?.message || 'unknown error'}` },
      { status: 500 }
    )
  }
}
