'use client'

/* eslint-disable @next/next/no-img-element */
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2, UserRound } from 'lucide-react'

function getSafeCallback(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/courses'
}

// A phone-OTP account starts with a synthetic email and its name defaulted to
// the phone number — treat both as "not filled in yet" so the form is blank.
function isPlaceholderEmail(email) {
  return !email || email.endsWith('@phone.dailytutors.local')
}
function isPlaceholderName(name) {
  return !name || /^\+?\d[\d\s-]*$/.test(name)
}

function CompleteProfileForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = getSafeCallback(searchParams.get('callbackUrl'))

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isGoogleUser, setIsGoogleUser] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })

  // Prefill from the current account so the student only fills what's missing.
  useEffect(() => {
    let active = true
    fetch('/api/profile')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
          return null
        }
        return res.ok ? res.json() : null
      })
      .then((data) => {
        if (!active || !data) return
        setIsGoogleUser(Boolean(data.googleId))
        setForm({
          name: isPlaceholderName(data.name) ? '' : data.name,
          phone: data.phone || '',
          email: isPlaceholderEmail(data.email) ? '' : data.email,
        })
        setLoading(false)
      })
      .catch(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [callbackUrl])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        router.replace(callbackUrl)
      } else {
        setError(data.error || 'Could not save your details. Please try again.')
        setSaving(false)
      }
    } catch (err) {
      console.error('complete-profile submit error:', err)
      setError('Could not save your details. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-surface px-5 py-10 sm:px-8">
      <div className="w-full max-w-md animate-fade-up">
        <Link href="/" className="mb-8 flex justify-center">
          <img src="/logo-full.png" alt="Daily Tutors" style={{ width: '200px', height: 'auto' }} />
        </Link>

        <div className="rounded-2xl border border-brand-border bg-brand-primary p-7 shadow-card sm:p-9">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accentLight text-brand-accent">
              <UserRound className="h-6 w-6" />
            </span>
            <h1 className="mt-4 font-heading text-2xl font-bold text-brand-textPrimary">
              Complete your details
            </h1>
            <p className="mt-1.5 text-sm text-brand-textSecondary">
              Tell us a little about you to continue to your courses.
            </p>
          </div>

          {loading ? (
            <div className="mt-8 flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-7 space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-brand-textPrimary">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-textPrimary outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accentLight"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-brand-textPrimary">
                  Mobile number
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-textPrimary outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accentLight"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-brand-textPrimary">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={update('email')}
                  disabled={isGoogleUser}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-textPrimary outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accentLight disabled:cursor-not-allowed disabled:bg-brand-surface disabled:text-brand-textSecondary"
                />
                {isGoogleUser && (
                  <p className="mt-1.5 text-xs text-brand-textSecondary">
                    Linked to your Google account.
                  </p>
                )}
              </div>

              {error && (
                <p className="rounded-lg bg-brand-accentLight px-3 py-2 text-sm font-medium text-brand-accentDark">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-accent-gradient px-5 py-3 font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={null}>
      <CompleteProfileForm />
    </Suspense>
  )
}
