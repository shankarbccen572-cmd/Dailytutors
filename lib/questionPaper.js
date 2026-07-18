import BankQuestion from '@/models/BankQuestion'
import Category from '@/models/Category'
import BankSubject from '@/models/BankSubject'
import { computeTotals } from '@/lib/paperExport'

// Normalize an incoming paper body into persistable fields + recompute totals
// from the referenced questions. Shared by create (POST) and edit (PATCH).
export async function normalizePaper(body) {
  const title = (body.title || '').toString().trim()
  if (!title) return { error: 'Paper title is required' }

  const sections = (Array.isArray(body.sections) ? body.sections : []).map((s, i) => ({
    title: (s?.title || `Section ${String.fromCharCode(65 + i)}`).toString().trim(),
    instructions: (s?.instructions || '').toString().trim(),
    order: typeof s?.order === 'number' ? s.order : i,
    questionIds: (Array.isArray(s?.questionIds) ? s.questionIds : []).filter(Boolean),
  }))

  // Resolve denormalized category/subject names.
  let category = (body.category || '').toString().trim()
  let subject = (body.subject || '').toString().trim()
  if (body.categoryId) {
    const c = await Category.findById(body.categoryId).select('name').lean().catch(() => null)
    if (c) category = c.name
  }
  if (body.subjectId) {
    const s = await BankSubject.findById(body.subjectId).select('name').lean().catch(() => null)
    if (s) subject = s.name
  }

  // Recompute totals from the live questions referenced by the sections.
  const allIds = sections.flatMap((s) => s.questionIds.map(String))
  const qmap = {}
  if (allIds.length) {
    const qs = await BankQuestion.find({ _id: { $in: allIds } })
      .select('marks expectedTimeSeconds')
      .lean()
    for (const q of qs) qmap[String(q._id)] = q
  }
  const totals = computeTotals(sections, qmap)

  const data = {
    title,
    institution: (body.institution || 'Daily Tutors').toString().trim(),
    logoUrl: (body.logoUrl || '').toString().trim(),
    examName: (body.examName || '').toString().trim(),
    teacher: (body.teacher || '').toString().trim(),
    categoryId: body.categoryId || null,
    category,
    subjectId: body.subjectId || null,
    subject,
    timeMinutes: Number(body.timeMinutes) > 0 ? Number(body.timeMinutes) : totals.estMinutes || 180,
    totalMarks: totals.totalMarks,
    totalQuestions: totals.totalQuestions,
    instructions: (body.instructions || '').toString().trim(),
    headerText: (body.headerText || '').toString().trim(),
    footerText: (body.footerText || '').toString().trim(),
    includeAnswerKey: Boolean(body.includeAnswerKey),
    sections,
    status: body.status === 'published' ? 'published' : 'draft',
  }
  return { data }
}
