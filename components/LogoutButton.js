'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

export default function LogoutButton() {
  const router = useRouter()
  const pathname = usePathname()
  const redirectTo = pathname?.startsWith('/admin') ? '/admin/login' : '/login'
  const { signOut } = useAuth()

  async function handleLogout() {
    await signOut({ redirect: redirectTo })
    // signOut will redirect, but ensure router state is updated in case it didn't
    try {
      router.push(redirectTo)
    } catch (e) {}
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-accentDark"
    >
      Log out
    </button>
  )
}
