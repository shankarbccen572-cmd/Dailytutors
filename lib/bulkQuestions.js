import * as XLSX from 'xlsx'

// Bulk-import support for the Question Bank. Parses CSV / Excel into rows and
// maps each row onto a question body for normalizeBankQuestion(). Complex types
// (assertion-reason, match-column, passage/case-study) are intentionally NOT
// supported via bulk upload — they need the manual editor — so the template
// covers the objective + short/long subjective types that map cleanly to rows.

export const BULK_TEMPLATE_HEADERS = [
  'type',
  'text',
  'option1',
  'option2',
  'option3',
  'option4',
  'correct',
  'difficulty',
  'marks',
  'time_seconds',
  'explanation',
  'tags',
  'language',
  'topic',
]

// A ready-to-fill CSV template (header + two example rows).
export function buildTemplateCsv() {
  const rows = [
    BULK_TEMPLATE_HEADERS,
    ['mcq', 'What is 2 + 2?', '3', '4', '5', '6', 'B', 'easy', '1', '30', 'Basic addition', 'arithmetic', '', ''],
    ['fill-blank', 'The capital of France is ____.', '', '', '', '', 'Paris', 'easy', '1', '30', '', 'geography', '', ''],
    ['truefalse', 'The sun rises in the east.', '', '', '', '', 'True', 'easy', '1', '20', '', 'science', '', ''],
  ]
  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n')
}

function csvCell(v) {
  const s = String(v ?? '')
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// Minimal RFC-4180-ish CSV parser (handles quoted fields, embedded commas,
// escaped quotes and CRLF/LF). No dependency.
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let i = 0
  let inQuotes = false
  const s = text.replace(/^﻿/, '') // strip BOM
  while (i < s.length) {
    const c = s[i]
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += c
      i++
      continue
    }
    if (c === '"') {
      inQuotes = true
      i++
    } else if (c === ',') {
      row.push(field)
      field = ''
      i++
    } else if (c === '\r') {
      i++
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i++
    } else {
      field += c
      i++
    }
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

// Convert a 2D array (header row + data rows) into keyed objects.
function toObjects(matrix) {
  if (!matrix.length) return []
  const headers = matrix[0].map((h) => String(h || '').trim().toLowerCase())
  return matrix
    .slice(1)
    .filter((r) => r.some((c) => String(c ?? '').trim() !== ''))
    .map((r) => {
      const o = {}
      headers.forEach((h, idx) => {
        o[h] = r[idx] !== undefined ? String(r[idx]).trim() : ''
      })
      return o
    })
}

// Parse an uploaded file (by name + bytes) into keyed row objects.
export function parseUpload(filename, buffer, text) {
  const lower = (filename || '').toLowerCase()
  if (lower.endsWith('.csv') || lower.endsWith('.txt')) {
    return toObjects(parseCsv(text))
  }
  // Excel (.xlsx / .xls) via SheetJS.
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: '' })
  return toObjects(matrix.map((r) => r.map((c) => String(c ?? ''))))
}

const LETTER_INDEX = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 }
const OPTION_TYPES = ['mcq', 'multiple', 'truefalse']
const TEXT_ANSWER_TYPES = ['fill-blank', 'one-word', 'numeric']
const SUBJECTIVE_TYPES = ['subjective-short', 'subjective-long']
const BULK_TYPES = [...OPTION_TYPES, ...TEXT_ANSWER_TYPES, ...SUBJECTIVE_TYPES]

// Resolve a "correct" cell (e.g. "B", "A,C", "2", or "True") to the set of
// option indices that should be marked correct.
function correctIndices(correct, options) {
  const tokens = String(correct || '')
    .split(/[,;/]+/)
    .map((t) => t.trim())
    .filter(Boolean)
  const idx = new Set()
  for (const t of tokens) {
    const up = t.toUpperCase()
    if (up in LETTER_INDEX) idx.add(LETTER_INDEX[up])
    else if (/^\d+$/.test(t)) idx.add(Number(t) - 1)
    else {
      const found = options.findIndex((o) => o.toLowerCase() === t.toLowerCase())
      if (found >= 0) idx.add(found)
    }
  }
  return idx
}

// Map one row object onto a question body for normalizeBankQuestion(). Returns
// { body } or { error }. `ctx` supplies subjectId/chapterId + a topic name map.
export function rowToQuestionBody(row, ctx) {
  const type = String(row.type || '').trim().toLowerCase()
  if (!BULK_TYPES.includes(type)) {
    return { error: `Unsupported type "${row.type}" (use: ${BULK_TYPES.join(', ')})` }
  }

  const topicId =
    (row.topic && ctx.topicByName?.[row.topic.toLowerCase()]) || ctx.topicId || null

  const body = {
    subjectId: ctx.subjectId,
    chapterId: ctx.chapterId,
    topicId,
    type,
    text: row.text || '',
    difficulty: ['easy', 'medium', 'hard'].includes((row.difficulty || '').toLowerCase())
      ? row.difficulty.toLowerCase()
      : 'medium',
    marks: Number(row.marks) > 0 ? Number(row.marks) : 1,
    expectedTimeSeconds: Number(row.time_seconds) > 0 ? Number(row.time_seconds) : 60,
    explanation: row.explanation || '',
    tags: String(row.tags || '')
      .split(/[,;]+/)
      .map((t) => t.trim())
      .filter(Boolean),
    language: row.language || '',
    status: 'published',
  }

  if (OPTION_TYPES.includes(type)) {
    let optionTexts
    if (type === 'truefalse') optionTexts = ['True', 'False']
    else optionTexts = [row.option1, row.option2, row.option3, row.option4, row.option5, row.option6]
      .map((o) => String(o || '').trim())
      .filter(Boolean)
    const correct = correctIndices(row.correct, optionTexts)
    body.options = optionTexts.map((t, i) => ({ text: t, isCorrect: correct.has(i) }))
  } else if (TEXT_ANSWER_TYPES.includes(type)) {
    body.correctAnswer = row.correct || ''
  } else if (SUBJECTIVE_TYPES.includes(type)) {
    body.modelAnswer = row.correct || row.explanation || ''
  }

  return { body }
}
