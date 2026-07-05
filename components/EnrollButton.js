'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EnrollButton({ courseId, enrolled, className = '' }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  if (enrolled) {
    return (
      <button
        type="button"
        onClick={() => router.push(`/learn/${courseId}`)}
        className={className}
      >
        Go to course →
      </button>
    )
  }

  async function enroll() {
    setBusy(true)
    const res = await fetch('/api/enrollment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    })
    setBusy(false)
    if (res.ok) {
      router.push(`/learn/${courseId}`)
    } else {
      const { error } = await res.json().catch(() => ({}))
      alert(error || 'Could not enroll')
    }
  }

  return (
    <button type="button" onClick={enroll} disabled={busy} className={className}>
      {busy ? 'Enrolling…' : 'Enroll now'}
    </button>
  )
}
