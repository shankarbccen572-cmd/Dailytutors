/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import { serialize } from '@/lib/utils'
import SignInCta from '@/components/SignInCta'
import CourseCard from '@/components/CourseCard'

// Cache for 60s instead of querying MongoDB on every visit (much faster).
// Newly published/updated courses appear within a minute.
export const revalidate = 60

export const metadata = {
  title: 'Explore Courses',
  description:
    'Browse published online courses for Class 8–12, NEET, JEE, CET, UPSC and CA with structured lessons, tests and expert guidance.',
  alternates: {
    canonical: '/courses',
  },
}

export default async function CoursesCatalog() {
  await dbConnect()
  const courseDocs = await Course.find({ status: 'published' })
    .sort({ createdAt: -1 })
    .lean()
  const courses = serialize(courseDocs)

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Daily Tutors Courses',
    itemListElement: courses.map((course, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://dailytutors.in/courses/${course.slug}`,
      name: course.title,
    })),
  }

  return (
    <div className="min-h-screen bg-brand-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-brand-border bg-brand-primary/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/">
            <img src="/logo-full.png" alt="Daily Tutors" style={{ width: '200px', height: 'auto' }} />
          </Link>
          <SignInCta
            label="Sign in"
            authedLabel="Dashboard"
            className="rounded-xl bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5"
          />
        </div>
      </header>

      {/* Header */}
      <section className="bg-hero-glow">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h1 className="font-heading text-3xl font-bold text-brand-textPrimary sm:text-4xl">
            Explore Courses
          </h1>
          <p className="mt-2 text-brand-textSecondary">
            {courses.length} course{courses.length === 1 ? '' : 's'} crafted to help
            you learn smarter, every day.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-border bg-white p-12 text-center text-brand-textSecondary">
            No courses published yet. Check back soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c._id} course={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
