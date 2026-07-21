'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('daily-tutors-cookie-consent')
    if (!stored) {
      const timer = window.setTimeout(() => setVisible(true), 700)
      return () => window.clearTimeout(timer)
    }
  }, [])

  const handleChoice = (choice) => {
    window.localStorage.setItem('daily-tutors-cookie-consent', choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft backdrop to draw focus to the centered card */}
      <div className="absolute inset-0 animate-fade-in bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cookie consent"
        className="relative w-full max-w-sm animate-scale-in rounded-2xl border border-brand-border bg-white p-5 text-center shadow-cardHover"
      >
        <p className="font-heading text-base font-semibold text-brand-textPrimary">We use cookies</p>
        <p className="mx-auto mt-1.5 max-w-xs text-sm leading-6 text-brand-textSecondary">
          We use cookies to keep the platform secure and personalize your learning. You can change your choice anytime.
        </p>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => handleChoice('reject')}
            className="w-full rounded-full border border-brand-border px-4 py-2 text-sm font-semibold text-brand-textSecondary transition hover:border-brand-accent hover:text-brand-accent sm:w-auto"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => handleChoice('accept')}
            className="w-full rounded-full bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accentDark sm:w-auto"
          >
            Accept
          </button>
        </div>
        <Link
          href="/cookie-policy"
          className="mt-3 inline-block text-xs font-medium text-brand-textSecondary underline underline-offset-2 transition hover:text-brand-accent"
        >
          Learn more
        </Link>
      </div>
    </div>
  )
}
