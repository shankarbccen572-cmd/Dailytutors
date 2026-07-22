'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function QuizRunner({ courseId, quiz, questions }) {
  // answers: { [questionId]: number[] (option indices) | string (numeric) }
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  function setOptionAnswer(qId, index, type) {
    setAnswers((prev) => {
      if (type === 'mcq' || type === 'truefalse') {
        return { ...prev, [qId]: [index] }
      }
      // multiple: toggle within the array
      const cur = Array.isArray(prev[qId]) ? prev[qId] : []
      const next = cur.includes(index)
        ? cur.filter((i) => i !== index)
        : [...cur, index]
      return { ...prev, [qId]: next }
    })
  }

  function setTextAnswer(qId, value) {
    setAnswers((prev) => ({ ...prev, [qId]: value }))
  }

  async function submit() {
    setSubmitting(true)
    const res = await fetch(`/api/quizzes/${quiz._id}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
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

  return (
    <div className="min-h-screen bg-brand-accentLight/20">
      <header className="border-b border-brand-border bg-brand-primary">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href={`/learn/${courseId}`} className="shrink-0">
              <Image
                src="/logo-full.png"
                alt="Daily Tutors"
                width={200}
                height={44}
                sizes="(max-width: 640px) 160px, 200px"
                style={{ width: '200px', height: 'auto' }}
              />
            </Link>
            <h1 className="truncate font-heading text-lg font-semibold text-brand-textPrimary">
              {quiz.title}
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
        {/* Result banner */}
        {result && (
          <div
            className={`mb-6 rounded-xl border p-6 text-center ${
              result.passed
                ? 'border-brand-success/30 bg-brand-success/10'
                : 'border-brand-accent/30 bg-brand-accentLight'
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-textSecondary">
              {result.passed ? 'Passed 🎉' : 'Keep practising'}
            </p>
            <p className="mt-2 font-heading text-4xl font-bold text-brand-textPrimary">
              {result.percentage}%
            </p>
            <p className="mt-1 text-sm text-brand-textSecondary">
              {result.score} / {result.total} marks
            </p>
          </div>
        )}

        {quiz.instructions && !result && (
          <p className="mb-6 rounded-lg border border-brand-border bg-brand-primary p-4 text-sm text-brand-textSecondary">
            {quiz.instructions}
          </p>
        )}

        {questions.length === 0 && (
          <p className="text-sm text-brand-textSecondary">
            This test has no questions yet.
          </p>
        )}

        <ol className="space-y-5">
          {questions.map((q, qi) => {
            const r = resultById[q._id]
            const selected = answers[q._id]
            return (
              <li
                key={q._id}
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
                    <span className="text-brand-textSecondary">{qi + 1}.</span> {q.text}
                  </p>
                  <span className="shrink-0 text-xs text-brand-textSecondary">
                    {q.marks} mark{q.marks === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Numeric / short answer */}
                {q.type === 'numeric' ? (
                  <input
                    className="mt-3 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-accent disabled:bg-brand-accentLight/30"
                    value={typeof selected === 'string' ? selected : ''}
                    onChange={(e) => setTextAnswer(q._id, e.target.value)}
                    disabled={Boolean(result)}
                    placeholder="Type your answer"
                  />
                ) : (
                  <ul className="mt-3 space-y-2">
                    {q.options.map((o, oi) => {
                      const chosen = Array.isArray(selected) && selected.includes(oi)
                      const isCorrectOpt = r?.correctOptions?.includes(oi)
                      return (
                        <li key={oi}>
                          <label
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                              result
                                ? isCorrectOpt
                                  ? 'border-brand-success/40 bg-brand-success/10 text-brand-textPrimary'
                                  : chosen
                                    ? 'border-brand-accent/40 bg-brand-accentLight'
                                    : 'border-brand-border text-brand-textSecondary'
                                : 'cursor-pointer border-brand-border hover:bg-brand-accentLight'
                            }`}
                          >
                            <input
                              type={q.type === 'multiple' ? 'checkbox' : 'radio'}
                              name={q._id}
                              checked={chosen}
                              onChange={() => setOptionAnswer(q._id, oi, q.type)}
                              disabled={Boolean(result)}
                            />
                            {o.text}
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {/* Feedback after submission */}
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
                    {q.type === 'numeric' && !r.correct && (
                      <span className="ml-2 text-brand-textSecondary">
                        Answer: {r.correctAnswer}
                      </span>
                    )}
                    {r.explanation && (
                      <p className="mt-1 text-brand-textSecondary">{r.explanation}</p>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ol>

        {/* Footer actions */}
        <div className="mt-8">
          {result ? (
            <Link
              href={`/learn/${courseId}`}
              className="inline-block rounded-lg bg-brand-accent px-6 py-3 font-medium text-white hover:bg-brand-accentDark"
            >
              Back to course
            </Link>
          ) : (
            questions.length > 0 && (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="rounded-lg bg-brand-accent px-6 py-3 font-medium text-white hover:bg-brand-accentDark disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit test'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
