import Link from 'next/link'
import CourseForm from '@/components/admin/CourseForm'

export default function NewCoursePage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/courses"
          className="text-sm text-brand-textSecondary hover:text-brand-textPrimary"
        >
          ← Back to courses
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-brand-textPrimary">
          Create a new course
        </h1>
        <p className="text-sm text-brand-textSecondary">
          Step 1 of 2: fill in the details, then <b>Save as Draft</b> or{' '}
          <b>Publish</b>. You&apos;ll then be taken to the curriculum builder to
          add chapters, topics, lesson videos &amp; resources.
        </p>
      </div>
      <CourseForm mode="create" />
    </div>
  )
}
