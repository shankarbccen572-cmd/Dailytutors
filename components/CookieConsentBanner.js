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
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-4xl -translate-x-1/2 animate-fade-up rounded-3xl border border-brand-border bg-white/95 p-4 shadow-cardHover backdrop-blur xl:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-heading text-lg font-semibold text-brand-textPrimary">We use cookies to improve your experience</p>
          <p className="mt-2 text-sm leading-7 text-brand-textSecondary">
            We use essential, analytics, and functional cookies to keep the platform secure and personalize your learning journey. You can manage your choice anytime.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleChoice('reject')}
            className="rounded-full border border-brand-border px-4 py-2 text-sm font-semibold text-brand-textSecondary transition hover:border-brand-accent hover:text-brand-accent"
          >
            Reject
          </button>
          <Link
            href="/cookie-policy"
            className="rounded-full border border-brand-border px-4 py-2 text-sm font-semibold text-brand-textSecondary transition hover:border-brand-accent hover:text-brand-accent"
          >
            Learn More
          </Link>
          <button
            type="button"
            onClick={() => handleChoice('accept')}
            className="rounded-full bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accentDark"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
