import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin'
import QuestionBankTabs from '@/components/admin/QuestionBankTabs'
import { Upload, FileText, FolderOpen, ArrowRight, ListChecks, Sparkles, Download } from 'lucide-react'

export const dynamic = 'force-dynamic'

const CARDS = [
  {
    href: '/admin/question-bank/upload',
    icon: Upload,
    title: 'Upload questions',
    desc: 'Add questions one by one or import a whole spreadsheet. Organise them by subject, chapter and topic.',
    cta: 'Manage questions',
  },
  {
    href: '/admin/question-bank/generate',
    icon: FileText,
    title: 'Generate paper',
    desc: 'Pick a subject and chapter, choose the questions, add a header and answer key, then save the paper.',
    cta: 'Create a paper',
  },
  {
    href: '/admin/question-bank/papers',
    icon: FolderOpen,
    title: 'Saved papers',
    desc: 'Download your papers as PDF or Word (with or without answer key), publish, duplicate or delete them.',
    cta: 'View saved papers',
  },
]

const STEPS = [
  { icon: ListChecks, title: '1. Build your bank', desc: 'Create subjects, chapters and topics, then add questions or bulk-import them from Excel/CSV.' },
  { icon: Sparkles, title: '2. Generate a paper', desc: 'Filter the bank, select questions, and set the paper title, instructions and answer key.' },
  { icon: Download, title: '3. Export & share', desc: 'Download the finished paper as PDF or Word, or publish it for reuse.' },
]

export default async function QuestionBankPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-textPrimary">Question Bank</h1>
        <p className="max-w-2xl text-sm text-brand-textSecondary">
          Build and manage your question bank, then generate exam papers from it. Choose what you want to do below.
        </p>
      </div>

      <QuestionBankTabs />

      {/* Action cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {CARDS.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col rounded-3xl border border-brand-border bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-cardHover"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accentLight text-brand-accent">
                <Icon className="h-6 w-6" />
              </span>
              <p className="mt-4 text-base font-semibold text-brand-textPrimary">{card.title}</p>
              <p className="mt-2 flex-1 text-sm leading-6 text-brand-textSecondary">{card.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-accent">
                {card.cta}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          )
        })}
      </div>

      {/* How it works */}
      <div className="mt-8 rounded-3xl border border-brand-border bg-white p-6 shadow-card">
        <h2 className="text-base font-semibold text-brand-textPrimary">How it works</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="rounded-2xl border border-brand-border bg-brand-accentLight/10 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-accent shadow-card">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-brand-textPrimary">{step.title}</p>
                <p className="mt-1 text-sm leading-6 text-brand-textSecondary">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
