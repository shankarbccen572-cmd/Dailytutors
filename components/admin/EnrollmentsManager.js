'use client'

import { useState } from 'react'

const inputCls =
  'rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-accent'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function EnrollmentsManager({ initialEnrollments, users, courses }) {
  const [enrollments, setEnrollments] = useState(initialEnrollments)
  const [userId, setUserId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [busy, setBusy] = useState(false)

  async function add() {
    if (!userId || !courseId) return
    setBusy(true)
    const res = await fetch('/api/admin/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, courseId }),
    })
    setBusy(false)
    if (res.ok) {
      const e = await res.json()
      setEnrollments((p) => [e, ...p])
      setUserId('')
      setCourseId('')
    } else {
      const { error } = await res.json().catch(() => ({}))
      alert(error || 'Could not enroll')
    }
  }

  async function remove(id, name) {
    if (!confirm(`Remove enrollment for ${name || 'this user'}?`)) return
    const res = await fetch(`/api/admin/enrollments/${id}`, { method: 'DELETE' })
    if (res.ok) setEnrollments((p) => p.filter((e) => e._id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Add enrollment */}
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-brand-border bg-brand-primary p-4 sm:flex-row sm:items-center">
        <select
          className={inputCls}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >
          <option value="">Select user…</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name || u.email} ({u.email})
            </option>
          ))}
        </select>
        <select
          className={inputCls}
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          <option value="">Select course…</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
              {c.status !== 'published' ? ` (${c.status})` : ''}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          disabled={busy || !userId || !courseId}
          className="shrink-0 rounded-lg bg-brand-accent px-5 py-2 text-sm font-medium text-white hover:bg-brand-accentDark disabled:opacity-50"
        >
          {busy ? 'Enrolling…' : '+ Enroll user'}
        </button>
      </div>

      {/* List */}
      {enrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-brand-primary p-12 text-center text-brand-textSecondary">
          No enrollments yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-primary">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-brand-border text-brand-textSecondary">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium">Enrolled</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e._id} className="border-b border-brand-border last:border-0">
                  <td className="px-4 py-3 text-brand-textPrimary">
                    <span className="font-medium">{e.userId?.name || '—'}</span>
                    <span className="block text-xs text-brand-textSecondary">
                      {e.userId?.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-textPrimary">
                    {e.courseId?.title || '—'}
                  </td>
                  <td className="px-4 py-3 text-brand-textSecondary">
                    {e.progress || 0}%
                  </td>
                  <td className="px-4 py-3 text-brand-textSecondary">
                    {formatDate(e.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(e._id, e.userId?.name)}
                      className="rounded-md border border-brand-border px-3 py-1.5 text-sm font-medium text-brand-accent hover:bg-brand-accentLight"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
