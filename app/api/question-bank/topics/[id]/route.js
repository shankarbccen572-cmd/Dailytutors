import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BankTopic from '@/models/BankTopic'
import BankQuestion from '@/models/BankQuestion'
import { getAdminSession } from '@/lib/admin'

// Delete a topic. Questions under it are kept but detached (topicId → null) so
// no bank content is lost — they simply fall back to chapter-level.
export async function DELETE(_req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  await Promise.all([
    BankTopic.findByIdAndDelete(params.id),
    BankQuestion.updateMany({ topicId: params.id }, { topicId: null }),
  ])
  return NextResponse.json({ ok: true })
}
