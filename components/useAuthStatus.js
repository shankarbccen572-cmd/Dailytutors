'use client'

import { useEffect, useState } from 'react'

// Fetches the current auth state from /api/me. Covers both Google and phone-OTP
// logins (next-auth's useSession only knows about Google).
export default function useAuthStatus() {
  const [state, setState] = useState({ loading: true, authenticated: false, user: null })

  useEffect(() => {
    let active = true
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : { authenticated: false }))
      .then((d) => {
        if (active) setState({ loading: false, authenticated: Boolean(d.authenticated), user: d })
      })
      .catch(() => {
        if (active) setState({ loading: false, authenticated: false, user: null })
      })
    return () => {
      active = false
    }
  }, [])

  return state
}
