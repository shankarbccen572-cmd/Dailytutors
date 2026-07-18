import { redirect } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import BankSubject from '@/models/BankSubject'
import { serialize } from '@/lib/utils'
import { getAdminSession } from '@/lib/admin'
import QuestionBankManager from '@/components/admin/QuestionBankManager'
import QuestionBankTabs from '@/components/admin/QuestionBankTabs'

export const dynamic = 'force-dynamic'

export default async function QuestionBankGeneratePage() {
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
          Generate question paper
        </h1>
        <p className="text-sm text-brand-textSecondary">
          Choose a subject and chapter, select questions from the bank, then set the paper details and save it.
        </p>
      </div>
      <QuestionBankTabs />
      <QuestionBankManager initialSubjects={subjects} initialMode="generate" />
    </div>
  )
}
