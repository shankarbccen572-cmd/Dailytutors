'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, Library, ChevronRight, Filter, Archive, RotateCcw, Upload, Download, FileText } from 'lucide-react'
import { AR_OPTIONS } from '@/lib/bankQuestion'
import RichText from '@/components/RichText'
import ImageUpload from '@/components/admin/ImageUpload'

const inputCls =
  'w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-accent'
const chipBtn =
  'inline-flex items-center gap-2 rounded-lg border border-brand-border px-3 py-1.5 text-sm font-medium text-brand-textPrimary transition-colors hover:bg-brand-accentLight'

const TYPES = [
  { val: 'mcq', label: 'MCQ (single correct)' },
  { val: 'multiple', label: 'Multiple correct' },
  { val: 'truefalse', label: 'True / False' },
  { val: 'fill-blank', label: 'Fill in the blank' },
  { val: 'one-word', label: 'One word' },
  { val: 'numeric', label: 'Numeric' },
  { val: 'assertion-reason', label: 'Assertion & Reason' },
  { val: 'match-column', label: 'Match the column' },
  { val: 'case-study', label: 'Case study' },
  { val: 'passage', label: 'Passage based' },
  { val: 'picture-based', label: 'Picture based' },
  { val: 'map-based', label: 'Map based' },
  { val: 'subjective-short', label: 'Subjective (short)' },
  { val: 'subjective-long', label: 'Subjective (long)' },
]
const DIFFICULTIES = ['easy', 'medium', 'hard']
const SOURCES = [
  { val: 'ncert-textbook', label: 'NCERT Textbook (free tier)' },
  { val: 'ncert-exemplar', label: 'NCERT Exemplar' },
  { val: 'pyq', label: "Previous Year's Paper" },
  { val: 'faculty-created', label: 'Faculty created' },
  { val: 'teacher-contributed', label: 'Teacher contributed' },
]

const OPTION_TYPES = ['mcq', 'multiple', 'truefalse']
const TEXT_ANSWER_TYPES = ['fill-blank', 'one-word', 'numeric']
const SUBJECTIVE_TYPES = ['subjective-short', 'subjective-long']
const IMAGE_TYPES = ['picture-based', 'map-based']
const PASSAGE_TYPES = ['case-study', 'passage']

