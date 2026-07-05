/* eslint-disable @next/next/no-img-element */
import SignInCta from '@/components/SignInCta'
import HeroSlider from '@/components/HeroSlider'
import {
  Stethoscope,
  GraduationCap,
  School,
  Atom,
  Landmark,
  Calculator,
  Radio,
  ClipboardCheck,
  UserCheck,
  LineChart,
  MessagesSquare,
  FileText,
  Clock,
  Video,
  ClipboardList,
  Brain,
  Menu,
} from 'lucide-react'
import dbConnect from '@/lib/mongodb'
import SiteSetting from '@/models/SiteSetting'
import { serialize } from '@/lib/utils'

const EXAMS = [
  { icon: School, title: 'Class 8 – 10', sub: 'CBSE · ICSE · State boards' },
  { icon: GraduationCap, title: 'Class 11 – 12', sub: 'Boards + entrance foundation' },
  { icon: Stethoscope, title: 'NEET', sub: 'Medical entrance' },
  { icon: Atom, title: 'JEE / CET', sub: 'Engineering & entrance' },
  { icon: Landmark, title: 'UPSC / KAS', sub: 'Civil services' },
  { icon: Calculator, title: 'CA & Commerce', sub: 'Foundation to final' },
]

const DEFAULT_SETTINGS = {
  navbarLinks: [
    { label: 'Courses', href: '/courses' },
    { label: 'Learn', href: '/learn' },
    { label: 'Login', href: '/login' },
  ],
  heroBanners: [
    {
      title: '8 AM IST • Every Morning',
      subtitle: 'Start your day with curated current affairs from The Hindu, PIB, and Indian Express.',
      imageUrl: '',
      bgColor: '#8B0000',
      textColor: '#FFFFFF',
      ctaText: "Read Today's Brief",
      ctaHref: '/courses',
    },
    {
      title: 'Live Classes Every Day',
      subtitle: 'Stay on top of your syllabus with live sessions and doubt solving every day.',
      imageUrl: '',
      bgColor: '#B22222',
      textColor: '#FFFFFF',
      ctaText: 'Join Live Now',
      ctaHref: '/learn',
    },
    {
      title: 'Practice with Mock Tests',
      subtitle: 'Build confidence with daily mock tests, quizzes, and performance tracking.',
      imageUrl: '',
      bgColor: '#C00000',
      textColor: '#FFFFFF',
      ctaText: 'Start Practice',
      ctaHref: '/courses',
    },
    {
      title: 'Expert Mentorship',
      subtitle: 'Learn from experienced tutors who guide your prep with strategy and clarity.',
      imageUrl: '',
      bgColor: '#DC143C',
      textColor: '#FFFFFF',
      ctaText: 'Meet Mentors',
      ctaHref: '/login',
    },
    {
      title: 'Track Progress Effortlessly',
      subtitle: 'Get daily analytics, scorecards, and study plans tailored for your goals.',
      imageUrl: '',
      bgColor: '#B22234',
      textColor: '#FFFFFF',
      ctaText: 'View Dashboard',
      ctaHref: '/dashboard',
    },
  ],
  heroStats: [
    { value: '10k+', label: 'Active learners' },
    { value: '200+', label: 'Video lessons' },
    { value: '95%', label: 'Success mindset' },
  ],
  featureLabels: [
    'Expert Faculty with Real Experience',
    'Live & Recorded Classes',
    'Daily Practice Tests',
    'Personalized Mentorship',
    'Performance Tracking',
    'Doubt Clearing Sessions',
    'Study Materials & Notes',
  ],
  footerText: '© 2026 Daily Tutors. All rights reserved.',
}

async function getSettings() {
  await dbConnect()
  const setting = await SiteSetting.findOne().lean()
  return setting ? serialize(setting) : DEFAULT_SETTINGS
}

