/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { serialize } from '@/lib/utils'
import DashboardNav from '@/components/dashboard/DashboardNav'
import LogoutButton from '@/components/LogoutButton'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }) {
  const userDoc = await getCurrentUser()
  if (!userDoc) redirect('/login')
  const user = serialize(userDoc)

  return (
    <div className="min-h-screen bg-brand-surface">
      <header className="sticky top-0 z-20 border-b border-brand-border bg-brand-primary/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-3.5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/dashboard">
              <img
                src="/logo-full.png"
                alt="Daily Tutors"
                style={{ width: '200px', height: 'auto' }}
              />
            </Link>
            <div className="flex items-center gap-3 md:hidden">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="h-8 w-8 rounded-full border border-brand-border"
                />
              ) : null}
              <LogoutButton />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 md:gap-6">
            <DashboardNav />
            <div className="hidden items-center gap-3 md:flex">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="h-8 w-8 rounded-full border border-brand-border"
                />
              ) : null}
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
