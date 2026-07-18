'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Upload, FileText, FolderOpen } from 'lucide-react'

// Shared sub-navigation for the Question Bank section. Rendered at the top of
// every question-bank page so Upload / Generate / Saved Papers feel like
// distinct-but-connected pages and the user always knows where they are.
const TABS = [
  { href: '/admin/question-bank', label: 'Overview', icon: LayoutGrid, exact: true },
  { href: '/admin/question-bank/upload', label: 'Upload questions', icon: Upload },
  { href: '/admin/question-bank/generate', label: 'Generate paper', icon: FileText },
  { href: '/admin/question-bank/papers', label: 'Saved papers', icon: FolderOpen },
]

export default function QuestionBankTabs() {
  const pathname = usePathname()

  function isActive(tab) {
    if (tab.exact) return pathname === tab.href
    return pathname === tab.href || pathname.startsWith(`${tab.href}/`)
  }

  return (
    <nav className="mb-6 flex flex-wrap gap-1.5 rounded-2xl border border-brand-border bg-white p-1.5 shadow-card">
      {TABS.map((tab) => {
        const active = isActive(tab)
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? 'bg-accent-gradient text-white shadow-accent'
                : 'text-brand-textSecondary hover:bg-brand-accentLight/40 hover:text-brand-textPrimary'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
