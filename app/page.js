/* eslint-disable @next/next/no-img-element */
import SignInCta from '@/components/SignInCta'
import HeroSlider from '@/components/HeroSlider'
import SiteNavbar from '@/components/SiteNavbar'
import SiteFooter from '@/components/SiteFooter'
import { ClipboardCheck, ArrowRight } from 'lucide-react'
import { getIcon, paletteAt } from '@/lib/icons'
import { SITE_DEFAULTS, mergeSiteSettings } from '@/lib/siteDefaults'
import dbConnect from '@/lib/mongodb'
import SiteSetting from '@/models/SiteSetting'
import { serialize } from '@/lib/utils'

async function getSettings() {
  if (!process.env.MONGODB_URI) {
    return mergeSiteSettings(SITE_DEFAULTS)
  }

  await dbConnect()
  const setting = await SiteSetting.findOne().lean()
  return mergeSiteSettings(setting ? serialize(setting) : SITE_DEFAULTS)
}

export default async function Home() {
  const s = await getSettings()

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Daily Tutors',
    url: 'https://www.dailytutors.in',
    logo: 'https://www.dailytutors.in/logo-full.png',
    description: s.heroBanners?.[0]?.subtitle || SITE_DEFAULTS.heroBanners[0].subtitle,
    sameAs: (s.socialLinks || []).map((x) => x.href).filter((h) => h && h.startsWith('http')),
  }

  return (
    <div className="min-h-screen bg-brand-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      <SiteNavbar links={s.navbarLinks} />

      <main>
        {/* Hero */}
        <HeroSlider
          banners={(s.heroBanners || [])
            .slice()
            .sort((a, b) => (Number(a.position) || 0) - (Number(b.position) || 0))}
        />

        {/* Stats band */}
        <section className="relative z-10 mx-auto mt-6 max-w-5xl px-4 sm:-mt-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-brand-border rounded-2xl border border-brand-border bg-white/95 shadow-cardHover backdrop-blur sm:rounded-3xl">
            {s.heroStats.map((stat, i) => (
              <div key={`${stat.label}-${i}`} className="px-2 py-5 text-center sm:px-3 sm:py-7">
                <p className="bg-accent-gradient bg-clip-text font-heading text-xl font-bold text-transparent sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[10px] font-medium leading-tight text-brand-textSecondary sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Highlights — 3 across on every screen, compact on phones */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-3 gap-2.5 sm:gap-5">
            {s.highlights.map((h, i) => {
              const Icon = getIcon(h.icon)
              const palette = paletteAt(i)
              return (
                <div
                  key={`${h.title}-${i}`}
                  className="group flex flex-col items-center gap-1.5 rounded-2xl border border-brand-border bg-white p-3 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover sm:gap-3 sm:rounded-3xl sm:p-8"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:scale-110 sm:h-14 sm:w-14 sm:rounded-2xl ${palette.accent}`}>
                    <Icon className="h-[18px] w-[18px] sm:h-7 sm:w-7" />
                  </div>
                  <h3 className="font-heading text-sm font-bold leading-tight text-brand-textPrimary sm:text-2xl">{h.title}</h3>
                  <p className="text-[10px] font-medium leading-tight text-brand-textSecondary sm:text-sm">{h.sub}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Exam categories */}
        <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="max-w-3xl">
            {s.examBadge ? (
              <span className="inline-flex rounded-full bg-brand-accentLight px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-brand-accentDark">
                {s.examBadge}
              </span>
            ) : null}
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-brand-textPrimary sm:text-4xl lg:text-5xl">
              {s.examHeading}
            </h2>
            <p className="mt-3 max-w-2xl text-base text-brand-textSecondary sm:text-lg">{s.examSubheading}</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {s.examCategories.map((cat, i) => {
              const Icon = getIcon(cat.icon)
              const palette = paletteAt(i)
              return (
                <a
                  key={`${cat.title}-${i}`}
                  href={cat.href || '/courses'}
                  className="group relative overflow-hidden rounded-3xl border border-brand-border bg-white p-6 text-left shadow-card transition-all hover:-translate-y-1 hover:border-brand-accent/30 hover:shadow-cardHover"
                >
                  <div className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-70 blur-2xl transition-opacity group-hover:opacity-100 ${palette.glow}`} />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold text-brand-textPrimary">{cat.title}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(cat.tags || []).map((t, ti) => (
                          <span key={`${t}-${ti}`} className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-textSecondary">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110 ${palette.accent}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-textPrimary">
                    Explore category
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-border bg-brand-surface transition-all group-hover:bg-brand-accent group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        </section>

        {/* Why choose */}
        <section id="why" className="mt-14 border-t border-brand-border bg-brand-surface" aria-labelledby="why-heading">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              {s.whyBadge ? (
                <span className="text-sm font-semibold uppercase tracking-wide text-brand-accent">{s.whyBadge}</span>
              ) : null}
              <h2 id="why-heading" className="mt-3 font-heading text-3xl font-bold text-brand-textPrimary sm:text-4xl">
                {s.whyHeading}
              </h2>
              <p className="mt-4 text-base text-brand-textSecondary sm:text-lg">{s.whySubheading}</p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {s.featureLabels.map((label, i) => (
                <div
                  key={`${label}-${i}`}
                  className="flex items-center gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardHover"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-accentLight text-brand-accent">
                    <ClipboardCheck className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium text-brand-textPrimary">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-accent-gradient px-6 py-14 text-center shadow-accentLg sm:px-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">{s.ctaHeading}</h2>
              <p className="mt-4 text-base text-white/90 sm:text-lg">{s.ctaSubtitle}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <SignInCta
                  label={s.ctaPrimaryLabel}
                  authedLabel="Go to dashboard"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 font-semibold text-brand-accentDark shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 sm:w-auto"
                />
                {s.ctaSecondaryLabel ? (
                  <a
                    href={s.ctaSecondaryHref || '/courses'}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-8 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto"
                  >
                    {s.ctaSecondaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter
        about={s.footerAbout}
        columns={s.footerColumns}
        socials={s.socialLinks}
        footerText={s.footerText}
      />
    </div>
  )
}
