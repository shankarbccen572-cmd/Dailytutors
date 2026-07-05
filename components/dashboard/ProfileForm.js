'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings2, Info } from 'lucide-react'

const inputCls =
  'w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/15'
const labelCls = 'block text-sm font-medium text-brand-textPrimary'

export default function ProfileForm({ initialData }) {
  const router = useRouter()
  const [form, setForm] = useState({
    phone: initialData?.phone || '',
    city: initialData?.city || '',
    examTarget: initialData?.examTarget || '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function onSubmit(e) {
    e.preventDefault()
    setMsg('')
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Save failed')
      }
      setMsg('Profile saved ✓')
      router.refresh()
    } catch (e2) {
      setError(e2.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-brand-border bg-white p-6 shadow-card"
    >
      <div className="flex items-center gap-2">
        <Settings2 className="h-5 w-5 text-brand-accent" />
        <div>
          <h2 className="font-heading text-lg font-bold text-brand-textPrimary">
            Additional details
          </h2>
          <p className="text-sm text-brand-textSecondary">
            Optional info to personalise your learning.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelCls}>Phone</label>
          <input
            className={inputCls}
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="10-digit number"
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>City</label>
          <input
            className={inputCls}
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="e.g. Hyderabad"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}>Exam target</label>
        <input
          className={inputCls}
          value={form.examTarget}
          onChange={(e) => update('examTarget', e.target.value)}
          placeholder="e.g. UPSC CSE 2027"
        />
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-brand-surface px-3 py-2 text-xs text-brand-textSecondary">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Your name, email and photo come from your Google account. To change them,
        update your Google profile and sign in again.
      </p>

      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-accent-gradient px-6 py-2.5 font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {msg && <span className="text-sm font-medium text-brand-success">{msg}</span>}
        {error && <span className="text-sm font-medium text-brand-accent">{error}</span>}
      </div>
    </form>
  )
}