async function api(url, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

function escapeHtml(text) {
  return text
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Short, plain-text preview of a question for compact list rows.
function plainPreview(q) {
  const raw = q?.text || q?.assertion || q?.intro || '(no text)'
  return String(raw)
    .replace(/!\[.*?\]\(.*?\)/g, '[image]')
    .replace(/[#*`_>~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140)
}

function renderQuestionHtml(q, index) {
  const questionNumber = index + 1
  const header = `<div class="paper-question"><span class="question-number">${questionNumber}.</span> ${escapeHtml(q.text || q.assertion || '')}`
  const marks = q.marks ? ` <span class="question-marks">(${q.marks} mark${q.marks === 1 ? '' : 's'})</span>` : ''

  let body = ''

  if (q.type === 'assertion-reason') {
    body += `<div class="paper-block"><strong>Assertion (A):</strong> ${escapeHtml(q.assertion)}</div>`
    body += `<div class="paper-block"><strong>Reason (R):</strong> ${escapeHtml(q.reason)}</div>`
  }

  if (q.type === 'match-column') {
    body += `<div class="paper-block"><strong>${escapeHtml(q.columnITitle || 'Column I')}</strong></div>`
    body += '<div class="paper-match-grid"><div>' + q.leftItems.map((item) => `<div>${escapeHtml(item.label)}. ${escapeHtml(item.text)}</div>`).join('') + '</div>'
    body += '<div>' + q.rightItems.map((item) => `<div>${escapeHtml(item.label)}. ${escapeHtml(item.text)}</div>`).join('') + '</div></div>'
  }

  if (q.intro) {
    body += `<div class="paper-block paper-intro">${escapeHtml(q.intro)}</div>`
  }

  if (q.imageUrl) {
    body += `<div class="paper-image"><img src="${escapeHtml(q.imageUrl)}" alt="Question image" /></div>`
  }

  if (q.options?.length) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    body += '<ol class="paper-options" type="a">'
    body += q.options.map((opt, idx) => `<li>${escapeHtml(opt.text)}</li>`).join('')
    body += '</ol>'
  } else if (['fill-blank', 'one-word', 'numeric', 'subjective-short', 'subjective-long', 'case-study', 'passage', 'picture-based', 'map-based'].includes(q.type)) {
    body += '<div class="paper-space">_______________________________</div>'
    if (q.type === 'case-study' || q.type === 'passage') {
      body += `<div class="paper-space">_______________________________</div>`
    }
  }

  return `${header}${marks}</div>${body}`
}

function buildPaperHtml({ title, institution, teacher, instructions, footer, questions, includeAnswerKey }) {
  const paperContent = questions
    .map((q, idx) => renderQuestionHtml(q, idx))
    .join('<div class="page-break"></div>')

  const keyContent = includeAnswerKey
    ? `<div class="paper-section"><h2>Answer Key</h2>${questions
        .map((q, idx) => {
          let answer = ''
          if (q.type === 'assertion-reason') {
            answer = q.options?.find((opt) => opt.isCorrect)
              ? q.options.find((opt) => opt.isCorrect).text
              : ''
          } else if (q.options?.length) {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            answer = q.options
              .map((opt, i) => (opt.isCorrect ? letters[i] : null))
              .filter(Boolean)
              .join(', ') || ''
          } else {
            answer = escapeHtml(q.correctAnswer || q.modelAnswer || '')
          }
          return `<div class="answer-line"><strong>${idx + 1}.</strong> ${answer}</div>`
        })
        .join('')}</div>`
    : ''

  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #111; }
          .paper-header { text-align: center; margin-bottom: 24px; }
          .paper-header h1 { margin: 0; font-size: 28px; }
          .paper-header .paper-instructions { margin-top: 12px; color: #4b5563; font-size: 14px; }
          .paper-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #d1d5db; color: #6b7280; font-size: 12px; }
          .paper-question { margin-top: 20px; }
          .question-number { font-weight: 700; }
          .question-marks { color: #6b7280; font-size: 13px; }
          .paper-block { margin-top: 12px; }
          .paper-intro { background: #f8fafc; padding: 12px; border-left: 4px solid #2563eb; }
          .paper-options { margin: 12px 0 0 20px; }
          .paper-image { margin-top: 14px; }
          .paper-image img { max-width: 100%; height: auto; border: 1px solid #d1d5db; border-radius: 8px; }
          .paper-space { margin: 14px 0; min-height: 24px; }
          .paper-match-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
          .paper-section { margin-top: 36px; }
          .paper-section h2 { margin-bottom: 12px; font-size: 18px; }
          .answer-line { margin-top: 6px; }
          .page-break { page-break-after: always; }
          @media print {
            body { margin: 24px; }
            .page-break { display: block; page-break-after: always; }
            .paper-footer { position: fixed; bottom: 0; left: 0; right: 0; }
          }
        </style>
      </head>
      <body>
        <div class="paper-header">
          ${institution ? `<div class="paper-meta">${escapeHtml(institution)}</div>` : ''}
          <h1>${escapeHtml(title)}</h1>
          ${teacher ? `<div class="paper-meta">Teacher: ${escapeHtml(teacher)}</div>` : ''}
          ${instructions ? `<div class="paper-instructions">${escapeHtml(instructions)}</div>` : ''}
        </div>
        ${paperContent}
        ${footer ? `<div class="paper-footer">${escapeHtml(footer)}</div>` : ''}
        ${keyContent}
      </body>
    </html>
  `
}

function saveWordFile(html, filename) {
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------- taxonomy col

function TaxonomyColumn({
  categories,
  selectedCategory,
  setSelectedCategory,
  subjects,
  setSubjects,
  selectedSubject,
  setSelectedSubject,
  chapters,
  selectedChapter,
  setSelectedChapter,
  topics,
  selectedTopic,
  setSelectedTopic,
  reloadChapters,
  reloadTopics,
}) {
  const [newSubject, setNewSubject] = useState('')
  const [newChapter, setNewChapter] = useState('')
  const [newTopic, setNewTopic] = useState('')

  // Subjects belong to the selected category. Legacy (uncategorized) subjects
  // only appear when no category filter is active.
  const visibleSubjects = selectedCategory
    ? subjects.filter((s) => (s.categoryId || '') === selectedCategory)
    : subjects

  async function addSubject() {
    const name = newSubject.trim()
    if (!name) return
    if (!selectedCategory) {
      alert('Pick a category first — every subject belongs to a category.')
      return
    }
    const s = await api('/api/question-bank/subjects', 'POST', {
      name,
      categoryId: selectedCategory,
    })
    setSubjects((p) => [...p, s])
    setNewSubject('')
    setSelectedSubject(s)
  }
  async function delSubject(id) {
    if (!confirm('Delete this subject and all its chapters, topics & questions?')) return
    await api(`/api/question-bank/subjects/${id}`, 'DELETE')
    setSubjects((p) => p.filter((s) => s._id !== id))
    if (selectedSubject?._id === id) setSelectedSubject(null)
  }
  async function addChapter() {
    const title = newChapter.trim()
    if (!title || !selectedSubject) return
    await api('/api/question-bank/chapters', 'POST', {
      subjectId: selectedSubject._id,
      title,
    })
    setNewChapter('')
    reloadChapters()
  }
  async function delChapter(id) {
    if (!confirm('Delete this chapter and its topics & questions?')) return
    await api(`/api/question-bank/chapters/${id}`, 'DELETE')
    if (selectedChapter?._id === id) setSelectedChapter(null)
    reloadChapters()
  }
  async function addTopic() {
    const title = newTopic.trim()
    if (!title || !selectedChapter) return
    await api('/api/question-bank/topics', 'POST', {
      subjectId: selectedSubject._id,
      chapterId: selectedChapter._id,
      title,
    })
    setNewTopic('')
    reloadTopics()
  }
  async function delTopic(id) {
    if (!confirm('Delete this topic? Its questions stay in the chapter.')) return
    await api(`/api/question-bank/topics/${id}`, 'DELETE')
    if (selectedTopic?._id === id) setSelectedTopic(null)
    reloadTopics()
  }

  const rowCls = (active) =>
    `group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
      active
        ? 'bg-accent-gradient text-white'
        : 'text-brand-textPrimary hover:bg-brand-accentLight'
    }`

  return (
    <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card">
      {/* Category */}
      <label className="block text-xs font-semibold uppercase tracking-wide text-brand-textSecondary">
        Category / Standard
        <select
          className={`${inputCls} mt-1.5 font-normal normal-case tracking-normal text-brand-textPrimary`}
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value)
            setSelectedSubject(null)
            setSelectedChapter(null)
            setSelectedTopic(null)
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {categories.length === 0 && (
        <p className="mt-2 text-xs text-brand-accent">
          No categories found. Run the category seed/migration script.
        </p>
      )}

      {/* Subjects */}
      <div className="mt-4 border-t border-brand-border pt-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-textSecondary">
          Subjects
        </h3>
        <div className="space-y-1">
          {visibleSubjects.map((s) => (
            <div
              key={s._id}
              className={rowCls(selectedSubject?._id === s._id)}
              onClick={() => {
                setSelectedSubject(s)
                setSelectedChapter(null)
                setSelectedTopic(null)
              }}
            >
              <span className="truncate">{s.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  delSubject(s._id)
                }}
                className="opacity-0 transition-opacity group-hover:opacity-70 hover:!opacity-100"
                title="Delete subject"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {visibleSubjects.length === 0 && (
            <p className="px-1 py-2 text-xs text-brand-textSecondary">
              {selectedCategory ? 'No subjects in this category yet.' : 'No subjects yet.'}
            </p>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            className={inputCls}
            placeholder="New subject"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSubject()}
          />
          <button onClick={addSubject} className={chipBtn}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chapters */}
      {selectedSubject && (
        <div className="mt-4 border-t border-brand-border pt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-textSecondary">
            Chapters · {selectedSubject.name}
          </h3>
          <div className="space-y-1">
            {chapters.map((c) => (
              <div
                key={c._id}
                className={rowCls(selectedChapter?._id === c._id)}
                onClick={() => {
                  setSelectedChapter(c)
                  setSelectedTopic(null)
                }}
              >
                <span className="truncate">{c.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    delChapter(c._id)
                  }}
                  className="opacity-0 transition-opacity group-hover:opacity-70 hover:!opacity-100"
                  title="Delete chapter"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {chapters.length === 0 && (
              <p className="px-1 py-2 text-xs text-brand-textSecondary">No chapters yet.</p>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className={inputCls}
              placeholder="New chapter"
              value={newChapter}
              onChange={(e) => setNewChapter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addChapter()}
            />
            <button onClick={addChapter} className={chipBtn}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Topics */}
      {selectedChapter && (
        <div className="mt-4 border-t border-brand-border pt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-textSecondary">
            Topics <span className="font-normal normal-case text-brand-textSecondary">(optional)</span> · {selectedChapter.title}
          </h3>
          <div className="space-y-1">
            <div
              className={rowCls(!selectedTopic)}
              onClick={() => setSelectedTopic(null)}
            >
              <span className="truncate italic">All / chapter-level</span>
            </div>
            {topics.map((t) => (
              <div
                key={t._id}
                className={rowCls(selectedTopic?._id === t._id)}
                onClick={() => setSelectedTopic(t)}
              >
                <span className="truncate">{t.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    delTopic(t._id)
                  }}
                  className="opacity-0 transition-opacity group-hover:opacity-70 hover:!opacity-100"
                  title="Delete topic"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className={inputCls}
              placeholder="New topic"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTopic()}
            />
            <button onClick={addTopic} className={chipBtn}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- question form

function QuestionForm({ subjectId, chapterId, topicId, onSave, onCancel }) {
  const [type, setType] = useState('mcq')
  const [difficulty, setDifficulty] = useState('medium')
  const [source, setSource] = useState('faculty-created')
  const [marks, setMarks] = useState(1)
  const [text, setText] = useState('')
  const [explanation, setExplanation] = useState('')
  const [exams, setExams] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
  ])
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [modelAnswer, setModelAnswer] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [intro, setIntro] = useState('')

  // assertion-reason
  const [assertion, setAssertion] = useState('')
  const [reason, setReason] = useState('')
  const [arCorrect, setArCorrect] = useState(0)

  // match-column
  const [columnITitle, setColumnITitle] = useState('')
  const [columnIITitle, setColumnIITitle] = useState('')
  const [leftItems, setLeftItems] = useState(['', ''])
  const [rightItems, setRightItems] = useState(['', ''])

  // Preset True/False options when that type is picked.
  function changeType(next) {
    setType(next)
    if (next === 'truefalse') {
      setOptions([
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ])
    } else if (OPTION_TYPES.includes(next) && options.length < 2) {
      setOptions([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ])
    }
  }

  function setOption(i, patch) {
    setOptions((p) => p.map((o, idx) => (idx === i ? { ...o, ...patch } : o)))
  }
  function markSingle(i) {
    setOptions((p) => p.map((o, idx) => ({ ...o, isCorrect: idx === i })))
  }
  function toggleMulti(i) {
    setOptions((p) => p.map((o, idx) => (idx === i ? { ...o, isCorrect: !o.isCorrect } : o)))
  }
  const listSet = (setter, i, v) => setter((p) => p.map((x, idx) => (idx === i ? v : x)))
  const listAdd = (setter) => setter((p) => [...p, ''])
  const listRemove = (setter, i, min) =>
    setter((p) => (p.length <= min ? p : p.filter((_, idx) => idx !== i)))

  function buildPayload() {
    const base = {
      subjectId,
      chapterId,
      topicId: topicId || null,
      type,
      difficulty,
      source,
      marks,
      text,
      explanation,
      exams: exams.split(',').map((s) => s.trim()).filter(Boolean),
      tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
    }
    if (OPTION_TYPES.includes(type)) return { ...base, options }
    if (TEXT_ANSWER_TYPES.includes(type)) return { ...base, correctAnswer }
    if (type === 'assertion-reason') {
      return { ...base, assertion, reason, correctOption: arCorrect }
    }
    if (type === 'match-column') {
      return {
        ...base,
        columnITitle,
        columnIITitle,
        leftItems: leftItems.map((t) => ({ text: t })),
        rightItems: rightItems.map((t) => ({ text: t })),
        options,
      }
    }
    if (SUBJECTIVE_TYPES.includes(type)) return { ...base, modelAnswer }
    if (PASSAGE_TYPES.includes(type)) {
      return { ...base, intro, modelAnswer }
    }
    if (IMAGE_TYPES.includes(type)) return { ...base, imageUrl }
    return base
  }

  async function submit() {
    setError('')
    setSaving(true)
    try {
      await onSave(buildPayload())
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const multi = type === 'multiple'

  return (
    <div className="space-y-5 rounded-2xl border border-brand-border bg-white p-5 shadow-card">
      {/* Step 1 — question type */}
      <label className="block text-sm font-semibold text-brand-textPrimary">
        1. Question type
        <select className={`${inputCls} mt-1.5 font-normal`} value={type} onChange={(e) => changeType(e.target.value)}>
          {TYPES.map((t) => (
            <option key={t.val} value={t.val}>{t.label}</option>
          ))}
        </select>
      </label>

      {/* Step 2 — question text (not required for pure assertion-reason) */}
      {type !== 'assertion-reason' && (
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-brand-textPrimary">
            2. Question
            <textarea
              className={`${inputCls} mt-1.5 font-normal`}
              rows={3}
              placeholder="Type the question here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <p className="text-[11px] text-brand-textSecondary">
            Formatting: <b>**bold**</b>, <i>*italic*</i>, <code>`code`</code>, math <code>$x^2$</code> or <code>$$...$$</code>, image <code>![alt](url)</code>, and <code>| tables |</code>.
          </p>
          {text.trim() && (
            <div className="rounded-lg border border-brand-border bg-white p-3">
              <span className="mb-1 block text-[11px] uppercase tracking-wide text-brand-textSecondary">
                Preview
              </span>
              <RichText text={text} className="text-sm text-brand-textPrimary" />
            </div>
          )}
        </div>
      )}

      {/* per-type content */}
      {OPTION_TYPES.includes(type) && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-brand-textSecondary">
            Options {multi ? '(tick all correct)' : '(pick the correct one)'}
          </p>
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type={multi ? 'checkbox' : 'radio'}
                checked={o.isCorrect}
                onChange={() => (multi ? toggleMulti(i) : markSingle(i))}
              />
              <input
                className={inputCls}
                placeholder={`Option ${i + 1}`}
                value={o.text}
                disabled={type === 'truefalse'}
                onChange={(e) => setOption(i, { text: e.target.value })}
              />
              {type !== 'truefalse' && options.length > 2 && (
                <button onClick={() => setOptions((p) => p.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-4 w-4 text-brand-textSecondary" />
                </button>
              )}
            </div>
          ))}
          {type !== 'truefalse' && (
            <button
              onClick={() => setOptions((p) => [...p, { text: '', isCorrect: false }])}
              className="text-xs font-medium text-brand-accent"
            >
              + Add option
            </button>
          )}
        </div>
      )}

      {TEXT_ANSWER_TYPES.includes(type) && (
        <label className="block text-xs font-medium text-brand-textSecondary">
          Correct answer
          <input
            className={`${inputCls} mt-1`}
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
          />
        </label>
      )}

      {type === 'assertion-reason' && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-brand-textSecondary">
            Assertion (A)
            <textarea className={`${inputCls} mt-1`} rows={2} value={assertion} onChange={(e) => setAssertion(e.target.value)} />
          </label>
          <label className="block text-xs font-medium text-brand-textSecondary">
            Reason (R)
            <textarea className={`${inputCls} mt-1`} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
          <p className="text-xs font-medium text-brand-textSecondary">Correct option</p>
          {AR_OPTIONS.map((opt, i) => (
            <label key={i} className="flex items-start gap-2 text-sm text-brand-textPrimary">
              <input type="radio" checked={arCorrect === i} onChange={() => setArCorrect(i)} className="mt-1" />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}

      {type === 'match-column' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="Column I title" value={columnITitle} onChange={(e) => setColumnITitle(e.target.value)} />
            <input className={inputCls} placeholder="Column II title" value={columnIITitle} onChange={(e) => setColumnIITitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              {leftItems.map((it, i) => (
                <input key={i} className={inputCls} placeholder={`A${i + 1}`} value={it} onChange={(e) => listSet(setLeftItems, i, e.target.value)} />
              ))}
              <button onClick={() => listAdd(setLeftItems)} className="text-xs font-medium text-brand-accent">+ Row</button>
            </div>
            <div className="space-y-1">
              {rightItems.map((it, i) => (
                <input key={i} className={inputCls} placeholder={`${i + 1}`} value={it} onChange={(e) => listSet(setRightItems, i, e.target.value)} />
              ))}
              <button onClick={() => listAdd(setRightItems)} className="text-xs font-medium text-brand-accent">+ Row</button>
            </div>
          </div>
          <p className="text-xs font-medium text-brand-textSecondary">Answer options (pick the correct match set)</p>
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" checked={o.isCorrect} onChange={() => markSingle(i)} />
              <input className={inputCls} placeholder={`Option ${i + 1} e.g. A-2, B-1…`} value={o.text} onChange={(e) => setOption(i, { text: e.target.value })} />
            </div>
          ))}
          <button onClick={() => setOptions((p) => [...p, { text: '', isCorrect: false }])} className="text-xs font-medium text-brand-accent">+ Add option</button>
        </div>
      )}

      {PASSAGE_TYPES.includes(type) && (
        <label className="block text-xs font-medium text-brand-textSecondary">
          Passage / context
          <textarea className={`${inputCls} mt-1`} rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} />
        </label>
      )}

      {IMAGE_TYPES.includes(type) && (
        <div className="space-y-1">
          <span className="block text-xs font-medium text-brand-textSecondary">Question image</span>
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
        </div>
      )}

      {(SUBJECTIVE_TYPES.includes(type) || PASSAGE_TYPES.includes(type)) && (
        <label className="block text-xs font-medium text-brand-textSecondary">
          Model answer (for solutions)
          <textarea className={`${inputCls} mt-1`} rows={3} value={modelAnswer} onChange={(e) => setModelAnswer(e.target.value)} />
        </label>
      )}

      {/* Difficulty + marks — common, with sensible defaults */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-brand-textSecondary">
          Difficulty
          <select className={`${inputCls} mt-1`} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d} className="capitalize">{d}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-brand-textSecondary">
          Marks
          <input
            type="number"
            min="1"
            className={`${inputCls} mt-1`}
            value={marks}
            onChange={(e) => setMarks(Number(e.target.value))}
          />
        </label>
      </div>

      {/* Everything else tucked away so the common case stays simple */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-accent"
        >
          {showAdvanced ? '− Hide extra details' : '+ Add source, explanation, tags (optional)'}
        </button>
        {showAdvanced && (
          <div className="mt-3 space-y-3 rounded-xl border border-brand-border bg-brand-accentLight/10 p-3">
            <label className="block text-xs font-medium text-brand-textSecondary">
              Source
              <select className={`${inputCls} mt-1`} value={source} onChange={(e) => setSource(e.target.value)}>
                {SOURCES.map((s) => (
                  <option key={s.val} value={s.val}>{s.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-brand-textSecondary">
              Explanation
              <textarea className={`${inputCls} mt-1`} rows={2} value={explanation} onChange={(e) => setExplanation(e.target.value)} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-brand-textSecondary">
                Exams (comma separated)
                <input className={`${inputCls} mt-1`} placeholder="CBSE, JEE, NEET" value={exams} onChange={(e) => setExams(e.target.value)} />
              </label>
              <label className="text-xs font-medium text-brand-textSecondary">
                Tags (comma separated)
                <input className={`${inputCls} mt-1`} placeholder="kinematics, 2023" value={tags} onChange={(e) => setTags(e.target.value)} />
              </label>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-brand-accent">{error}</p>}
      <div className="flex gap-2 border-t border-brand-border pt-4">
        <button
          onClick={submit}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-accent disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save question'}
        </button>
        <button onClick={onCancel} className={chipBtn}>Cancel</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- main manager

export default function QuestionBankManager({
  initialSubjects,
  initialMode = 'upload',
  initialSubjectId,
  initialChapterId,
  initialTopicId,
}) {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [subjects, setSubjects] = useState(initialSubjects || [])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [chapters, setChapters] = useState([])
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [topics, setTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)

  const [questions, setQuestions] = useState([])
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ type: '', difficulty: '', source: '', marks: '' })
  const [showArchived, setShowArchived] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [mode] = useState(initialMode)
  const [paperTitle, setPaperTitle] = useState('Question Paper')
  const [paperInstructions, setPaperInstructions] = useState('Answer the following questions. All questions are compulsory unless stated otherwise.')
  const [paperFooter, setPaperFooter] = useState('Generated from the Daily Tutors question bank.')
  const [paperInstitution, setPaperInstitution] = useState('')
  const [paperTeacher, setPaperTeacher] = useState('')
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false)
  const [savedPaper, setSavedPaper] = useState(null)
  const [savingPaper, setSavingPaper] = useState(false)
  const [paperError, setPaperError] = useState('')
  const [showPaperDetails, setShowPaperDetails] = useState(false)
  // Questions the user has hand-picked into the paper (generate mode).
  const [paperQuestions, setPaperQuestions] = useState([])
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkResult, setBulkResult] = useState(null)
  const [bulkError, setBulkError] = useState('')

  const reloadChapters = useCallback(async () => {
    if (!selectedSubject) return setChapters([])
    const data = await api(`/api/question-bank/chapters?subjectId=${selectedSubject._id}`)
    setChapters(data)
  }, [selectedSubject])

  const reloadTopics = useCallback(async () => {
    if (!selectedChapter) return setTopics([])
    const data = await api(`/api/question-bank/topics?chapterId=${selectedChapter._id}`)
    setTopics(data)
  }, [selectedChapter])

  const reloadQuestions = useCallback(async () => {
    if (!selectedChapter) return setQuestions([])
    const qs = new URLSearchParams({ chapterId: selectedChapter._id })
    if (selectedTopic) qs.set('topicId', selectedTopic._id)
    if (filters.type) qs.set('type', filters.type)
    if (filters.difficulty) qs.set('difficulty', filters.difficulty)
    if (filters.source) qs.set('source', filters.source)
    if (filters.marks) qs.set('marks', filters.marks)
    if (showArchived) qs.set('includeArchived', 'true')
    const data = await api(`/api/question-bank/questions?${qs.toString()}`)
    setQuestions(data.questions)
    setTotal(data.total)
  }, [selectedChapter, selectedTopic, filters, showArchived])

  // Load the category taxonomy once.
  useEffect(() => {
    let alive = true
    api('/api/categories')
      .then((data) => {
        if (alive && Array.isArray(data)) setCategories(data)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    reloadChapters()
  }, [reloadChapters])
  useEffect(() => {
    reloadTopics()
  }, [reloadTopics])
  useEffect(() => {
    reloadQuestions()
  }, [reloadQuestions])

  useEffect(() => {
    if (initialSubjectId && subjects.length && !selectedSubject) {
      const subject = subjects.find((s) => s._id === initialSubjectId)
      if (subject) setSelectedSubject(subject)
    }
  }, [initialSubjectId, subjects, selectedSubject])

  useEffect(() => {
    if (initialChapterId && chapters.length && !selectedChapter) {
      const chapter = chapters.find((c) => c._id === initialChapterId)
      if (chapter) setSelectedChapter(chapter)
    }
  }, [initialChapterId, chapters, selectedChapter])

  useEffect(() => {
    if (initialTopicId && topics.length && !selectedTopic) {
      const topic = topics.find((t) => t._id === initialTopicId)
      if (topic) setSelectedTopic(topic)
    }
  }, [initialTopicId, topics, selectedTopic])

  const router = useRouter()

  const addQuestionHref = `/admin/question-bank/upload/add${selectedSubject ? `?subjectId=${selectedSubject._id}` : ''}${selectedChapter ? `&chapterId=${selectedChapter._id}` : ''}${selectedTopic ? `&topicId=${selectedTopic._id}` : ''}`

  const filteredQuestions = questions.filter((q) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    const text = `${q.text || q.assertion || ''} ${q.tags?.join(' ') || ''} ${q.examName || ''} ${q.year || ''}`.toLowerCase()
    return text.includes(term)
  })

  async function saveQuestion(payload) {
    const created = await api('/api/question-bank/questions', 'POST', payload)
    setQuestions((p) => [created, ...p])
    setTotal((t) => t + 1)
  }
  async function deleteQuestion(id) {
    if (!confirm('Delete this question?')) return
    await api(`/api/question-bank/questions/${id}`, 'DELETE')
    setQuestions((p) => p.filter((q) => q._id !== id))
    setTotal((t) => t - 1)
  }
  async function archiveQuestion(id) {
    const updated = await api(`/api/question-bank/questions/${id}`, 'PATCH', { action: 'archive' })
    // If we're not showing archived, drop it from view; otherwise update in place.
    setQuestions((p) =>
      showArchived ? p.map((q) => (q._id === id ? updated : q)) : p.filter((q) => q._id !== id)
    )
  }
  async function restoreQuestion(id) {
    const updated = await api(`/api/question-bank/questions/${id}`, 'PATCH', { action: 'restore' })
    setQuestions((p) => p.map((q) => (q._id === id ? updated : q)))
  }

  // Bulk-upload a CSV/Excel file into the selected chapter (+ optional topic).
  async function doBulkUpload(file) {
    if (!file || !selectedChapter || !selectedSubject) return
    setBulkBusy(true)
    setBulkError('')
    setBulkResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('subjectId', selectedSubject._id)
      fd.append('chapterId', selectedChapter._id)
      if (selectedTopic) fd.append('topicId', selectedTopic._id)
      const res = await fetch('/api/question-bank/questions/bulk', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setBulkResult(data)
      reloadQuestions()
    } catch (e) {
      setBulkError(e.message)
    } finally {
      setBulkBusy(false)
    }
  }

  // --- Paper basket (generate mode): search questions and add them one by one.
  const paperIds = new Set(paperQuestions.map((q) => q._id))
  function addToPaper(q) {
    setPaperQuestions((p) => (p.some((x) => x._id === q._id) ? p : [...p, q]))
  }
  function removeFromPaper(id) {
    setPaperQuestions((p) => p.filter((q) => q._id !== id))
  }
  function addAllVisibleToPaper() {
    setPaperQuestions((p) => {
      const have = new Set(p.map((q) => q._id))
      return [...p, ...filteredQuestions.filter((q) => !have.has(q._id))]
    })
  }
  const paperMarks = paperQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0)

  // Persist the hand-picked questions as a real QuestionPaper (one section).
  // Returns the created paper so the caller can offer downloads.
  async function savePaper(status) {
    setPaperError('')
    if (paperQuestions.length === 0) {
      setPaperError('Search for questions and add at least one to the paper.')
      return
    }
    setSavingPaper(true)
    try {
      const paper = await api('/api/question-bank/papers', 'POST', {
        title: paperTitle,
        institution: paperInstitution,
        teacher: paperTeacher,
        instructions: paperInstructions,
        footerText: paperFooter,
        includeAnswerKey,
        status,
        categoryId: selectedCategory || null,
        subjectId: selectedSubject?._id || null,
        sections: [
          {
            title: 'Section A',
            questionIds: paperQuestions.map((q) => q._id),
          },
        ],
      })
      setSavedPaper(paper)
    } catch (e) {
      setPaperError(e.message)
    } finally {
      setSavingPaper(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <TaxonomyColumn
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        subjects={subjects}
        setSubjects={setSubjects}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        chapters={chapters}
        selectedChapter={selectedChapter}
        setSelectedChapter={setSelectedChapter}
        topics={topics}
        selectedTopic={selectedTopic}
        setSelectedTopic={setSelectedTopic}
        reloadChapters={reloadChapters}
        reloadTopics={reloadTopics}
      />

      <div>
        {!selectedChapter ? (
          <div className="rounded-2xl border border-dashed border-brand-border bg-white p-12 text-center shadow-card">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accentLight text-brand-accent">
              <Library className="h-6 w-6" />
            </span>
            <p className="mt-4 text-brand-textSecondary">
              Pick a subject and chapter on the left to view and add questions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-textSecondary">
                    {mode === 'generate' ? 'Selecting questions from' : 'Currently viewing'}
                  </p>
                  <p className="truncate text-sm font-semibold text-brand-textPrimary">
                    {selectedSubject?.name ? `${selectedSubject.name} · ` : ''}
                    {selectedChapter.title}
                    {selectedTopic ? ` · ${selectedTopic.title}` : ''}
                  </p>
                </div>
                <div className="rounded-full bg-brand-accentLight px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-accentDark">
                  {mode === 'upload'
                    ? `${filteredQuestions.length} question${filteredQuestions.length === 1 ? '' : 's'} matched`
                    : `${questions.length} question${questions.length === 1 ? '' : 's'} selected`}
                </div>
              </div>
            </div>
            {mode === 'upload' ? (
              <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-brand-textPrimary">Question upload</h2>
                    <p className="text-sm text-brand-textSecondary">Add, search and manage questions by chapter, topic, type or keyword.</p>
                  </div>
                  <Link
                    href={addQuestionHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-4 py-2 text-sm font-semibold text-white shadow-accent"
                  >
                    <Plus className="h-4 w-4" /> Add question
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    className={`${inputCls} min-w-0`}
                    placeholder="Search questions by keyword, chapter, topic or tags"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    onClick={() => setSearchTerm('')}
                    className="inline-flex min-h-[38px] items-center justify-center rounded-xl border border-brand-border bg-white px-4 text-sm font-semibold text-brand-textPrimary shadow-card"
                  >
                    Clear
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-brand-border bg-white p-3 shadow-card">
                  <Filter className="h-4 w-4 text-brand-textSecondary" />
                  <select className={`${inputCls} w-auto`} value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
                    <option value="">All types</option>
                    {TYPES.map((t) => <option key={t.val} value={t.val}>{t.label}</option>)}
                  </select>
                  <select className={`${inputCls} w-auto`} value={filters.difficulty} onChange={(e) => setFilters((f) => ({ ...f, difficulty: e.target.value }))}>
                    <option value="">All difficulty</option>
                    {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select className={`${inputCls} w-auto`} value={filters.source} onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}>
                    <option value="">All sources</option>
                    {SOURCES.map((s) => <option key={s.val} value={s.val}>{s.label}</option>)}
                  </select>
                  <select className={`${inputCls} w-auto`} value={filters.marks} onChange={(e) => setFilters((f) => ({ ...f, marks: e.target.value }))}>
                    <option value="">Any marks</option>
                    {[1, 2, 3, 4, 5].map((m) => <option key={m} value={m}>{m} mark{m === 1 ? '' : 's'}</option>)}
                  </select>
                  <label className="ml-auto inline-flex items-center gap-2 text-sm text-brand-textSecondary">
                    <input
                      type="checkbox"
                      checked={showArchived}
                      onChange={(e) => setShowArchived(e.target.checked)}
                      className="h-4 w-4 rounded border-brand-border text-brand-accent"
                    />
                    Show archived
                  </label>
                </div>

                {/* Bulk upload */}
                <div className="mt-4 rounded-xl border border-dashed border-brand-border bg-brand-accentLight/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-textPrimary">
                        <Upload className="h-4 w-4" /> Bulk upload
                      </h3>
                      <p className="text-xs text-brand-textSecondary">
                        CSV or Excel into “{selectedChapter.title}”
                        {selectedTopic ? ` · ${selectedTopic.title}` : ''}. Supports MCQ, multiple,
                        true/false, fill-blank, one-word, numeric &amp; subjective.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="/api/question-bank/questions/bulk"
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-brand-textPrimary shadow-card"
                      >
                        <Download className="h-3.5 w-3.5" /> Template
                      </a>
                      <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-accent-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-accent">
                        {bulkBusy ? 'Uploading…' : 'Choose file'}
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls,.txt"
                          className="hidden"
                          disabled={bulkBusy}
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) doBulkUpload(f)
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  {bulkError && <p className="mt-2 text-xs text-brand-accent">{bulkError}</p>}
                  {bulkResult && (
                    <div className="mt-2 text-xs">
                      <p className="font-semibold text-brand-success">
                        Inserted {bulkResult.inserted} of {bulkResult.total}.
                        {bulkResult.failedCount > 0 ? ` ${bulkResult.failedCount} failed.` : ''}
                      </p>
                      {bulkResult.failed?.length > 0 && (
                        <ul className="mt-1 max-h-32 list-inside list-disc overflow-y-auto text-brand-textSecondary">
                          {bulkResult.failed.map((f, i) => (
                            <li key={i}>
                              Row {f.row}: {f.error}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {filteredQuestions.map((q) => (
                    <div key={q._id} className="flex items-start justify-between gap-3 rounded-xl border border-brand-border bg-white p-4 shadow-card">
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-brand-accentLight px-2 py-0.5 text-xs font-semibold text-brand-accentDark">
                            {TYPES.find((t) => t.val === q.type)?.label || q.type}
                          </span>
                          <span className="rounded-full bg-brand-border/50 px-2 py-0.5 text-xs font-medium capitalize text-brand-textSecondary">
                            {q.difficulty}
                          </span>
                          <span className="rounded-full bg-brand-border/50 px-2 py-0.5 text-xs font-medium text-brand-textSecondary">
                            {q.marks} mark{q.marks === 1 ? '' : 's'}
                          </span>
                          {q.accessTier === 'free' && (
                            <span className="rounded-full bg-brand-success/15 px-2 py-0.5 text-xs font-semibold text-brand-success">
                              Free
                            </span>
                          )}
                          {q.status === 'archived' && (
                            <span className="rounded-full bg-brand-warning/20 px-2 py-0.5 text-xs font-semibold text-brand-warning">
                              Archived
                            </span>
                          )}
                        </div>
                        <div className="line-clamp-2 text-sm text-brand-textPrimary">
                          {q.text || q.assertion ? (
                            <RichText text={q.text || q.assertion} />
                          ) : (
                            '(no text)'
                          )}
                        </div>
                        {q.topicId && selectedTopic ? (
                          <p className="mt-1 text-xs text-brand-textSecondary">Topic: {selectedTopic.title}</p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {q.status === 'archived' ? (
                          <button onClick={() => restoreQuestion(q._id)} title="Restore">
                            <RotateCcw className="h-4 w-4 text-brand-textSecondary transition-colors hover:text-brand-success" />
                          </button>
                        ) : (
                          <button onClick={() => archiveQuestion(q._id)} title="Archive">
                            <Archive className="h-4 w-4 text-brand-textSecondary transition-colors hover:text-brand-warning" />
                          </button>
                        )}
                        <button onClick={() => deleteQuestion(q._id)} title="Delete">
                          <Trash2 className="h-4 w-4 text-brand-textSecondary transition-colors hover:text-brand-accent" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredQuestions.length === 0 && (
                    <p className="rounded-xl border border-dashed border-brand-border bg-white p-8 text-center text-sm text-brand-textSecondary">
                      No questions match. Adjust your search or filters.
                    </p>
                  )}
                </div>
              </div>
            ) : mode === 'add' ? (
              <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-brand-textPrimary">Add question</h2>
                    <p className="text-sm text-brand-textSecondary">Create a new question in the selected subject, chapter, and topic.</p>
                  </div>
                  <Link
                    href="/admin/question-bank/upload"
                    className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-textPrimary shadow-card"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" /> Back to upload
                  </Link>
                </div>

                {selectedChapter ? (
                  <QuestionForm
                    subjectId={selectedSubject?._id}
                    chapterId={selectedChapter._id}
                    topicId={selectedTopic?._id}
                    onSave={async (payload) => {
                      await saveQuestion(payload)
                      router.push('/admin/question-bank/upload')
                    }}
                    onCancel={() => router.push('/admin/question-bank/upload')}
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-brand-border bg-brand-accentLight p-8 text-center text-sm text-brand-textSecondary">
                    Select a subject and chapter on the left to add a question.
                  </div>
                )}
              </div>
            ) : mode === 'generate' ? (
              <div className="space-y-4">
                {/* Step 1 — find & add questions */}
                <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-base font-semibold text-brand-textPrimary">1. Search &amp; add questions</h2>
                    {filteredQuestions.length > 0 && (
                      <button onClick={addAllVisibleToPaper} className="text-sm font-semibold text-brand-accent">
                        + Add all {filteredQuestions.length} shown
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                      className={`${inputCls} min-w-0`}
                      placeholder="Search questions by keyword, tag or year"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                      onClick={() => setSearchTerm('')}
                      className="inline-flex min-h-[38px] items-center justify-center rounded-xl border border-brand-border bg-white px-4 text-sm font-semibold text-brand-textPrimary shadow-card"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Filter className="h-4 w-4 text-brand-textSecondary" />
                    <select className={`${inputCls} w-auto`} value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
                      <option value="">All types</option>
                      {TYPES.map((t) => <option key={t.val} value={t.val}>{t.label}</option>)}
                    </select>
                    <select className={`${inputCls} w-auto`} value={filters.difficulty} onChange={(e) => setFilters((f) => ({ ...f, difficulty: e.target.value }))}>
                      <option value="">All difficulty</option>
                      {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select className={`${inputCls} w-auto`} value={filters.marks} onChange={(e) => setFilters((f) => ({ ...f, marks: e.target.value }))}>
                      <option value="">Any marks</option>
                      {[1, 2, 3, 4, 5].map((m) => <option key={m} value={m}>{m} mark{m === 1 ? '' : 's'}</option>)}
                    </select>
                  </div>

                  <div className="mt-3 max-h-[420px] space-y-2 overflow-auto">
                    {filteredQuestions.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-brand-border p-6 text-center text-sm text-brand-textSecondary">
                        {selectedChapter
                          ? 'No questions match. Try another keyword or filter.'
                          : 'Pick a subject and chapter on the left to see its questions.'}
                      </p>
                    ) : (
                      filteredQuestions.map((q) => {
                        const inPaper = paperIds.has(q._id)
                        return (
                          <div key={q._id} className="flex items-start justify-between gap-3 rounded-xl border border-brand-border p-3">
                            <div className="min-w-0">
                              <p className="text-sm text-brand-textPrimary">{plainPreview(q)}</p>
                              <p className="mt-1 text-xs capitalize text-brand-textSecondary">
                                {q.type} · {q.difficulty} · {q.marks} mark{q.marks === 1 ? '' : 's'}
                              </p>
                            </div>
                            <button
                              onClick={() => (inPaper ? removeFromPaper(q._id) : addToPaper(q))}
                              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                inPaper
                                  ? 'border border-brand-success/50 bg-brand-success/10 text-brand-success'
                                  : 'bg-accent-gradient text-white shadow-accent'
                              }`}
                            >
                              {inPaper ? '✓ Added' : '+ Add'}
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Step 2 — your paper */}
                <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-base font-semibold text-brand-textPrimary">2. Your paper</h2>
                    <span className="rounded-full bg-brand-accentLight px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-accentDark">
                      {paperQuestions.length} question{paperQuestions.length === 1 ? '' : 's'} · {paperMarks} marks
                    </span>
                  </div>

                  {paperQuestions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-brand-border bg-brand-accentLight/10 p-6 text-center text-sm text-brand-textSecondary">
                      No questions added yet. Search above and click “Add”.
                    </div>
                  ) : (
                    <ol className="space-y-2">
                      {paperQuestions.map((q, i) => (
                        <li key={q._id} className="flex items-start justify-between gap-3 rounded-xl border border-brand-border p-3">
                          <div className="min-w-0">
                            <p className="text-sm text-brand-textPrimary">
                              <span className="font-semibold">{i + 1}.</span> {plainPreview(q)}
                            </p>
                            <p className="mt-1 text-xs capitalize text-brand-textSecondary">
                              {q.type} · {q.marks} mark{q.marks === 1 ? '' : 's'}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromPaper(q._id)}
                            className="shrink-0 text-brand-textSecondary transition hover:text-brand-accent"
                            title="Remove from paper"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}

                  <div className="mt-4 space-y-3 border-t border-brand-border pt-4">
                    <label className="block text-sm font-semibold text-brand-textPrimary">
                      Paper title
                      <input
                        className={`${inputCls} mt-1.5 font-normal`}
                        placeholder="e.g. Class 10 · Physics · Unit Test 1"
                        value={paperTitle}
                        onChange={(e) => setPaperTitle(e.target.value)}
                      />
                    </label>

                    <label className="inline-flex items-center gap-2 text-sm text-brand-textPrimary">
                      <input
                        type="checkbox"
                        checked={includeAnswerKey}
                        onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                        className="h-4 w-4 rounded border-brand-border text-brand-accent"
                      />
                      Include answer key in downloads
                    </label>

                    <div>
                      <button
                        type="button"
                        onClick={() => setShowPaperDetails((v) => !v)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-accent"
                      >
                        {showPaperDetails ? '− Hide header details' : '+ Add institution, teacher & instructions (optional)'}
                      </button>
                      {showPaperDetails && (
                        <div className="mt-3 space-y-3 rounded-xl border border-brand-border bg-brand-accentLight/10 p-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="text-xs font-medium text-brand-textSecondary">
                              Institution name
                              <input className={`${inputCls} mt-1`} value={paperInstitution} onChange={(e) => setPaperInstitution(e.target.value)} />
                            </label>
                            <label className="text-xs font-medium text-brand-textSecondary">
                              Subject teacher name
                              <input className={`${inputCls} mt-1`} value={paperTeacher} onChange={(e) => setPaperTeacher(e.target.value)} />
                            </label>
                          </div>
                          <label className="block text-xs font-medium text-brand-textSecondary">
                            Header instructions
                            <input className={`${inputCls} mt-1`} value={paperInstructions} onChange={(e) => setPaperInstructions(e.target.value)} />
                          </label>
                          <label className="block text-xs font-medium text-brand-textSecondary">
                            Footer text
                            <input className={`${inputCls} mt-1`} value={paperFooter} onChange={(e) => setPaperFooter(e.target.value)} />
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => savePaper('published')}
                        disabled={savingPaper || paperQuestions.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-accent disabled:opacity-60"
                      >
                        <FileText className="h-4 w-4" />
                        {savingPaper ? 'Saving…' : 'Save & create paper'}
                      </button>
                      <button
                        onClick={() => savePaper('draft')}
                        disabled={savingPaper || paperQuestions.length === 0}
                        className="inline-flex items-center justify-center rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-semibold text-brand-textPrimary shadow-card disabled:opacity-60"
                      >
                        {savingPaper ? 'Saving…' : 'Save as draft'}
                      </button>
                      <Link
                        href="/admin/question-bank/papers"
                        className="ml-auto inline-flex items-center justify-center rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-semibold text-brand-textPrimary shadow-card"
                      >
                        All saved papers
                      </Link>
                    </div>

                    {paperError && <p className="text-sm text-brand-accent">{paperError}</p>}

                    {savedPaper && (
                      <div className="rounded-xl border border-brand-success/40 bg-brand-success/10 p-4">
                        <p className="text-sm font-semibold text-brand-textPrimary">
                          Saved “{savedPaper.title}” ({savedPaper.status}) · {savedPaper.totalQuestions} questions · {savedPaper.totalMarks} marks
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <a
                            href={`/api/question-bank/papers/${savedPaper._id}/export?format=pdf&answerKey=${includeAnswerKey}`}
                            className="rounded-lg bg-accent-gradient px-3 py-1.5 text-sm font-semibold text-white shadow-accent"
                          >
                            Download PDF
                          </a>
                          <a
                            href={`/api/question-bank/papers/${savedPaper._id}/export?format=docx&answerKey=${includeAnswerKey}`}
                            className="rounded-lg border border-brand-border bg-white px-3 py-1.5 text-sm font-semibold text-brand-textPrimary shadow-card"
                          >
                            Download Word
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
