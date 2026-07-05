'use client'

import { useState } from 'react'
import Link from 'next/link'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
const roman = (n) => ROMAN[n - 1] || `${n}`

const TYPE_LABELS = {
  'assertion-reason': 'Assertion & Reason',
  'statement-based': 'Statement-based',
  'match-column': 'Match the Column',
}

// Per-type display body (question stem) shown above the answer options.
function QuestionBody({ q }) {
  if (q.type === 'assertion-reason') {
    return (
      <div className="mt-3 space-y-1 rounded-lg bg-brand-accentLight/30 p-3 text-sm text-brand-textPrimary">
        <p>
          <b>Assertion (A):</b> {q.assertion}
        </p>
        <p>
          <b>Reason (R):</b> {q.reason}
        </p>
      </div>
    )
  }
  if (q.type === 'statement-based') {
    return (
      <div className="mt-3 space-y-1 rounded-lg bg-brand-accentLight/30 p-3 text-sm text-brand-textPrimary">
        {q.intro && <p className="font-medium">{q.intro}</p>}
        {(q.statements || []).map((s, i) => (
          <p key={i}>
            <b>Statement {roman(i + 1)}:</b> {s.text}
          </p>
        ))}
      </div>
    )
  }
  // match-column
  const rows = Math.max(
    (q.leftItems || []).length,
    (q.rightItems || []).length
  )
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-brand-border text-sm">
      <table className="w-full">
        <thead className="bg-brand-accentLight/40 text-left text-brand-textSecondary">
          <tr>
            <th className="px-3 py-2 font-medium">
              Column I{q.columnITitle ? ` (${q.columnITitle})` : ''}
            </th>
            <th className="px-3 py-2 font-medium">
              Column II{q.columnIITitle ? ` (${q.columnIITitle})` : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => {
            const l = q.leftItems?.[i]
            const r = q.rightItems?.[i]
            return (
              <tr key={i} className="border-t border-brand-border">
                <td className="px-3 py-2 text-brand-textPrimary">
                  {l ? (
                    <>
                      <b>{l.label}.</b> {l.text}
                    </>
                  ) : (
                    ''
                  )}
                </td>
                <td className="px-3 py-2 text-brand-textPrimary">
                  {r ? (
                    <>
                      <b>{r.label}.</b> {r.text}
                    </>
                  ) : (
                    ''
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// One question. Options/feedback only render once the test has started.
function QuestionItem({ q, number, r, selected, onChoose, locked, showOptions }) {
  return (
    <li
      className={`rounded-xl border bg-brand-primary p-5 ${
        r
          ? r.correct
            ? 'border-brand-success/40'
            : 'border-brand-accent/40'
          : 'border-brand-border'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-brand-textPrimary">
          <span className="text-brand-textSecondary">{number}.</span>{' '}
          <span className="rounded-full bg-brand-accentLight px-2 py-0.5 text-xs font-medium text-brand-accentDark">
            {TYPE_LABELS[q.type]}
          </span>
        </p>
        <span className="shrink-0 text-xs text-brand-textSecondary">
          {q.marks} mark{q.marks === 1 ? '' : 's'}
        </span>
      </div>

      <QuestionBody q={q} />

      {showOptions && (
      <ul className="mt-3 space-y-2">
        {q.options.map((o, oi) => {
          const chosen = selected === oi
          const isCorrectOpt = r && r.correctIndex === oi
          return (
            <li key={oi}>
              <label
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  r
                    ? isCorrectOpt
                      ? 'border-brand-success/40 bg-brand-success/10 text-brand-textPrimary'
                      : chosen
                        ? 'border-brand-accent/40 bg-brand-accentLight'
                        : 'border-brand-border text-brand-textSecondary'
                    : 'cursor-pointer border-brand-border hover:bg-brand-accentLight'
                }`}
              >
                <input
                  type="radio"
                  name={q._id}
                  checked={chosen || false}
                  onChange={() => onChoose(q._id, oi)}
                  disabled={locked}
                />
                {o.text}
              </label>
            </li>
          )
        })}
      </ul>
      )}

      {r && (
        <div className="mt-3 text-sm">
          <span
            className={
              r.correct
                ? 'font-medium text-brand-success'
                : 'font-medium text-brand-accent'
            }
          >
            {r.correct ? '✓ Correct' : '✗ Incorrect'}
          </span>
          {r.explanation && (
            <p className="mt-1 text-brand-textSecondary">{r.explanation}</p>
          )}
        </div>
      )}
    </li>
  )
}

