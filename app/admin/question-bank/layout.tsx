'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/admin/question-bank', label: 'Overview' },
  { href: '/admin/question-bank/upload', label: 'Upload' },
  { href: '/admin/question-bank/generate', label: 'Generate' },
]

export default function QuestionBankLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-brand-border bg-white p-4 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <h1 className="text-xl font-bold text-brand-textPrimary">Question Bank</h1>
          <p className="mt-1 text-sm text-brand-textSecondary">
            Build and manage your question bank, then generate question papers from it.
          </p>
        </div>
      </div>

      <div className="grid gap-3 rounded-3xl border border-brand-border bg-white p-2 sm:grid-cols-3">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-2xl px-4 py-3 text-center text-sm font-semibold transition ${
                active
                  ? 'bg-brand-primary text-white shadow-cardHover'
                  : 'text-brand-textSecondary hover:bg-brand-accentLight hover:text-brand-textPrimary'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm">{children}</div>
    </div>
  )
}
