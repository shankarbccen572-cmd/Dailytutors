import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function QuestionBankPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-textPrimary">
            Question Bank
          </h1>
          <p className="text-sm text-brand-textSecondary max-w-2xl">
            Manage your question repository and generate exam papers from the
            tagged bank. Use the tabs below to upload questions or create
            question papers from your existing bank.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/question-bank/upload"
          className="rounded-3xl border border-brand-border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-cardHover"
        >
          <p className="text-sm font-semibold text-brand-textPrimary">Upload Questions</p>
          <p className="mt-3 text-sm leading-6 text-brand-textSecondary">
            Add new questions, edit existing ones, and keep your bank organized
            by subject, chapter, and topic.
          </p>
        </Link>

        <Link
          href="/admin/question-bank/generate"
          className="rounded-3xl border border-brand-border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-cardHover"
        >
          <p className="text-sm font-semibold text-brand-textPrimary">Generate Question Paper</p>
          <p className="mt-3 text-sm leading-6 text-brand-textSecondary">
            Create new question papers from the bank using filters, difficulty,
            and question count settings.
          </p>
        </Link>
      </div>
    </div>
  )
}
