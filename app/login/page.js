'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  LineChart,
  Radio,
} from 'lucide-react'

// This app only serves India, so every number is normalized to 10 local digits
// and sent with the +91 country code.
function normalizeIndianPhone(input) {
  let digits = String(input || '').replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2)
  else if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1)
  return digits
}

function isValidIndianMobile(tenDigits) {
  return /^[6-9]\d{9}$/.test(tenDigits)
}

// Where to send the user after a successful sign-in: the `callbackUrl` the
// middleware attached (the page they originally wanted), else the dashboard.
function getCallbackUrl() {
  if (typeof window === 'undefined') return '/dashboard'
  const cb = new URLSearchParams(window.location.search).get('callbackUrl')
  // Only allow same-site relative paths to avoid open-redirects.
  return cb && cb.startsWith('/') ? cb : '/dashboard'
}

const HIGHLIGHTS = [
  { icon: Radio, text: 'Live & recorded classes from expert mentors' },
  { icon: LineChart, text: 'Daily practice tests & performance tracking' },
  { icon: GraduationCap, text: 'Personalized mentorship for every goal' },
]

const STATS = [
  { value: '10k+', label: 'Learners' },
  { value: '200+', label: 'Lessons' },
  { value: '95%', label: 'Success mindset' },
]

export default function LoginPage() {
  const [phone, setPhone] = useState('') // 10-digit local part
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  // Already signed in? Don't show the login form — go straight through.
  useEffect(() => {
    getSession().then((session) => {
      if (session) window.location.href = getCallbackUrl()
    })
  }, [])

  async function sendOtp() {
    setError('')
    setInfo('')
    const local = normalizeIndianPhone(phone)
    if (!isValidIndianMobile(local)) {
      setError('Enter a valid 10-digit Indian mobile number (starting 6-9).')
      return
    }

    setBusy(true)
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: local }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setOtpSent(true)
        setInfo(data.message || 'OTP sent. Please check your phone.')
      } else {
        setError(data.message || 'Unable to send OTP. Please try again.')
      }
    } catch (err) {
      console.error('sendOtp error:', err)
      setError('Unable to send OTP. Please check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function verifyOtp(e) {
    e.preventDefault()
    setError('')
    if (!otpSent) {
      setError('Request an OTP first.')
      return
    }
    if (!otp.trim()) {
      setError('Enter the OTP code.')
      return
    }

    setBusy(true)
    try {
      const res = await signIn('phone-otp', {
        phone: normalizeIndianPhone(phone),
        otp: otp.trim(),
        redirect: false,
      })
      if (res?.ok) {
        window.location.href = getCallbackUrl()
      } else {
        setError('Invalid or expired OTP. Please try again.')
      }
    } catch (err) {
      console.error('verifyOtp error:', err)
      setError('Verification failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — brand showcase (desktop only) */}
      <div className="relative hidden overflow-hidden bg-accent-gradient p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {/* decorative glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-black/10 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
            <img src="/logo-full.png" alt="Daily Tutors" style={{ width: '200px', height: '50px' }} />
          </span>
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur">
            <Sparkles className="h-4 w-4" />
            India&apos;s smart learning platform
          </span>
          <h2 className="mt-6 max-w-md font-heading text-4xl font-bold leading-tight">
            Shape your future with Daily Tutors.
          </h2>
          <p className="mt-4 max-w-md text-base text-white/85">
            Sign in to continue your preparation — boards, NEET, JEE, CET, UPSC
            and more, all in one place.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon
              return (
                <li key={h.text} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm text-white/90">{h.text}</span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="relative grid max-w-md grid-cols-3 gap-4 border-t border-white/20 pt-6">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-heading text-2xl font-bold">{s.value}</p>
              <p className="mt-0.5 text-xs text-white/75">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — sign-in form */}
      <div className="flex items-center justify-center bg-brand-surface px-5 py-10 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          {/* mobile logo */}
          <Link href="/" className="mb-8 flex justify-center lg:hidden">
            <img src="/logo-full.png" alt="Daily Tutors" style={{ width: '200px', height: 'auto' }} />
          </Link>

          <div className="rounded-2xl border border-brand-border bg-brand-primary p-7 shadow-card sm:p-9">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accentLight text-brand-accent">
                {otpSent ? <ShieldCheck className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
              </span>
              <h1 className="mt-4 font-heading text-2xl font-bold text-brand-textPrimary">
                {otpSent ? 'Verify your number' : 'Sign in to continue'}
              </h1>
              <p className="mt-1.5 text-sm text-brand-textSecondary">
                {otpSent ? (
                  <>
                    Enter the 6-digit code sent to{' '}
                    <span className="font-semibold text-brand-textPrimary">
                      +91 {phone}
                    </span>
                  </>
                ) : (
                  'Use your mobile number to sign in securely.'
                )}
              </p>
            </div>

            <form onSubmit={verifyOtp} className="mt-7 space-y-4">
              {!otpSent ? (
                <>
                  <label className="block text-sm font-medium text-brand-textPrimary">
                    Phone number
                    <div className="mt-1.5 flex items-stretch overflow-hidden rounded-xl border border-brand-border bg-white transition focus-within:border-brand-accent focus-within:ring-2 focus-within:ring-brand-accent/20">
                      <span className="flex select-none items-center gap-1 border-r border-brand-border px-3.5 text-sm font-medium text-brand-textSecondary">
                        🇮🇳 +91
                      </span>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="98765 43210"
                        inputMode="numeric"
                        maxLength={10}
                        autoFocus
                        className="w-full px-3.5 py-3 text-sm outline-none"
                        autoComplete="tel-national"
                      />
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={busy}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-accent-gradient px-5 py-3 font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending OTP…
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    className="w-full rounded-xl border border-brand-border bg-white py-3.5 text-center text-2xl font-semibold tracking-[0.5em] text-brand-textPrimary outline-none transition placeholder:tracking-[0.4em] placeholder:text-brand-border focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
                    autoComplete="one-time-code"
                  />

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false)
                        setOtp('')
                        setInfo('')
                        setError('')
                      }}
                      className="text-brand-textSecondary transition hover:text-brand-textPrimary"
                    >
                      ← Change number
                    </button>
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={busy}
                      className="font-semibold text-brand-accent transition hover:text-brand-accentDark disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={busy || !otp}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-gradient px-5 py-3 font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                      </>
                    ) : (
                      'Verify OTP & sign in'
                    )}
                  </button>
                </>
              )}

              {info && (
                <p className="flex items-center gap-2 rounded-lg bg-brand-success/10 px-3 py-2 text-sm font-medium text-brand-success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {info}
                </p>
              )}
              {error && (
                <p className="rounded-lg bg-brand-accentLight px-3 py-2 text-sm font-medium text-brand-accentDark">
                  {error}
                </p>
              )}
            </form>

            {/* divider */}
            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-brand-border" />
              <span className="text-xs font-medium uppercase tracking-wide text-brand-textSecondary">
                or
              </span>
              <span className="h-px flex-1 bg-brand-border" />
            </div>

            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: getCallbackUrl() })}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-textPrimary transition hover:bg-brand-surface"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-brand-textSecondary">
            By continuing you agree to our Terms & Privacy Policy.
          </p>
          <Link
            href="/"
            className="mt-3 block text-center text-sm font-medium text-brand-textSecondary transition hover:text-brand-textPrimary"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
