/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import LogoutButton from '@/components/LogoutButton'
import AdminNav from '@/components/admin/AdminNav'
import { verifyAdminToken, ADMIN_TOKEN_NAME } from '@/lib/adminJwt'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = process.env.NODE_ENV === 'development' ? headers().get('x-pathname') || '' : headers().get('x-pathname') || ''
  if (pathname === '/admin/login') return children

  const cookieStore = cookies()
  const token = cookieStore.get(ADMIN_TOKEN_NAME)?.value

  if (!token) {
    redirect('/admin/login')
  }

  const verification = await verifyAdminToken(token!)
  if (!verification.valid) {
    redirect('/admin/login')
  }

  const role = verification.payload.role as string
  const permissions = (verification.payload.permissions as string[]) || []

  return (
    <div className="min-h-screen bg-brand-surface lg:flex">
      {/* Sidebar (top strip on mobile, fixed rail on desktop) */}
      <aside className="border-b border-brand-border bg-brand-primary lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <img src="/logo-full.png" alt="Daily Tutors" style={{ width: '200px', height: 'auto' }} />
            <span className="rounded-full bg-brand-accentLight px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-accentDark">
              {role === 'admin' ? 'Admin' : 'Co-Admin'}
            </span>
          </Link>
          <div className="lg:hidden">
            <LogoutButton />
          </div>
        </div>

        <AdminNav role={role} permissions={permissions} />

        <div className="mt-auto hidden border-t border-brand-border p-4 lg:block">
          <LogoutButton />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
