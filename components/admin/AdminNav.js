'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Library,
  Users,
  ClipboardList,
  GraduationCap,
  Shield,
  Settings2,
} from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true, permission: 'overview' },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen, permission: 'courses' },
  // Faculty-only reservoir of tagged questions. Not tied to a course and never
  // shown to students; the source pool for generated papers/worksheets/tests.
  { href: '/admin/question-bank', label: 'Question Bank', icon: Library, permission: 'question-bank' },
  { href: '/admin/site-settings', label: 'Site Settings', icon: Settings2, permission: 'overview' },
  { href: '/admin/users', label: 'Users', icon: Users, adminOnly: true, permission: 'users' },
  {
    href: '/admin/enrollments',
    label: 'Enrollments',
    icon: ClipboardList,
    adminOnly: true,
    permission: 'enrollments',
  },
  {
    href: '/admin/co-admins',
    label: 'Co-Admins',
    icon: Shield,
    adminOnly: true,
  },
  { href: '/dashboard', label: 'Student view', icon: GraduationCap },
]

export default function AdminNav({ role, permissions = [] }) {
  const pathname = usePathname()
  const links = NAV.filter((l) => {
    // Super-admin sees everything except co-admin specific items
    if (role === 'admin') return true
    
    // Co-admin: check adminOnly flag
    if (l.adminOnly && role !== 'admin') return false
    
    // Co-admin: check specific permissions
    if (role === 'co-admin' && l.permission) {
      return permissions.includes(l.permission)
    }
    
    return true
  })

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto px-2 pb-2 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
      {links.map((l) => {
        const active = l.exact
          ? pathname === l.href
          : pathname.startsWith(l.href)
        const Icon = l.icon
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-accent-gradient text-white shadow-accent'
                : 'text-brand-textSecondary hover:bg-brand-accentLight hover:text-brand-textPrimary'
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="whitespace-nowrap">{l.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