export default function ImportantQuestionsRunner({ courseId, course, chapters }) {
  // answers: { [questionId]: optionIndex }
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  // Students first read all the questions; options appear only after they
  // click "Ready to take the test".
  const [started, setStarted] = useState(false)

  const allQuestions = chapters.flatMap((c) =>
    c.lessons.flatMap((l) => l.questions)
  )

  function choose(qId, index) {
    if (result) return
    setAnswers((p) => ({ ...p, [qId]: index }))
  }

  async function submit() {
    setSubmitting(true)
    const res = await fetch('/api/important-questions/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, answers }),
    })
    setSubmitting(false)
    if (res.ok) {
      setResult(await res.json())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const { error } = await res.json().catch(() => ({}))
      alert(error || 'Could not submit')
    }
  }

  const resultById = result
    ? Object.fromEntries(result.results.map((r) => [r.questionId, r]))
    : {}

  // Sequential display number across the whole paper, in render order.
  const numberById = {}
  allQuestions.forEach((q, i) => {
    numberById[q._id] = i + 1
  })

  return (
    <div className="min-h-screen bg-brand-accentLight/20">
      <header className="border-b border-brand-border bg-brand-primary">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href={`/learn/${courseId}`} className="shrink-0">
              <img
                src="/logo-full.png"
                alt="Daily Tutors"
                style={{ width: '200px', height: 'auto' }}
              />
            </Link>
            <h1 className="truncate font-heading text-lg font-semibold text-brand-textPrimary">
              Important Questions · {course.title}
            </h1>
          </div>
          <Link
            href={`/learn/${courseId}`}
            className="shrink-0 text-sm text-brand-textSecondary hover:text-brand-textPrimary"
          >
            ← Back to course
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {result && (
          <div className="mb-6 rounded-xl border border-brand-success/30 bg-brand-success/10 p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-textSecondary">
              Your score
            </p>
            <p className="mt-2 font-heading text-4xl font-bold text-brand-textPrimary">
              {result.percentage}%
            </p>
            <p className="mt-1 text-sm text-brand-textSecondary">
              {result.score} / {result.total} marks
            </p>
          </div>
        )}

        {allQuestions.length === 0 && (
          <p className="text-sm text-brand-textSecondary">
            No important questions have been added for this course yet.
          </p>
        )}

        {!started && !result && allQuestions.length > 0 && (
          <div className="mb-6 rounded-xl border border-brand-border bg-brand-primary p-4 text-sm text-brand-textSecondary">
            Read through all <b>{allQuestions.length}</b> questions below. When
            you&apos;re ready, click <b>Ready to take the test</b> and the answer
            options will appear.
          </div>
        )}

        <div className="space-y-8">
          {chapters
            .filter((c) => c.lessons.some((l) => l.questions.length > 0))
            .map((chapter) => (
              <section key={chapter._id}>
                <h2 className="mb-3 font-heading text-lg font-bold text-brand-textPrimary">
                  {chapter.title}
                </h2>
                <div className="space-y-6">
                  {chapter.lessons
                    .filter((l) => l.questions.length > 0)
                    .map((lesson) => (
                      <div key={lesson._id}>
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-textSecondary">
                          {lesson.title}
                        </h3>
                        <ol className="space-y-5">
                          {lesson.questions.map((q) => (
                            <QuestionItem
                              key={q._id}
                              q={q}
                              number={numberById[q._id]}
                              r={resultById[q._id]}
                              selected={answers[q._id]}
                              onChoose={choose}
                              locked={Boolean(result)}
                              showOptions={started}
                            />
                          ))}
                        </ol>
                      </div>
                    ))}
                </div>
              </section>
            ))}
        </div>

        <div className="mt-8">
          {result ? (
            <Link
              href={`/learn/${courseId}`}
              className="inline-block rounded-lg bg-brand-accent px-6 py-3 font-medium text-white hover:bg-brand-accentDark"
            >
              Back to course
            </Link>
          ) : !started ? (
            allQuestions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setStarted(true)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="rounded-lg bg-brand-accent px-6 py-3 font-medium text-white hover:bg-brand-accentDark"
              >
                Ready to take the test
              </button>
            )
          ) : (
            allQuestions.length > 0 && (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="rounded-lg bg-brand-accent px-6 py-3 font-medium text-white hover:bg-brand-accentDark disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit answers'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
