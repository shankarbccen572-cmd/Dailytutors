'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const pathname = usePathname()
  const redirectTo = pathname?.startsWith('/admin') ? '/admin/login' : '/login'

  async function handleLogout() {
    await fetch(`/api/logout?redirect=${encodeURIComponent(redirectTo)}`, {
      method: 'POST',
    })
    router.push(redirectTo)
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
