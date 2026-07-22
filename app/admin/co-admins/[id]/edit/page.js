'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

const inputCls = 'w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-accent'
const labelCls = 'block text-sm font-medium text-brand-textPrimary'

const SECTIONS = [
  { id: 'overview', label: 'Overview', description: 'View admin dashboard overview' },
  { id: 'courses', label: 'Courses', description: 'Create, edit, and manage courses' },
  { id: 'enrollments', label: 'Enrollments', description: 'View and manage student enrollments' },
  { id: 'users', label: 'Users', description: 'Manage user accounts' },
]

function Field({ label, children, error }) {
  return (
    <div className="space-y-1.5">
      <label className={labelCls}>{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function EditCoAdminPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    managedCategories: [],
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const loadCoAdmin = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/co-admins`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const admin = data.coAdmins.find((a) => a._id === id)
      if (!admin) throw new Error('Co-admin not found')

      setForm({
        name: admin.name,
        email: admin.email,
        password: '',
        managedCategories: admin.permissions,
      })
    } catch (err) {
      setErrors({ load: err.message })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadCoAdmin()
  }, [loadCoAdmin])

  function togglePermission(id) {
    setForm((f) => ({
      ...f,
      managedCategories: f.managedCategories.includes(id)
        ? f.managedCategories.filter((p) => p !== id)
        : [...f.managedCategories, id],
    }))
  }

  async function save() {
    const newErrors = {}
    if (!form.name) newErrors.name = 'Name required'
    if (!form.email || !form.email.includes('@')) newErrors.email = 'Valid email required'
    if (form.managedCategories.length === 0) newErrors.permissions = 'Assign at least one section'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      setSaving(true)
      const res = await fetch(`/api/admin/co-admins/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password || undefined,
          managedCategories: form.managedCategories,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      alert('Co-admin updated successfully!')
      router.push('/admin/co-admins')
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>
  if (errors.load) return <div className="p-6 text-center text-red-600">{errors.load}</div>

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brand-textPrimary">
          Edit Co-Admin
        </h1>
        <p className="mt-1 text-sm text-brand-textSecondary">
          Update co-admin details and section access
        </p>
      </div>

      <div className="space-y-6 rounded-xl border border-brand-border bg-white p-6 shadow-card">
        {errors.submit && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {errors.submit}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" error={errors.name}>
            <input
              type="text"
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              className={inputCls}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </Field>

          <Field label="New Password (leave blank to keep current)">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={inputCls}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-textSecondary hover:text-brand-textPrimary transition"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </Field>
        </div>

        <div>
          <Field label="Section Access" error={errors.permissions}>
            <div className="space-y-2 rounded-lg border border-brand-border p-4 bg-brand-surface">
              {SECTIONS.map((section) => (
                <label key={section.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={form.managedCategories.includes(section.id)}
                    onChange={() => togglePermission(section.id)}
                    className="mt-1 rounded border-brand-border"
                  />
                  <div>
                    <p className="font-medium text-brand-textPrimary">{section.label}</p>
                    <p className="text-xs text-brand-textSecondary">{section.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </Field>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => router.back()}
            className="flex-1 rounded-lg border border-brand-border px-4 py-2 font-semibold text-brand-textPrimary hover:bg-brand-surface"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
