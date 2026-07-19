'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { LogOut, Menu, X } from 'lucide-react'
import useAuthStatus from '@/components/useAuthStatus'

const DEFAULT_LINKS = [
  { label: 'Courses', href: '/courses' },
  { label: 'Learn', href: '/learn' },
  { label: 'Login', href: '/login' },
]

// Clears both the phone-OTP (auth_token) and Google (next-auth) sessions, then
// does a full reload so server components re-render logged out.
async function handleLogout() {
  try {
    await fetch('/api/logout', { method: 'POST' })
  } catch {}
  try {
    await signOut({ redirect: false })
  } catch {}
  window.location.href = '/'
}

// A link is a "login" link if it points at the login page — hidden once signed in.
function isLoginLink(link) {
  return link.href === '/login' || link.label?.toLowerCase() === 'login'
}

export default function SiteNavbar({ links = DEFAULT_LINKS }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { loading, authenticated } = useAuthStatus()

  // Hide the "Login" nav link once the user is signed in.
  const visibleLinks = authenticated ? links.filter((l) => !isLoginLink(l)) : links

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-brand-border bg-brand-primary/85 shadow-card backdrop-blur-xl'
          : 'border-transparent bg-brand-primary/60 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 py-3">
          <Link href="/" className="shrink-0" aria-label="Daily Tutors home">
            <img src="/logo-full.png" alt="Daily Tutors" className="h-9 w-auto sm:h-11" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {visibleLinks.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-brand-textSecondary transition hover:bg-brand-surface hover:text-brand-textPrimary"
              >
                {link.label}
              </Link>
            ))}
            {loading ? null : authenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="ml-2 inline-flex items-center justify-center gap-2 rounded-xl bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-accent transition-all hover:-translate-y-0.5 hover:shadow-accentLg"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-semibold text-brand-textPrimary transition hover:bg-brand-surface"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="ml-2 inline-flex items-center justify-center gap-2 rounded-xl bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-accent transition-all hover:-translate-y-0.5 hover:shadow-accentLg"
              >
                Sign in
              </Link>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-white/90 text-brand-textPrimary shadow-sm transition hover:bg-brand-surface md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-brand-accent" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 top-[var(--nav-h,64px)] z-40 md:hidden ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-brand-secondary/20 backdrop-blur-sm transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`relative mx-4 mt-3 origin-top rounded-3xl border border-brand-border bg-white p-4 shadow-cardHover transition-all duration-300 ${
            open ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
          }`}
        >
          <div className="space-y-1.5">
            {visibleLinks.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-brand-textSecondary transition hover:bg-brand-surface hover:text-brand-textPrimary"
              >
                {link.label}
              </Link>
            ))}
            {loading ? null : authenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-gradient px-4 py-3 text-sm font-semibold text-white shadow-accent"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    handleLogout()
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-textPrimary transition hover:bg-brand-surface"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-gradient px-4 py-3 text-sm font-semibold text-white shadow-accent"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