export default async function Home() {
  const settings = await getSettings()
  const features = (settings.featureLabels || DEFAULT_SETTINGS.featureLabels).map((label) => ({
    icon: ClipboardCheck,
    label,
  }))
  const heroStats = settings.heroStats?.length ? settings.heroStats : DEFAULT_SETTINGS.heroStats
  const navbarLinks = settings.navbarLinks?.length ? settings.navbarLinks : DEFAULT_SETTINGS.navbarLinks
  const footerText = settings.footerText || DEFAULT_SETTINGS.footerText

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Daily Tutors',
    url: 'https://dailytutors.in',
    logo: 'https://dailytutors.in/logo-full.png',
    description: settings.heroBanners?.[0]?.subtitle || DEFAULT_SETTINGS.heroBanners[0].subtitle,
    sameAs: ['https://www.instagram.com', 'https://www.linkedin.com'],
  }

  return (
    <div className="min-h-screen bg-brand-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-brand-border bg-brand-primary/90 backdrop-blur-md">
        <div className="mx-auto px-4 py-3.5 sm:px-6 max-w-7xl">
          <div className="flex items-center justify-between gap-3">
            <img
              src="/logo-full.png"
              alt="Daily Tutors"
              className="h-10 w-auto sm:h-12"
            />
            <div className="flex items-center gap-2">
              <details className="relative md:hidden">
                <summary className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white/95 px-4 py-2 text-sm font-medium text-brand-textPrimary shadow-sm">
                  <Menu className="h-4 w-4 text-brand-accent" />
                  Menu
                </summary>
                <div className="absolute right-0 z-10 mt-2 w-56 rounded-3xl border border-brand-border bg-white p-4 shadow-card">
                  <div className="space-y-2">
                    {navbarLinks.map((link) => (
                      <a
                        key={`${link.label}-${link.href}`}
                        href={link.href}
                        className="block rounded-2xl px-3 py-2 text-sm font-medium text-brand-textSecondary transition hover:bg-brand-surface hover:text-brand-textPrimary"
                      >
                        {link.label}
                      </a>
                    ))}
                    <a
                      href="/login"
                      className="block rounded-2xl border border-brand-border bg-brand-primary px-3 py-2 text-sm font-semibold text-brand-textPrimary transition hover:bg-brand-surface"
                    >
                      Sign in
                    </a>
                  </div>
                </div>
              </details>
              <nav className="hidden items-center gap-6 md:flex">
                {navbarLinks.map((link) => (
                  <a
                    key={`${link.label}-${link.href}`}
                    href={link.href}
                    className="text-sm font-medium text-brand-textSecondary transition hover:text-brand-textPrimary"
                  >
                    {link.label}
                  </a>
                ))}
                <SignInCta
                  label="Sign in"
                  authedLabel="Dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5"
                />
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <HeroSlider
          banners={(settings.heroBanners || DEFAULT_SETTINGS.heroBanners)
            .slice()
            .sort((a, b) => (Number(a.position) || 0) - (Number(b.position) || 0))}
        />

        {/* Hero features */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-card">
            <div className="grid divide-y divide-brand-border/60 md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="flex flex-col items-center gap-3 px-6 py-8 text-center sm:px-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FCE7F3] text-[#BE123C]">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-brand-textPrimary">Daily Live</h3>
                <p className="text-sm font-medium text-brand-textSecondary">Live Classes</p>
              </div>
              <div className="flex flex-col items-center gap-3 px-6 py-8 text-center sm:px-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4338CA]">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-brand-textPrimary">10 Million +</h3>
                <p className="text-sm font-medium text-brand-textSecondary">Practice Content</p>
              </div>
              <div className="flex flex-col items-center gap-3 px-6 py-8 text-center sm:px-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF5] text-[#047857]">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-brand-textPrimary">24 x 7</h3>
                <p className="text-sm font-medium text-brand-textSecondary">Doubt Support</p>
              </div>
            </div>
          </div>
        </section>

        {/* Exam cards */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-left">
            <span className="inline-flex rounded-full bg-[#FFE3E3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-[#B91C1C]">
              Courses by exam
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-brand-textPrimary sm:text-5xl">
              Find the right <span className="text-[#B91C1C] uppercase">exam</span> for you
            </h2>
            <p className="mt-3 max-w-2xl text-base text-brand-textSecondary sm:text-lg">
              Pick your goal and explore structured courses, test series and resources.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <a href="/courses" className="group relative overflow-hidden rounded-[2rem] border border-[#F3E8EE] bg-white p-6 text-left shadow-card transition hover:-translate-y-1 hover:shadow-cardHover">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#EFF6FF] blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold text-brand-textPrimary">9th - 10th Grade</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary">
                      CBSE
                    </span>
                    <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary">
                      ICSE
                    </span>
                    <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary">
                      State Board
                    </span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#FEE2E2] text-[#B91C1C] shadow-sm">
                  <School className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-textPrimary">
                Explore Category
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-textPrimary transition group-hover:bg-brand-accent group-hover:text-white">
                  →
                </span>
              </div>
            </a>

            <a href="/learn" className="group relative overflow-hidden rounded-[2rem] border border-[#FEE2E2] bg-white p-6 text-left shadow-card transition hover:-translate-y-1 hover:shadow-cardHover">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#FEE2E2] blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold text-brand-textPrimary">NEET</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary">
                      Class 11
                    </span>
                    <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary">
                      Class 12
                    </span>
                    <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary">
                      Dropper
                    </span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#FEE2E2] text-[#991B1B] shadow-sm">
                  <Stethoscope className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-textPrimary">
                Explore Category
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-textPrimary transition group-hover:bg-brand-accent group-hover:text-white">
                  →
                </span>
              </div>
            </a>

            <a href="/courses" className="group relative overflow-hidden rounded-[2rem] border border-[#EFF6FF] bg-white p-6 text-left shadow-card transition hover:-translate-y-1 hover:shadow-cardHover">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#ECFDF5] blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold text-brand-textPrimary">CET</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary">
                      Class 11
                    </span>
                    <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary">
                      Class 12
                    </span>
                    <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary">
                      Dropper
                    </span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#FEF3C7] text-[#B45309] shadow-sm">
                  <Atom className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-textPrimary">
                Explore Category
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-textPrimary transition group-hover:bg-brand-accent group-hover:text-white">
                  →
                </span>
              </div>
            </a>
            <a href="/courses" className="group relative overflow-hidden rounded-[2rem] border border-[#E0F2FE] bg-white p-6 text-left shadow-card transition hover:-translate-y-1 hover:shadow-cardHover">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#DBEAFE] blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold text-brand-textPrimary">11th - 12th Grade</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary">
                      Class 11
                    </span>
                    <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary">
                      Class 12
                    </span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#D1FAE5] text-[#047857] shadow-sm">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-textPrimary">
                Explore Category
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-textPrimary transition group-hover:bg-brand-accent group-hover:text-white">
                  →
                </span>
              </div>
            </a>
          </div>
        </section>

        {/* Why Choose */}
        <section id="why" className="mt-12 border-t border-brand-border bg-brand-surface" aria-labelledby="why-heading">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-wide text-brand-accent">
                Why Choose Daily Tutors?
              </span>
              <h2 id="why-heading" className="mt-3 font-heading text-3xl font-bold text-brand-textPrimary sm:text-4xl">
                Learn Beyond Books. Learn with Strategy.
              </h2>
              <p className="mt-4 text-base text-brand-textSecondary sm:text-lg">
                We focus on structured learning, consistency, and results — everything
                you need to stay on track every single day.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.label}
                    className="flex items-center gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardHover"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-accentLight text-brand-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-brand-textPrimary">
                      {feature.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-12 text-center">
              <SignInCta
                label="Start Learning Today"
                authedLabel="Go to dashboard"
                className="inline-flex w-full justify-center gap-2 rounded-xl bg-accent-gradient px-8 py-3.5 font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5 sm:w-auto"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-brand-border bg-brand-primary">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <img src="/logo-full.png" alt="Daily Tutors" className="h-10 w-auto sm:h-12" />
          <p className="text-center text-sm text-brand-textSecondary sm:text-left">{footerText}</p>
        </div>
      </footer>
    </div>
  )
}
