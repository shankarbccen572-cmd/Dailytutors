'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteCourseButton({ id, title }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (
      !confirm(
        `Delete "${title}"? This also removes its sections and lessons. This cannot be undone.`
      )
    ) {
      return
    }
    setLoading(true)
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) router.refresh()
    else alert('Delete failed')
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-md border border-brand-border px-3 py-1.5 text-sm font-medium text-brand-accent transition-colors hover:bg-brand-accentLight disabled:opacity-50"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  )
}
