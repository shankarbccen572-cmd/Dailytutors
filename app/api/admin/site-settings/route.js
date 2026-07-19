import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/mongodb'
import SiteSetting from '@/models/SiteSetting'
import { getAdminSession } from '@/lib/admin'
import { SITE_DEFAULTS, mergeSiteSettings } from '@/lib/siteDefaults'

const str = (v, fallback = '') => (typeof v === 'string' ? v : fallback)
const arr = (v) => (Array.isArray(v) ? v : [])

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  let settings = await SiteSetting.findOne().lean()
  if (!settings) {
    settings = await SiteSetting.create(SITE_DEFAULTS)
    settings = settings.toObject()
  }

  return NextResponse.json(mergeSiteSettings(settings))
}

export async function PUT(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()

  const update = {
    navbarLinks: arr(body.navbarLinks).map((l) => ({ label: str(l.label), href: str(l.href) })),

    heroBanners: arr(body.heroBanners).map((item, index) => ({
      title: str(item.title),
      subtitle: str(item.subtitle),
      imageUrl: str(item.imageUrl),
      bgColor: str(item.bgColor, '#D92F2F'),
      textColor: str(item.textColor, '#FFFFFF'),
      ctaText: str(item.ctaText, 'Start Learning'),
      ctaHref: str(item.ctaHref, '/login'),
      size: str(item.size, 'medium'),
      position: Number.isFinite(item.position) ? item.position : index + 1,
    })),
    heroStats: arr(body.heroStats).map((s) => ({ value: str(s.value), label: str(s.label) })),

    highlights: arr(body.highlights).map((h) => ({
      icon: str(h.icon, 'Sparkles'),
      title: str(h.title),
      sub: str(h.sub),
    })),

    examBadge: str(body.examBadge),
    examHeading: str(body.examHeading),
    examSubheading: str(body.examSubheading),
    examCategories: arr(body.examCategories).map((c) => ({
      icon: str(c.icon, 'Sparkles'),
      title: str(c.title),
      tags: arr(c.tags).map((t) => str(t)).filter(Boolean),
      href: str(c.href, '/courses'),
    })),

    whyBadge: str(body.whyBadge),
    whyHeading: str(body.whyHeading),
    whySubheading: str(body.whySubheading),
    featureLabels: arr(body.featureLabels).map((f) => str(f)),

    ctaHeading: str(body.ctaHeading),
    ctaSubtitle: str(body.ctaSubtitle),
    ctaPrimaryLabel: str(body.ctaPrimaryLabel),
    ctaSecondaryLabel: str(body.ctaSecondaryLabel),
    ctaSecondaryHref: str(body.ctaSecondaryHref, '/courses'),

    coursesBadge: str(body.coursesBadge),
    coursesTitle: str(body.coursesTitle),
    coursesSubtitle: str(body.coursesSubtitle),

    footerAbout: str(body.footerAbout),
    footerColumns: arr(body.footerColumns).map((col) => ({
      title: str(col.title),
      links: arr(col.links).map((l) => ({ label: str(l.label), href: str(l.href) })),
    })),
    socialLinks: arr(body.socialLinks).map((s) => ({ type: str(s.type, 'mail'), href: str(s.href) })),
    footerText: str(body.footerText),
  }

  const settings = await SiteSetting.findOneAndUpdate({}, update, {
    new: true,
    upsert: true,
  }).lean()

  // The homepage is statically cached — regenerate it (and the courses page)
  // so navbar/footer/hero edits show up immediately on the public site.
  revalidatePath('/')
  revalidatePath('/courses')

  return NextResponse.json(mergeSiteSettings(settings))
}
