/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputCls =
  'mt-1 w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm outline-none focus:border-brand-accent'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password }),
      })

      if (!res.ok) {
        const payload = await res.json()
        setError(payload.error || 'Invalid login ID or password')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError('Unable to sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-accentLight/20 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-primary p-8 shadow-sm">
        <Link href="/" className="flex justify-center">
          <img src="/logo-full.png" alt="Daily Tutors" style={{ width: '200px', height: 'auto' }} />
        </Link>
        <h1 className="mt-6 text-center font-heading text-xl font-bold text-brand-textPrimary">
          Admin Login
        </h1>
        <p className="mt-1 text-center text-sm text-brand-textSecondary">
          Admin &amp; faculty sign in with their login ID
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-brand-textPrimary">
            Login ID
            <input
              className={inputCls}
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="e.g. admin"
              autoComplete="username"
              autoFocus
            />
          </label>
          <label className="block text-sm font-medium text-brand-textPrimary">
            Password
            <input
              type="password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="text-sm font-medium text-brand-accent">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy || !loginId || !password}
            className="w-full rounded-lg bg-brand-accent px-5 py-2.5 font-medium text-white hover:bg-brand-accentDark disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-brand-textSecondary hover:text-brand-textPrimary"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
