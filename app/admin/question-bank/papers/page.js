import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin'
import PapersManager from '@/components/admin/PapersManager'
import QuestionBankTabs from '@/components/admin/QuestionBankTabs'

export const dynamic = 'force-dynamic'

export default async function SavedPapersPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-textPrimary">
          Saved question papers
        </h1>
        <p className="text-sm text-brand-textSecondary">
          Download (PDF / Word, with or without answer key), publish, duplicate or delete your papers.
        </p>
      </div>
      <QuestionBankTabs />
      <PapersManager />
    </div>
  )
}
