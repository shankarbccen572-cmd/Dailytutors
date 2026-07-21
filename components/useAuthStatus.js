'use client'

import { useAuth } from './AuthProvider'

// Deprecated: useAuthStatus delegates to the centralized AuthProvider for
// a single source of truth across the app. Kept for compatibility.
export default function useAuthStatus() {
  const { loading, authenticated, user } = useAuth()
  return { loading, authenticated, user }
}
