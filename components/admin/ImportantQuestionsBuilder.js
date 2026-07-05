'use client'

import { useState } from 'react'
import { AR_OPTIONS } from '@/lib/importantQuestion'

const inputCls =
  'w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-accent'

const TYPE_LABELS = {
  'assertion-reason': 'Assertion & Reason (A-R)',
  'statement-based': 'Statement-based',
  'match-column': 'Match the Column',
}

const LEFT_LABELS = 'ABCDEFGH'.split('')
const rightLabel = (i) => String(i + 1)

function romanNumeral(n) {
  return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n - 1] || `${n}`
}

// ---- Add-question form ---------------------------------------------------

function ImportantQuestionForm({ chapterId, lessonId, onSave, onCancel }) {
  const [type, setType] = useState('assertion-reason')
  const [marks, setMarks] = useState(1)
  const [explanation, setExplanation] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Assertion-Reason
  const [assertion, setAssertion] = useState('')
  const [reason, setReason] = useState('')
  const [arCorrect, setArCorrect] = useState(0)

  // Statement-based
  const [intro, setIntro] = useState('')
  const [statements, setStatements] = useState(['', ''])

  // Match the Column
  const [columnITitle, setColumnITitle] = useState('')
  const [columnIITitle, setColumnIITitle] = useState('')
  const [leftItems, setLeftItems] = useState(['', ''])
  const [rightItems, setRightItems] = useState(['', ''])

  // Shared answer options (statement-based + match-column), single correct.
  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
  ])

  function setOption(i, patch) {
    setOptions((p) => p.map((o, idx) => (idx === i ? { ...o, ...patch } : o)))
  }
  function markCorrect(i) {
    setOptions((p) => p.map((o, idx) => ({ ...o, isCorrect: idx === i })))
  }
  function addOption() {
    setOptions((p) => [...p, { text: '', isCorrect: false }])
  }
  function removeOption(i) {
    setOptions((p) => (p.length <= 2 ? p : p.filter((_, idx) => idx !== i)))
  }

  const listAdd = (setter) => setter((p) => [...p, ''])
  const listRemove = (setter, i, min) =>
    setter((p) => (p.length <= min ? p : p.filter((_, idx) => idx !== i)))
  const listSet = (setter, i, v) =>
    setter((p) => p.map((x, idx) => (idx === i ? v : x)))

  function buildPayload() {
    const base = { type, chapterId, lessonId, marks, explanation }
    if (type === 'assertion-reason') {
      return { ...base, assertion, reason, correctOption: arCorrect }
    }
    if (type === 'statement-based') {
      return {
        ...base,
        intro,
        statements: statements.map((text) => ({ text })),
        options,
      }
    }
    return {
      ...base,
      columnITitle,
      columnIITitle,
      leftItems: leftItems.map((text) => ({ text })),
      rightItems: rightItems.map((text) => ({ text })),
      options,
    }
  }

  async function submit() {
    setError('')
    setSaving(true)
    const err = await onSave(buildPayload())
    setSaving(false)
    if (err) setError(err)
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-brand-border bg-brand-accentLight/20 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-brand-textSecondary">
          Question type
          <select
            className={`${inputCls} mt-1`}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
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

      {/* Assertion-Reason */}
      {type === 'assertion-reason' && (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-brand-textSecondary">
            Assertion (A)
            <textarea
              className={`${inputCls} mt-1`}
              rows={2}
              value={assertion}
              onChange={(e) => setAssertion(e.target.value)}
              placeholder="e.g. The presence of very large vacuoles is a characteristic feature of plant cells."
            />
          </label>
          <label className="block text-xs font-medium text-brand-textSecondary">
            Reason (R)
            <textarea
              className={`${inputCls} mt-1`}
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. In plant cells, vacuoles are full of cell sap and provide turgidity."
            />
          </label>
          <div className="space-y-1">
            <p className="text-xs font-medium text-brand-textSecondary">
              Correct option
            </p>
            {AR_OPTIONS.map((label, i) => (
              <label
                key={i}
                className="flex items-start gap-2 text-sm text-brand-textPrimary"
              >
                <input
                  type="radio"
                  name="ar"
                  className="mt-1"
                  checked={arCorrect === i}
                  onChange={() => setArCorrect(i)}
                />
                <span>
                  <b>{String.fromCharCode(65 + i)}.</b> {label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Statement-based */}
      {type === 'statement-based' && (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-brand-textSecondary">
            Intro line (optional)
            <input
              className={`${inputCls} mt-1`}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="e.g. Read the following statements regarding breathing mechanics:"
            />
          </label>
          <div className="space-y-2">
            <p className="text-xs font-medium text-brand-textSecondary">Statements</p>
            {statements.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="shrink-0 text-xs font-medium text-brand-textSecondary">
                  {romanNumeral(i + 1)}.
                </span>
                <input
                  className={inputCls}
                  value={s}
                  onChange={(e) => listSet(setStatements, i, e.target.value)}
                  placeholder={`Statement ${romanNumeral(i + 1)}`}
                />
                <button
                  type="button"
                  onClick={() => listRemove(setStatements, i, 2)}
                  disabled={statements.length <= 2}
                  className="shrink-0 text-xs font-medium text-brand-accent hover:underline disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => listAdd(setStatements)}
              className="text-xs font-medium text-brand-accent hover:underline"
            >
              + Add statement
            </button>
          </div>
          <OptionsEditor
            options={options}
            setOption={setOption}
            markCorrect={markCorrect}
            addOption={addOption}
            removeOption={removeOption}
            hint="e.g. “Statement I is incorrect, but Statement II is correct.”"
          />
        </div>
      )}

      {/* Match the Column */}
      {type === 'match-column' && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-brand-textSecondary">
              Column I title (optional)
              <input
                className={`${inputCls} mt-1`}
                value={columnITitle}
                onChange={(e) => setColumnITitle(e.target.value)}
                placeholder="e.g. Organism"
              />
            </label>
            <label className="text-xs font-medium text-brand-textSecondary">
              Column II title (optional)
              <input
                className={`${inputCls} mt-1`}
                value={columnIITitle}
                onChange={(e) => setColumnIITitle(e.target.value)}
                placeholder="e.g. Vegetative Propagule"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColumnEditor
              title="Column I"
              items={leftItems}
              labels={leftItems.map((_, i) => LEFT_LABELS[i] || `${i + 1}`)}
              onChange={(i, v) => listSet(setLeftItems, i, v)}
              onAdd={() => listAdd(setLeftItems)}
              onRemove={(i) => listRemove(setLeftItems, i, 2)}
            />
            <ColumnEditor
              title="Column II"
              items={rightItems}
              labels={rightItems.map((_, i) => rightLabel(i))}
              onChange={(i, v) => listSet(setRightItems, i, v)}
              onAdd={() => listAdd(setRightItems)}
              onRemove={(i) => listRemove(setRightItems, i, 2)}
            />
          </div>
          <OptionsEditor
            options={options}
            setOption={setOption}
            markCorrect={markCorrect}
            addOption={addOption}
            removeOption={removeOption}
            hint="e.g. “A-3, B-1, C-4, D-2”"
          />
        </div>
      )}

      <textarea
        className={inputCls}
        rows={2}
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        placeholder="Explanation / solution (optional, shown after submission)"
      />

      {error && <p className="text-xs font-medium text-brand-accent">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="rounded-md bg-brand-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-accentDark disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save question'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-brand-textSecondary hover:text-brand-textPrimary"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function OptionsEditor({ options, setOption, markCorrect, addOption, removeOption, hint }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-brand-textSecondary">
        Answer options <span className="font-normal">(select the one correct answer)</span>
      </p>
      {hint && <p className="text-xs text-brand-textSecondary">{hint}</p>}
      {options.map((o, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="radio"
            name="iq-opt"
            checked={o.isCorrect}
            onChange={() => markCorrect(i)}
            title="Mark as correct"
          />
          <input
            className={inputCls}
            value={o.text}
            onChange={(e) => setOption(i, { text: e.target.value })}
            placeholder={`Option ${i + 1}`}
          />
          <button
            type="button"
            onClick={() => removeOption(i)}
            disabled={options.length <= 2}
            className="shrink-0 text-xs font-medium text-brand-accent hover:underline disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="text-xs font-medium text-brand-accent hover:underline"
      >
        + Add option
      </button>
    </div>
  )
}

function ColumnEditor({ title, items, labels, onChange, onAdd, onRemove }) {
  return (
    <div className="space-y-2 rounded-lg border border-brand-border p-3">
      <p className="text-xs font-medium text-brand-textSecondary">{title}</p>
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="shrink-0 text-xs font-medium text-brand-textSecondary">
            {labels[i]}.
          </span>
          <input
            className={inputCls}
            value={it}
            onChange={(e) => onChange(i, e.target.value)}
            placeholder={`Row ${labels[i]}`}
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            disabled={items.length <= 2}
            className="shrink-0 text-xs font-medium text-brand-accent hover:underline disabled:opacity-40"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="text-xs font-medium text-brand-accent hover:underline"
      >
        + Add row
      </button>
    </div>
  )
}

// ---- Read-only question row ----------------------------------------------

function QuestionRow({ question, index, onDelete }) {
  const correctIdx = (question.options || []).findIndex((o) => o.isCorrect)
  return (
    <li className="rounded-lg border border-brand-border bg-brand-accentLight/30 px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-brand-textPrimary">
          <span className="text-brand-textSecondary">{index + 1}.</span>{' '}
          <span className="rounded-full bg-brand-accentLight px-2 py-0.5 text-xs font-medium text-brand-accentDark">
            {TYPE_LABELS[question.type]}
          </span>
          <span className="ml-1 text-xs text-brand-textSecondary">
            · {question.marks} mark{question.marks === 1 ? '' : 's'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onDelete(question._id)}
          className="shrink-0 text-xs font-medium text-brand-accent hover:underline"
        >
          Delete
        </button>
      </div>

      <div className="mt-1 space-y-0.5 text-xs text-brand-textSecondary">
        {question.type === 'assertion-reason' && (
          <>
            <p><b>A:</b> {question.assertion}</p>
            <p><b>R:</b> {question.reason}</p>
          </>
        )}
        {question.type === 'statement-based' && (
          <>
            {question.intro && <p>{question.intro}</p>}
            {(question.statements || []).map((s, i) => (
              <p key={i}>{romanNumeral(i + 1)}. {s.text}</p>
            ))}
          </>
        )}
        {question.type === 'match-column' && (
          <p>
            {(question.leftItems || []).map((it) => it.label).join(', ')} ↔{' '}
            {(question.rightItems || []).map((it) => it.label).join(', ')}
          </p>
        )}
        {correctIdx >= 0 && question.options?.[correctIdx] && (
          <p className="font-medium text-brand-success">
            ✓ {question.options[correctIdx].text}
          </p>
        )}
      </div>
    </li>
  )
}

// ---- One lesson (inside a chapter) ---------------------------------------

function LessonCard({ lesson, courseId, questions, onAddQuestion, onDeleteQuestion, onDeleteLesson }) {
  const [adding, setAdding] = useState(false)

  async function add(payload) {
    const res = await fetch('/api/important-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, ...payload }),
    })
    if (res.ok) {
      onAddQuestion(await res.json())
      setAdding(false)
      return null
    }
    const { error } = await res.json().catch(() => ({}))
    return error || 'Could not save question'
  }

  return (
    <div className="rounded-lg border border-brand-border bg-brand-primary p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-brand-textPrimary">
          {lesson.title}
          <span className="ml-2 text-xs font-normal text-brand-textSecondary">
            {questions.length} question{questions.length === 1 ? '' : 's'}
          </span>
        </h4>
        <button
          type="button"
          onClick={() => onDeleteLesson(lesson._id)}
          className="shrink-0 text-xs font-medium text-brand-accent hover:underline"
        >
          Delete lesson
        </button>
      </div>

      <ul className="mt-3 space-y-2">
        {questions.length === 0 && (
          <li className="text-xs text-brand-textSecondary">No questions yet.</li>
        )}
        {questions.map((q, i) => (
          <QuestionRow key={q._id} question={q} index={i} onDelete={onDeleteQuestion} />
        ))}
      </ul>

      <div className="mt-3">
        {adding ? (
          <ImportantQuestionForm
            chapterId={lesson.chapterId}
            lessonId={lesson._id}
            onSave={add}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-md bg-brand-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-accentDark"
          >
            + Add question
          </button>
        )}
      </div>
    </div>
  )
}

// ---- One chapter ---------------------------------------------------------

function ChapterCard({
  chapter,
  courseId,
  lessons,
  questions,
  onAddLesson,
  onDeleteLesson,
  onDeleteChapter,
  onAddQuestion,
  onDeleteQuestion,
}) {
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)

  async function addLesson() {
    if (!title.trim()) return
    setAdding(true)
    const res = await fetch('/api/iq-lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, chapterId: chapter._id, title: title.trim() }),
    })
    setAdding(false)
    if (res.ok) {
      onAddLesson(await res.json())
      setTitle('')
    } else {
      alert('Could not add lesson')
    }
  }

  return (
    <div className="rounded-xl border border-brand-border bg-brand-primary p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-base font-semibold text-brand-textPrimary">
          {chapter.title}
          <span className="ml-2 text-xs font-normal text-brand-textSecondary">
            {lessons.length} lesson{lessons.length === 1 ? '' : 's'}
          </span>
        </h3>
        <button
          type="button"
          onClick={() => onDeleteChapter(chapter._id)}
          className="rounded-md border border-brand-border px-3 py-1 text-xs font-medium text-brand-accent hover:bg-brand-accentLight"
        >
          Delete chapter
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {lessons.length === 0 && (
          <p className="text-sm text-brand-textSecondary">No lessons yet.</p>
        )}
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson._id}
            lesson={lesson}
            courseId={courseId}
            questions={questions.filter((q) => q.lessonId === lesson._id)}
            onAddQuestion={onAddQuestion}
            onDeleteQuestion={onDeleteQuestion}
            onDeleteLesson={onDeleteLesson}
          />
        ))}
      </div>

      {/* Add lesson */}
      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-dashed border-brand-border p-3 sm:flex-row">
        <input
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New lesson title (e.g. Cell Structure)"
          onKeyDown={(e) => e.key === 'Enter' && addLesson()}
        />
        <button
          type="button"
          onClick={addLesson}
          disabled={adding || !title.trim()}
          className="shrink-0 rounded-md bg-brand-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-accentDark disabled:opacity-50"
        >
          {adding ? 'Adding…' : '+ Add lesson'}
        </button>
      </div>
    </div>
  )
}

// ---- Top-level builder ---------------------------------------------------

export default function ImportantQuestionsBuilder({
  courseId,
  initialChapters = [],
  initialLessons = [],
  initialQuestions = [],
}) {
  const [chapters, setChapters] = useState(initialChapters)
  const [lessons, setLessons] = useState(initialLessons)
  const [questions, setQuestions] = useState(initialQuestions)
  const [newChapter, setNewChapter] = useState('')
  const [busy, setBusy] = useState(false)

  async function addChapter() {
    if (!newChapter.trim()) return
    setBusy(true)
    const res = await fetch('/api/iq-chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, title: newChapter.trim() }),
    })
    setBusy(false)
    if (res.ok) {
      const chapter = await res.json()
      setChapters((p) => [...p, chapter])
      setNewChapter('')
    } else {
      alert('Could not add chapter')
    }
  }

  async function deleteChapter(id) {
    if (!confirm('Delete this chapter and all its lessons and questions?')) return
    const res = await fetch(`/api/iq-chapters/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setChapters((p) => p.filter((c) => c._id !== id))
      setLessons((p) => p.filter((l) => l.chapterId !== id))
      setQuestions((p) => p.filter((q) => q.chapterId !== id))
    }
  }

  function addLesson(lesson) {
    setLessons((p) => [...p, lesson])
  }

  async function deleteLesson(id) {
    if (!confirm('Delete this lesson and all its questions?')) return
    const res = await fetch(`/api/iq-lessons/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setLessons((p) => p.filter((l) => l._id !== id))
      setQuestions((p) => p.filter((q) => q.lessonId !== id))
    }
  }

  function addQuestion(q) {
    setQuestions((p) => [...p, q])
  }

  async function deleteQuestion(id) {
    if (!confirm('Delete this question?')) return
    const res = await fetch(`/api/important-questions/${id}`, { method: 'DELETE' })
    if (res.ok) setQuestions((p) => p.filter((q) => q._id !== id))
  }

  return (
    <div className="space-y-5">
      {chapters.length === 0 && (
        <p className="text-sm text-brand-textSecondary">
          No chapters yet. Add your first chapter below, then add lessons and
          questions inside it.
        </p>
      )}

      {chapters.map((chapter) => (
        <ChapterCard
          key={chapter._id}
          chapter={chapter}
          courseId={courseId}
          lessons={lessons.filter((l) => l.chapterId === chapter._id)}
          questions={questions}
          onAddLesson={addLesson}
          onDeleteLesson={deleteLesson}
          onDeleteChapter={deleteChapter}
          onAddQuestion={addQuestion}
          onDeleteQuestion={deleteQuestion}
        />
      ))}

      {/* Add chapter */}
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-brand-border bg-brand-primary p-4 sm:flex-row">
        <input
          className={inputCls}
          value={newChapter}
          onChange={(e) => setNewChapter(e.target.value)}
          placeholder="New chapter title (e.g. Cell Biology)"
          onKeyDown={(e) => e.key === 'Enter' && addChapter()}
        />
        <button
          type="button"
          onClick={addChapter}
          disabled={busy || !newChapter.trim()}
          className="shrink-0 rounded-lg bg-brand-accent px-6 py-2 font-medium text-white hover:bg-brand-accentDark disabled:opacity-50"
        >
          + Add chapter
        </button>
      </div>
    </div>
  )
}
