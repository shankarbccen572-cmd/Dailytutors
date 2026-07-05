import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import SiteSetting from '@/models/SiteSetting'
import { getAdminSession } from '@/lib/admin'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  let settings = await SiteSetting.findOne().lean()
  if (!settings) {
    settings = await SiteSetting.create({
      navbarLinks: [
        { label: 'Courses', href: '/courses' },
        { label: 'Learn', href: '/learn' },
        { label: 'Login', href: '/login' },
      ],
      heroBanners: [
        {
          title: 'Shape Your Future with the Daily Tutors',
          subtitle:
            'One platform for every goal — from Class 8 to 12 boards to NEET, JEE, CET, UPSC and more.',
          imageUrl: '',
          bgColor: '#D92F2F',
          textColor: '#FFFFFF',
          ctaText: 'Start Learning',
          ctaHref: '/login',
          position: 1,
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
    })
  }

  return NextResponse.json(settings)
}

export async function PUT(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await dbConnect()
  const body = await req.json()

  const update = {
    navbarLinks: Array.isArray(body.navbarLinks) ? body.navbarLinks : [],
    heroBanners: Array.isArray(body.heroBanners)
      ? body.heroBanners.map((item, index) => ({
          title: item.title || '',
          subtitle: item.subtitle || '',
          imageUrl: item.imageUrl || '',
          bgColor: item.bgColor || '#D92F2F',
          textColor: item.textColor || '#FFFFFF',
          ctaText: item.ctaText || 'Start Learning',
          ctaHref: item.ctaHref || '/login',
          position: Number.isFinite(item.position) ? item.position : index + 1,
        }))
      : [],
    heroStats: Array.isArray(body.heroStats) ? body.heroStats : [],
    featureLabels: Array.isArray(body.featureLabels) ? body.featureLabels : [],
    footerText: body.footerText || '',
  }

  const settings = await SiteSetting.findOneAndUpdate({}, update, {
    new: true,
    upsert: true,
  }).lean()

  return NextResponse.json(settings)
}
