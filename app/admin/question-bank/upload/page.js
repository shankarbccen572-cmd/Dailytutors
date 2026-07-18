import { redirect } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import BankSubject from '@/models/BankSubject'
import { serialize } from '@/lib/utils'
import { getAdminSession } from '@/lib/admin'
import QuestionBankManager from '@/components/admin/QuestionBankManager'
import QuestionBankTabs from '@/components/admin/QuestionBankTabs'

export const dynamic = 'force-dynamic'

export default async function QuestionBankUploadPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  await dbConnect()
  const subjects = serialize(
    await BankSubject.find().sort({ order: 1, createdAt: 1 }).lean()
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-textPrimary">
          Upload questions
        </h1>
        <p className="text-sm text-brand-textSecondary">
          Pick a subject, chapter and topic on the left, then add questions individually or bulk-import a spreadsheet.
        </p>
      </div>
      <QuestionBankTabs />
      <QuestionBankManager initialSubjects={subjects} initialMode="upload" />
    </div>
  )
}
