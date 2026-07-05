'use client'

import { useState } from 'react'

// A standalone Draft/Published toggle for one course content area (curriculum
// or important questions). PATCHes a single boolean field on the course.
export default function PublishControl({ courseId, field, initial, noun = 'content' }) {
  const [published, setPublished] = useState(Boolean(initial))
  const [saving, setSaving] = useState(false)

  async function toggle() {
    const next = !published
    setSaving(true)
    const res = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: next }),
    })
    setSaving(false)
    if (res.ok) setPublished(next)
    else alert('Could not update publish status')
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          published
            ? 'bg-brand-success/15 text-brand-success'
            : 'bg-brand-accentLight text-brand-accentDark'
        }`}
      >
        {published ? 'Published' : 'Draft'}
      </span>
      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        className={`rounded-md px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50 ${
          published
            ? 'bg-brand-textSecondary hover:opacity-90'
            : 'bg-brand-success hover:opacity-90'
        }`}
      >
        {saving
          ? 'Saving…'
          : published
            ? `Unpublish ${noun}`
            : `Publish ${noun}`}
      </button>
    </div>
  )
}
