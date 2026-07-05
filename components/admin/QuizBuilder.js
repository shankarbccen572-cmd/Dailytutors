'use client'

import { useState } from 'react'

const inputCls =
  'w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-accent'

const TYPE_LABELS = {
  mcq: 'Multiple choice (one answer)',
  multiple: 'Multiple correct',
  truefalse: 'True / False',
  numeric: 'Numeric / Short answer',
}

// ---- Add / edit question form -------------------------------------------

const emptyOptions = () => [
  { text: '', isCorrect: false },
  { text: '', isCorrect: false },
]

function QuestionForm({ onSave, onCancel }) {
  const [type, setType] = useState('mcq')
  const [text, setText] = useState('')
  const [options, setOptions] = useState(emptyOptions())
  const [tfCorrect, setTfCorrect] = useState('True')
  const [numericAnswer, setNumericAnswer] = useState('')
  const [explanation, setExplanation] = useState('')
  const [marks, setMarks] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function setOption(i, patch) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)))
  }

  // For mcq only one option can be correct.
  function markCorrect(i) {
    if (type === 'mcq') {
      setOptions((prev) => prev.map((o, idx) => ({ ...o, isCorrect: idx === i })))
    } else {
      setOption(i, { isCorrect: !options[i].isCorrect })
    }
  }

  function addOption() {
    setOptions((prev) => [...prev, { text: '', isCorrect: false }])
  }

  function removeOption(i) {
    setOptions((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)))
  }

  function buildPayload() {
    if (type === 'numeric') {
      return { type, text, correctAnswer: numericAnswer, explanation, marks }
    }
    if (type === 'truefalse') {
      return {
        type,
        text,
        options: [
          { text: 'True', isCorrect: tfCorrect === 'True' },
          { text: 'False', isCorrect: tfCorrect === 'False' },
        ],
        explanation,
        marks,
      }
    }
    return { type, text, options, explanation, marks }
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

      <textarea
        className={inputCls}
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type the question here…"
      />

      {/* Options for mcq / multiple */}
      {(type === 'mcq' || type === 'multiple') && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-brand-textSecondary">
            Options{' '}
            <span className="font-normal">
              ({type === 'mcq' ? 'select the one correct answer' : 'tick all correct answers'})
            </span>
          </p>
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type={type === 'mcq' ? 'radio' : 'checkbox'}
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
      )}

      {/* True / False */}
      {type === 'truefalse' && (
        <div className="flex items-center gap-6">
          <span className="text-xs font-medium text-brand-textSecondary">
            Correct answer:
          </span>
          {['True', 'False'].map((v) => (
            <label key={v} className="flex items-center gap-2 text-sm text-brand-textPrimary">
              <input
                type="radio"
                name="tf"
                checked={tfCorrect === v}
                onChange={() => setTfCorrect(v)}
              />
              {v}
            </label>
          ))}
        </div>
      )}

      {/* Numeric / short answer */}
      {type === 'numeric' && (
        <label className="block text-xs font-medium text-brand-textSecondary">
          Correct answer
          <input
            className={`${inputCls} mt-1`}
            value={numericAnswer}
            onChange={(e) => setNumericAnswer(e.target.value)}
            placeholder="e.g. 42  (student's answer must match this)"
          />
        </label>
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
          disabled={saving || !text.trim()}
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

// ---- One question row (read-only) ---------------------------------------

function QuestionRow({ question, index, onDelete }) {
  return (
    <li className="rounded-lg border border-brand-border bg-brand-accentLight/30 px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-brand-textPrimary">
          <span className="text-brand-textSecondary">{index + 1}.</span>{' '}
          {question.text}
          <span className="ml-2 rounded-full bg-brand-accentLight px-2 py-0.5 text-xs font-medium text-brand-accentDark">
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

      {question.type === 'numeric' ? (
        <p className="mt-1 text-xs text-brand-textSecondary">
          Answer: <span className="font-medium text-brand-success">{question.correctAnswer}</span>
        </p>
      ) : (
        <ul className="mt-1 space-y-0.5">
          {question.options.map((o, i) => (
            <li
              key={i}
              className={`text-xs ${
                o.isCorrect
                  ? 'font-medium text-brand-success'
                  : 'text-brand-textSecondary'
              }`}
            >
              {o.isCorrect ? '✓' : '○'} {o.text}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

// ---- One quiz card -------------------------------------------------------

export function QuizCard({ quiz, courseId, onDelete }) {
  const [questions, setQuestions] = useState(quiz.questions || [])
  const [adding, setAdding] = useState(false)
  // Editable settings
  const [title, setTitle] = useState(quiz.title)
  const [timeLimit, setTimeLimit] = useState(quiz.timeLimit || 0)
  const [passingScore, setPassingScore] = useState(quiz.passingScore || 0)
  const [status, setStatus] = useState(quiz.status || 'draft')
  const [savingSettings, setSavingSettings] = useState(false)

  async function saveSettings(overrideStatus) {
    const nextStatus = overrideStatus || status
    setSavingSettings(true)
    await fetch(`/api/quizzes/${quiz._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, timeLimit, passingScore, status: nextStatus }),
    })
    if (overrideStatus) setStatus(overrideStatus)
    setSavingSettings(false)
  }

  function publishNow() {
    saveSettings('published')
  }

  async function addQuestion(payload) {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId: quiz._id, courseId, ...payload }),
    })
    if (res.ok) {
      const q = await res.json()
      setQuestions((p) => [...p, q])
      setAdding(false)
      return null
    }
    const { error } = await res.json().catch(() => ({}))
    return error || 'Could not save question'
  }

  async function deleteQuestion(id) {
    const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' })
    if (res.ok) setQuestions((p) => p.filter((q) => q._id !== id))
  }

  return (
    <div className="rounded-xl border border-brand-border bg-brand-primary p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-base font-semibold text-brand-textPrimary">
          {title || 'Untitled quiz'}
          <span
            className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
              status === 'published'
                ? 'bg-brand-success/15 text-brand-success'
                : 'bg-brand-accentLight text-brand-accentDark'
            }`}
          >
            {status}
          </span>
        </h3>
        <button
          type="button"
          onClick={() => onDelete(quiz._id)}
          className="rounded-md border border-brand-border px-3 py-1 text-xs font-medium text-brand-accent hover:bg-brand-accentLight"
        >
          Delete quiz
        </button>
      </div>

      {/* Settings */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-medium text-brand-textSecondary">
          Title
          <input
            className={`${inputCls} mt-1`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="text-xs font-medium text-brand-textSecondary">
          Time limit (min, 0 = none)
          <input
            type="number"
            min="0"
            className={`${inputCls} mt-1`}
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
          />
        </label>
        <label className="text-xs font-medium text-brand-textSecondary">
          Passing score (%)
          <input
            type="number"
            min="0"
            max="100"
            className={`${inputCls} mt-1`}
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
          />
        </label>
        <label className="text-xs font-medium text-brand-textSecondary">
          Status
          <select
            className={`${inputCls} mt-1`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={saveSettings}
          disabled={savingSettings}
          className="rounded-md bg-brand-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-accentDark disabled:opacity-50"
        >
          {savingSettings ? 'Saving…' : 'Save settings'}
        </button>
        {status !== 'published' ? (
          <>
            <button
              type="button"
              onClick={publishNow}
              disabled={savingSettings}
              className="rounded-md bg-brand-success px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              Publish now
            </button>
            <span className="text-xs font-medium text-brand-warning">
              ⚠ This quiz is a <b>draft</b> — students can&apos;t see it until you
              publish.
            </span>
          </>
        ) : (
          <span className="text-xs font-medium text-brand-success">
            ✓ Published — visible to enrolled students.
          </span>
        )}
      </div>

      {/* Questions */}
      <ul className="mt-4 space-y-2">
        {questions.length === 0 && (
          <li className="text-sm text-brand-textSecondary">No questions yet.</li>
        )}
        {questions.map((q, i) => (
          <QuestionRow
            key={q._id}
            question={q}
            index={i}
            onDelete={deleteQuestion}
          />
        ))}
      </ul>

      {/* Add question */}
      <div className="mt-4">
        {adding ? (
          <QuestionForm onSave={addQuestion} onCancel={() => setAdding(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-md bg-brand-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-accentDark"
          >
            + Add question
          </button>
        )}
      </div>
    </div>
  )
}

// ---- Top-level builder ---------------------------------------------------

export default function QuizBuilder({ courseId, initialQuizzes = [] }) {
  const [quizzes, setQuizzes] = useState(initialQuizzes)
  const [newQuiz, setNewQuiz] = useState('')
  const [busy, setBusy] = useState(false)

  async function addQuiz() {
    if (!newQuiz.trim()) return
    setBusy(true)
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, title: newQuiz.trim() }),
    })
    setBusy(false)
    if (res.ok) {
      const q = await res.json()
      setQuizzes((p) => [...p, { ...q, questions: [] }])
      setNewQuiz('')
    } else {
      alert('Could not add quiz')
    }
  }

  async function deleteQuiz(id) {
    if (!confirm('Delete this quiz and all its questions?')) return
    const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' })
    if (res.ok) setQuizzes((p) => p.filter((q) => q._id !== id))
  }

  return (
    <div className="space-y-5">
      {quizzes.length === 0 && (
        <p className="text-sm text-brand-textSecondary">
          No quizzes yet. Create your first test below.
        </p>
      )}

      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz._id}
          quiz={quiz}
          courseId={courseId}
          onDelete={deleteQuiz}
        />
      ))}

      {/* Add quiz */}
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-brand-border bg-brand-primary p-4 sm:flex-row">
        <input
          className={inputCls}
          value={newQuiz}
          onChange={(e) => setNewQuiz(e.target.value)}
          placeholder="New test/quiz title (e.g. Chapter 1 Test)"
          onKeyDown={(e) => e.key === 'Enter' && addQuiz()}
        />
        <button
          type="button"
          onClick={addQuiz}
          disabled={busy || !newQuiz.trim()}
          className="shrink-0 rounded-lg bg-brand-accent px-6 py-2 font-medium text-white hover:bg-brand-accentDark disabled:opacity-50"
        >
          + Add test
        </button>
      </div>
    </div>
  )
}
