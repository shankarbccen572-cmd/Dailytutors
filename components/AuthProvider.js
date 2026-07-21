'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

const AuthContext = createContext({ loading: true, authenticated: false, user: null })

export function AuthProvider({ children }) {
  const { data: session, status } = useSession()
  const [state, setState] = useState({ loading: true, authenticated: false, user: null })

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/me')
      if (!res.ok) {
        setState({ loading: false, authenticated: false, user: null })
        return
      }
      const data = await res.json()
      if (data && data.authenticated) {
        setState({ loading: false, authenticated: true, user: data })
      } else {
        setState({ loading: false, authenticated: false, user: null })
      }
    } catch (err) {
      setState({ loading: false, authenticated: false, user: null })
    }
  }, [])

  useEffect(() => {
    // Always probe server-side auth state once on mount and whenever next-auth session status changes.
    fetchMe()
  }, [fetchMe, status])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'auth:changed') fetchMe()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [fetchMe])

  const signOut = useCallback(async (opts) => {
    try {
      // Clear server cookies first
      await fetch('/api/logout', { method: 'POST' })
    } catch (e) {}
    try {
      await nextAuthSignOut({ redirect: false })
    } catch (e) {}
    // notify other tabs
    try {
      localStorage.setItem('auth:changed', Date.now().toString())
    } catch (e) {}
    // final client state update
    setState({ loading: false, authenticated: false, user: null })
    if (opts?.redirect) window.location.href = opts.redirect
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthProvider
