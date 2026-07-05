'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GraduationCap, Compass, User } from 'lucide-react'

const BASE_LINKS = [
  { href: '/dashboard', label: 'My Learning', icon: GraduationCap, exact: true },
  { href: '/courses', label: 'Browse Courses', icon: Compass },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
]

export default function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap gap-1">
      {BASE_LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
        const Icon = l.icon
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-accent-gradient text-white shadow-accent'
                : 'text-brand-textSecondary hover:bg-brand-accentLight hover:text-brand-textPrimary'
            }`}
          >
            <Icon className="h-4 w-4" />
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
