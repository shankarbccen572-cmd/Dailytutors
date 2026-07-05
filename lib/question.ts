// Validates and normalizes an incoming question payload by its type.
// Returns { data } on success or { error } with a message on failure.
const TYPES = ['mcq', 'multiple', 'truefalse', 'numeric']

export function normalizeQuestion(body: any = {}) {
  const type = TYPES.includes(body.type) ? body.type : 'mcq'
  const text = (body.text || '').trim()
  if (!text) return { error: 'Question text is required' }

  const data = {
    type,
    text,
    explanation: (body.explanation || '').trim(),
    marks: Number(body.marks) > 0 ? Number(body.marks) : 1,
    options: [],
    correctAnswer: '',
  }

  if (type === 'numeric') {
    const answer = (body.correctAnswer ?? '').toString().trim()
    if (!answer) return { error: 'A correct answer is required' }
    data.correctAnswer = answer
    return { data }
  }

  // Option-based: mcq, multiple, truefalse
  let options = Array.isArray(body.options) ? body.options : []
  options = options
    .map((o) => ({ text: (o.text || '').trim(), isCorrect: Boolean(o.isCorrect) }))
    .filter((o) => o.text)

  if (type === 'truefalse') {
    // Force exactly True / False; keep whichever was marked correct.
    const correct = options.find((o) => o.isCorrect)?.text
    options = [
      { text: 'True', isCorrect: correct === 'True' },
      { text: 'False', isCorrect: correct === 'False' },
    ]
  }

  if (options.length < 2) {
    return { error: 'At least two options are required' }
  }

  const correctCount = options.filter((o) => o.isCorrect).length
  if (correctCount === 0) {
    return { error: 'Mark at least one option as correct' }
  }
  if (type === 'mcq' && correctCount > 1) {
    return { error: 'Single-choice questions can have only one correct option' }
  }

  data.options = options
  return { data }
}

// Returns a copy of a question safe to send to students — strips which option
// is correct, the numeric answer, and the explanation.
export function safeQuestion(q) {
  return {
    _id: q._id,
    quizId: q.quizId,
    type: q.type,
    text: q.text,
    marks: q.marks,
    order: q.order,
    options: (q.options || []).map((o) => ({ text: o.text })),
  }
}

function norm(v) {
  return (v ?? '').toString().trim().toLowerCase()
}

// Grades a single student answer against a question.
// `answer` shape: numeric -> string; option-based -> array of selected indices.
// Returns { correct, awarded }.
export function gradeAnswer(question, answer) {
  const marks = question.marks || 1

  if (question.type === 'numeric') {
    const a = norm(answer)
    const correctStr = norm(question.correctAnswer)
    // Compare numerically when both are numbers, else compare as text.
    const an = Number(a)
    const cn = Number(correctStr)
    const correct =
      a !== '' &&
      (a === correctStr ||
        (!Number.isNaN(an) && !Number.isNaN(cn) && an === cn))
    return { correct, awarded: correct ? marks : 0 }
  }

  // Option-based: answer is an array of selected option indices.
  const selected = Array.isArray(answer) ? answer.map(Number) : []
  const correctIdx = (question.options || [])
    .map((o, i) => (o.isCorrect ? i : -1))
    .filter((i) => i >= 0)

  const sameSet =
    selected.length === correctIdx.length &&
    correctIdx.every((i) => selected.includes(i))

  return { correct: sameSet, awarded: sameSet ? marks : 0 }
}
