// Validates / normalizes and grades chapter-wise "important questions".
// Three NEET-style types share a single-correct `options` array.

const TYPES = ['assertion-reason', 'statement-based', 'match-column']

// The fixed A / B / C / D choices for an Assertion-Reason question.
export const AR_OPTIONS = [
  'Both A and R are true, and R is the correct explanation of A.',
  'Both A and R are true, but R is not the correct explanation of A.',
  'A is true, but R is false.',
  'A is false, but R is true.',
]

// A,B,C… for the left column, 1,2,3… for the right column.
const LEFT_LABELS = 'ABCDEFGH'.split('')
const rightLabel = (i: number) => String(i + 1)

function cleanOptions(raw: any): { text: string; isCorrect: boolean }[] {
  const opts = Array.isArray(raw) ? raw : []
  return opts
    .map((o) => ({
      text: (o?.text || '').toString().trim(),
      isCorrect: Boolean(o?.isCorrect),
    }))
    .filter((o) => o.text)
}

function validateSingleCorrect(options: { isCorrect: boolean }[]) {
  if (options.length < 2) return 'At least two answer options are required'
  const correct = options.filter((o) => o.isCorrect).length
  if (correct === 0) return 'Mark the correct option'
  if (correct > 1) return 'Only one option can be correct'
  return ''
}

export function normalizeImportantQuestion(body: any = {}) {
  const type = TYPES.includes(body.type) ? body.type : null
  if (!type) return { error: 'Unknown question type' }
  if (!body.chapterId || !body.lessonId) {
    return { error: 'Pick a chapter and lesson' }
  }

  const data: any = {
    type,
    chapterId: body.chapterId,
    lessonId: body.lessonId,
    explanation: (body.explanation || '').toString().trim(),
    marks: Number(body.marks) > 0 ? Number(body.marks) : 1,
    options: [],
    assertion: '',
    reason: '',
    intro: '',
    statements: [],
    columnITitle: '',
    columnIITitle: '',
    leftItems: [],
    rightItems: [],
  }

  if (type === 'assertion-reason') {
    const assertion = (body.assertion || '').toString().trim()
    const reason = (body.reason || '').toString().trim()
    if (!assertion) return { error: 'Assertion is required' }
    if (!reason) return { error: 'Reason is required' }
    const correct = Number(body.correctOption)
    if (!(correct >= 0 && correct <= 3)) {
      return { error: 'Choose which A/B/C/D option is correct' }
    }
    data.assertion = assertion
    data.reason = reason
    data.options = AR_OPTIONS.map((text, i) => ({
      text,
      isCorrect: i === correct,
    }))
    return { data }
  }

  if (type === 'statement-based') {
    const statements = (Array.isArray(body.statements) ? body.statements : [])
      .map((s: any) => ({ text: (s?.text || '').toString().trim() }))
      .filter((s: any) => s.text)
    if (statements.length < 2) {
      return { error: 'Add at least two statements' }
    }
    const options = cleanOptions(body.options)
    const err = validateSingleCorrect(options)
    if (err) return { error: err }
    data.intro = (body.intro || '').toString().trim()
    data.statements = statements
    data.options = options
    return { data }
  }

  // match-column
  const leftItems = (Array.isArray(body.leftItems) ? body.leftItems : [])
    .map((it: any) => (it?.text || '').toString().trim())
    .filter(Boolean)
    .map((text: string, i: number) => ({ label: LEFT_LABELS[i] || `${i + 1}`, text }))
  const rightItems = (Array.isArray(body.rightItems) ? body.rightItems : [])
    .map((it: any) => (it?.text || '').toString().trim())
    .filter(Boolean)
    .map((text: string, i: number) => ({ label: rightLabel(i), text }))
  if (leftItems.length < 2 || rightItems.length < 2) {
    return { error: 'Add at least two rows in each column' }
  }
  const options = cleanOptions(body.options)
  const err = validateSingleCorrect(options)
  if (err) return { error: err }
  data.columnITitle = (body.columnITitle || '').toString().trim()
  data.columnIITitle = (body.columnIITitle || '').toString().trim()
  data.leftItems = leftItems
  data.rightItems = rightItems
  data.options = options
  return { data }
}

// Strip the answer key (which option is correct + explanation) before sending
// to students.
export function safeImportantQuestion(q: any) {
  return {
    _id: q._id,
    chapterId: typeof q.chapterId === 'string' ? q.chapterId : q.chapterId?.toString(),
    lessonId: typeof q.lessonId === 'string' ? q.lessonId : q.lessonId?.toString(),
    type: q.type,
    marks: q.marks,
    order: q.order,
    assertion: q.assertion,
    reason: q.reason,
    intro: q.intro,
    statements: (q.statements || []).map((s: any) => ({ text: s.text })),
    columnITitle: q.columnITitle,
    columnIITitle: q.columnIITitle,
    leftItems: (q.leftItems || []).map((it: any) => ({ label: it.label, text: it.text })),
    rightItems: (q.rightItems || []).map((it: any) => ({ label: it.label, text: it.text })),
    options: (q.options || []).map((o: any) => ({ text: o.text })),
  }
}

// Grade a single answer (the selected option index). Returns the correct index
// too so the client can highlight it after submission.
export function gradeImportant(question: any, answer: any) {
  const marks = question.marks || 1
  const correctIndex = (question.options || []).findIndex((o: any) => o.isCorrect)
  const selected = Number(answer)
  const correct = Number.isInteger(selected) && selected === correctIndex
  return { correct, correctIndex, awarded: correct ? marks : 0 }
}
