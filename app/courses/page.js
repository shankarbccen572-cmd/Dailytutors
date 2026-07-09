/* eslint-disable @next/next/no-img-element */
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import SiteSetting from '@/models/SiteSetting'
import { serialize } from '@/lib/utils'
import CourseCard from '@/components/CourseCard'
import SiteNavbar from '@/components/SiteNavbar'
import SiteFooter from '@/components/SiteFooter'
import { SITE_DEFAULTS, mergeSiteSettings } from '@/lib/siteDefaults'
import { BookOpen, Sparkles } from 'lucide-react'

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
  const [courseDocs, settingDoc] = await Promise.all([
    Course.find({ status: 'published' }).sort({ createdAt: -1 }).lean(),
    SiteSetting.findOne().lean(),
  ])
  const courses = serialize(courseDocs)
  const s = mergeSiteSettings(settingDoc ? serialize(settingDoc) : SITE_DEFAULTS)

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
    <div className="flex min-h-screen flex-col bg-brand-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />

      <SiteNavbar links={s.navbarLinks} />

      {/* Header */}
      <section className="relative overflow-hidden border-b border-brand-border bg-hero-mesh">
        <div className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-brand-accentLight/60 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 sm:py-20">
          {s.coursesBadge ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-accentDark backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {s.coursesBadge}
            </span>
          ) : null}
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-brand-textPrimary sm:text-5xl">
            {s.coursesTitle}
          </h1>
          <p className="mt-3 max-w-xl text-base text-brand-textSecondary sm:text-lg">
            {courses.length} course{courses.length === 1 ? '' : 's'} — {s.coursesSubtitle}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-brand-border bg-white p-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accentLight text-brand-accent">
              <BookOpen className="h-7 w-7" />
            </span>
            <p className="text-lg font-semibold text-brand-textPrimary">No courses published yet</p>
            <p className="max-w-sm text-sm text-brand-textSecondary">
              New courses are on the way — check back soon or sign in to get notified.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c._id} course={c} />
            ))}
          </div>
        )}
      </div>

      <SiteFooter
        about={s.footerAbout}
        columns={s.footerColumns}
        socials={s.socialLinks}
        footerText={s.footerText}
      />
    </div>
  )
}
