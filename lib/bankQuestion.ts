// Validate / normalize faculty Question-Bank entries before saving. This is a
// staff-only reservoir, so there is no student-facing "safe" projection here —
// the full document (including the answer key) is only ever read by faculty.

const TYPES = [
  'mcq',
  'multiple',
  'truefalse',
  'fill-blank',
  'one-word',
  'numeric',
  'assertion-reason',
  'match-column',
  'case-study',
  'passage',
  'picture-based',
  'map-based',
  'subjective-short',
  'subjective-long',
]

const DIFFICULTIES = ['easy', 'medium', 'hard']
const SOURCES = [
  'ncert-textbook',
  'ncert-exemplar',
  'pyq',
  'faculty-created',
  'teacher-contributed',
]

// Types that must resolve to a right answer (auto-gradable in a paper/test).
const OPTION_TYPES = ['mcq', 'multiple', 'truefalse', 'assertion-reason', 'match-column']
const TEXT_ANSWER_TYPES = ['fill-blank', 'one-word', 'numeric']
const SUBJECTIVE_TYPES = ['subjective-short', 'subjective-long', 'case-study', 'passage']

const LEFT_LABELS = 'ABCDEFGH'.split('')
const rightLabel = (i: number) => String(i + 1)

// The fixed A/B/C/D choices for an Assertion-Reason question.
export const AR_OPTIONS = [
  'Both A and R are true, and R is the correct explanation of A.',
  'Both A and R are true, but R is not the correct explanation of A.',
  'A is true, but R is false.',
  'A is false, but R is true.',
]

function cleanOptions(raw: any): { text: string; isCorrect: boolean }[] {
  const opts = Array.isArray(raw) ? raw : []
  return opts
    .map((o) => ({
      text: (o?.text || '').toString().trim(),
      isCorrect: Boolean(o?.isCorrect),
    }))
    .filter((o) => o.text)
}

// NCERT-textbook questions are the only ones in the free tier; everything else
// is part of the paid "All Questions" tier.
export function tierForSource(source: string) {
  return source === 'ncert-textbook' ? 'free' : 'all'
}

export function normalizeBankQuestion(body: any = {}) {
  const type = TYPES.includes(body.type) ? body.type : null
  if (!type) return { error: 'Unknown question type' }
  if (!body.subjectId || !body.chapterId) {
    return { error: 'Pick a subject and chapter' }
  }

  const source = SOURCES.includes(body.source) ? body.source : 'faculty-created'
  const text = (body.text || '').toString().trim()
  if (!text && type !== 'assertion-reason') {
    return { error: 'Question text is required' }
  }

  const data: any = {
    subjectId: body.subjectId,
    chapterId: body.chapterId,
    topicId: body.topicId || null,
    exams: Array.isArray(body.exams)
      ? body.exams.map((e: any) => e.toString().trim()).filter(Boolean)
      : [],
    type,
    difficulty: DIFFICULTIES.includes(body.difficulty) ? body.difficulty : 'medium',
    source,
    accessTier: tierForSource(source),
    marks: Number(body.marks) > 0 ? Number(body.marks) : 1,
    expectedTimeSeconds:
      Number(body.expectedTimeSeconds) > 0 ? Number(body.expectedTimeSeconds) : 60,
    text,
    imageUrl: (body.imageUrl || '').toString().trim(),
    options: [],
    correctAnswer: (body.correctAnswer || '').toString().trim(),
    explanation: (body.explanation || '').toString().trim(),
    modelAnswer: (body.modelAnswer || '').toString().trim(),
    assertion: '',
    reason: '',
    intro: (body.intro || '').toString().trim(),
    statements: [],
    columnITitle: '',
    columnIITitle: '',
    leftItems: [],
    rightItems: [],
    year: Number(body.year) > 0 ? Number(body.year) : null,
    examName: (body.examName || '').toString().trim(),
    tags: Array.isArray(body.tags)
      ? body.tags.map((t: any) => t.toString().trim()).filter(Boolean)
      : [],
    status: ['draft', 'review', 'published'].includes(body.status)
      ? body.status
      : 'draft',
  }

  // --- Per-type content + answer-key validation ---

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
    data.text = text || `Assertion (A): ${assertion} Reason (R): ${reason}`
    data.options = AR_OPTIONS.map((t, i) => ({ text: t, isCorrect: i === correct }))
    return { data }
  }

  if (type === 'match-column') {
    const leftItems = (Array.isArray(body.leftItems) ? body.leftItems : [])
      .map((it: any) => (it?.text || '').toString().trim())
      .filter(Boolean)
      .map((t: string, i: number) => ({ label: LEFT_LABELS[i] || `${i + 1}`, text: t }))
    const rightItems = (Array.isArray(body.rightItems) ? body.rightItems : [])
      .map((it: any) => (it?.text || '').toString().trim())
      .filter(Boolean)
      .map((t: string, i: number) => ({ label: rightLabel(i), text: t }))
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

  if (OPTION_TYPES.includes(type)) {
    const options = cleanOptions(body.options)
    const err =
      type === 'multiple'
        ? validateHasCorrect(options)
        : validateSingleCorrect(options)
    if (err) return { error: err }
    data.options = options
    return { data }
  }

  if (TEXT_ANSWER_TYPES.includes(type)) {
    if (!data.correctAnswer) return { error: 'Provide the correct answer' }
    return { data }
  }

  // statement-based content can accompany passage / case-study types.
  if (SUBJECTIVE_TYPES.includes(type)) {
    data.statements = (Array.isArray(body.statements) ? body.statements : [])
      .map((s: any) => ({ text: (s?.text || '').toString().trim() }))
      .filter((s: any) => s.text)
    // Subjective questions carry a model answer for the solutions PDF, not a key.
    return { data }
  }

  // picture-based / map-based: an image plus a stem; grading is manual unless
  // options were supplied, in which case treat them as single-correct.
  if (body.options) {
    const options = cleanOptions(body.options)
    if (options.length) {
      const err = validateSingleCorrect(options)
      if (err) return { error: err }
      data.options = options
    }
  }
  return { data }
}

function validateSingleCorrect(options: { isCorrect: boolean }[]) {
  if (options.length < 2) return 'At least two answer options are required'
  const correct = options.filter((o) => o.isCorrect).length
  if (correct === 0) return 'Mark the correct option'
  if (correct > 1) return 'Only one option can be correct'
  return ''
}

function validateHasCorrect(options: { isCorrect: boolean }[]) {
  if (options.length < 2) return 'At least two answer options are required'
  if (!options.some((o) => o.isCorrect)) return 'Mark at least one correct option'
  return ''
}

// Whitelist for filter query params used by the selection engine / listing.
export function pickBankFilter(query: Record<string, any> = {}) {
  const out: any = {}
  if (query.subjectId) out.subjectId = query.subjectId
  if (query.chapterId) out.chapterId = query.chapterId
  if (query.topicId) out.topicId = query.topicId
  if (query.type) out.type = query.type
  if (query.difficulty) out.difficulty = query.difficulty
  if (query.source) out.source = query.source
  if (query.accessTier) out.accessTier = query.accessTier
  if (query.status) out.status = query.status
  if (query.exam) out.exams = query.exam
  return out
}
