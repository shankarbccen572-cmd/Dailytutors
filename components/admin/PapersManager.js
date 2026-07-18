'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Copy, Trash2, Send, History } from 'lucide-react'

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

export default function PapersManager() {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [answerKey, setAnswerKey] = useState(false)
  const [error, setError] = useState('')

  async function reload() {
    setLoading(true)
    try {
      const data = await api('/api/question-bank/papers')
      setPapers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    reload()
  }, [])

  async function publish(id) {
    const updated = await api(`/api/question-bank/papers/${id}`, 'PATCH', { action: 'publish' })
    setPapers((p) => p.map((x) => (x._id === id ? { ...x, status: updated.status } : x)))
  }
  async function duplicate(id) {
    await api(`/api/question-bank/papers/${id}`, 'PATCH', { action: 'duplicate' })
    reload()
  }
  async function remove(id) {
    if (!confirm('Delete this paper? This cannot be undone.')) return
    await api(`/api/question-bank/papers/${id}`, 'DELETE')
    setPapers((p) => p.filter((x) => x._id !== id))
  }

  const exportUrl = (id, format) =>
    `/api/question-bank/papers/${id}/export?format=${format}&answerKey=${answerKey}`

  if (loading) return <p className="text-sm text-brand-textSecondary">Loading papers…</p>
  if (error) return <p className="text-sm text-brand-accent">{error}</p>

  if (papers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-border bg-white p-12 text-center shadow-card">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accentLight text-brand-accent">
          <FileText className="h-6 w-6" />
        </span>
        <p className="mt-4 text-brand-textSecondary">
          No saved papers yet. Generate one from the Question Bank and click “Save”.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <label className="inline-flex items-center gap-2 text-sm text-brand-textSecondary">
        <input
          type="checkbox"
          checked={answerKey}
          onChange={(e) => setAnswerKey(e.target.checked)}
          className="h-4 w-4 rounded border-brand-border text-brand-accent"
        />
        Include answer key in downloads
      </label>

      <div className="overflow-x-auto rounded-2xl border border-brand-border bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-brand-border bg-brand-surface text-xs uppercase tracking-wide text-brand-textSecondary">
            <tr>
              <th className="px-4 py-3 font-semibold">Paper</th>
              <th className="px-4 py-3 font-semibold">Category / Subject</th>
              <th className="px-4 py-3 font-semibold">Q · Marks</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((p) => (
              <tr key={p._id} className="border-b border-brand-border last:border-0 hover:bg-brand-surface">
                <td className="px-4 py-3">
                  <div className="font-medium text-brand-textPrimary">{p.title}</div>
                  <div className="flex items-center gap-1 text-xs text-brand-textSecondary">
                    <History className="h-3 w-3" /> v{p.version} · updated{' '}
                    {new Date(p.updatedAt).toLocaleDateString('en-IN')}
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-textSecondary">
                  {[p.category, p.subject].filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="px-4 py-3 text-brand-textSecondary">
                  {p.totalQuestions} · {p.totalMarks}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      p.status === 'published'
                        ? 'bg-brand-success/15 text-brand-success'
                        : 'bg-brand-border/60 text-brand-textSecondary'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <a
                      href={exportUrl(p._id, 'pdf')}
                      className="inline-flex items-center gap-1 rounded-lg bg-accent-gradient px-2.5 py-1.5 text-xs font-semibold text-white shadow-accent"
                    >
                      <Download className="h-3.5 w-3.5" /> PDF
                    </a>
                    <a
                      href={exportUrl(p._id, 'docx')}
                      className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-textPrimary shadow-card"
                    >
                      <Download className="h-3.5 w-3.5" /> Word
                    </a>
                    {p.status === 'draft' && (
                      <button
                        onClick={() => publish(p._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-success"
                        title="Publish"
                      >
                        <Send className="h-3.5 w-3.5" /> Publish
                      </button>
                    )}
                    <button
                      onClick={() => duplicate(p._id)}
                      className="rounded-lg border border-brand-border bg-white p-1.5 text-brand-textSecondary hover:text-brand-textPrimary"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => remove(p._id)}
                      className="rounded-lg border border-brand-border bg-white p-1.5 text-brand-textSecondary hover:text-brand-accent"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
