import { redirect } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import BankSubject from '@/models/BankSubject'
import { serialize } from '@/lib/utils'
import { getAdminSession } from '@/lib/admin'
import QuestionBankManager from '@/components/admin/QuestionBankManager'

export const dynamic = 'force-dynamic'

export default async function QuestionBankAddPage({ searchParams }) {
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
          Question Bank
        </h1>
        <p className="text-sm text-brand-textSecondary">
          Add a new question to the selected subject, chapter and topic.
        </p>
      </div>
      <QuestionBankManager
        initialSubjects={subjects}
        initialMode="add"
        initialSubjectId={searchParams.subjectId || ''}
        initialChapterId={searchParams.chapterId || ''}
        initialTopicId={searchParams.topicId || ''}
      />
    </div>
  )
}
