/* eslint-disable @next/next/no-img-element */
import { redirect } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import Category from '@/models/Category'
import SiteSetting from '@/models/SiteSetting'
import { serialize } from '@/lib/utils'
import { getCurrentUser } from '@/lib/session'
import CourseCatalog from '@/components/CourseCatalog'
import SiteNavbar from '@/components/SiteNavbar'
import SiteFooter from '@/components/SiteFooter'
import { SITE_DEFAULTS, mergeSiteSettings } from '@/lib/siteDefaults'
import { Sparkles } from 'lucide-react'

// The catalog is behind login and needs the signed-in user, so it renders per
// request rather than being statically cached.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Explore Courses',
  description:
    'Browse published online courses for Class 8–12, NEET, JEE, CET and PUC with structured lessons, tests and expert guidance.',
  alternates: {
    canonical: '/courses',
  },
}

export default async function CoursesCatalog() {
  // Students must sign in to browse the catalog, and first-time students must
  // fill in their details before they can see the courses.
  const currentUser = await getCurrentUser()
  if (!currentUser) redirect('/login?callbackUrl=/courses')
  if (currentUser.role === 'student' && !currentUser.profileCompleted) {
    redirect('/complete-profile?callbackUrl=/courses')
  }

  let courses = []
  let categories = []
  let s = mergeSiteSettings(SITE_DEFAULTS)

  if (process.env.MONGODB_URI) {
    await dbConnect()
    const [courseDocs, categoryDocs, settingDoc] = await Promise.all([
      Course.find({ status: 'published' }).sort({ createdAt: -1 }).lean(),
      Category.find({ active: true }).sort({ order: 1, name: 1 }).lean(),
      SiteSetting.findOne().lean(),
    ])
    courses = serialize(courseDocs)
    categories = serialize(categoryDocs)
    s = mergeSiteSettings(settingDoc ? serialize(settingDoc) : SITE_DEFAULTS)
  }

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Daily Tutors Courses',
    itemListElement: courses.map((course, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://www.dailytutors.in/courses/${course.slug}`,
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
        <CourseCatalog courses={courses} categories={categories} />
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
