import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageTitle, SectionText, SectionTitle } from '@/components/ui/typography'

export const metadata = {
  title: 'About Us',
  description: 'Learn more about Daily Tutors and the mission behind our online learning platform.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-brand-border bg-white shadow-card">
          <div className="bg-hero-glow p-8 lg:p-12">
            <PageTitle>About Daily Tutors</PageTitle>
            <SectionText className="mt-4 max-w-3xl">
              Daily Tutors is built to make high-quality online coaching accessible, structured, and motivating for students across boards, entrance exams, and school subjects.
            </SectionText>
          </div>

          <div className="grid gap-6 p-8 lg:grid-cols-2 lg:p-12">
            <Card>
              <CardHeader>
                <CardTitle>Our mission</CardTitle>
                <CardDescription>We combine live instruction, recorded lessons, practice tests, and mentor support to help students stay consistent and confident.</CardDescription>
              </CardHeader>
              <CardContent>
                <SectionText>From class 8 to competitive exam prep, we focus on practical learning strategies, clarity, and measurable progress.</SectionText>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why learners choose us</CardTitle>
                <CardDescription>Every course is designed to reduce overwhelm and improve daily study momentum.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm leading-7 text-brand-textSecondary">
                  <li>• Expert-led guidance with structured content</li>
                  <li>• Flexible access across mobile, tablet, and desktop</li>
                  <li>• Comprehensive notes, tests, and doubt support</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="border-t border-brand-border p-8 lg:p-12">
            <SectionTitle>Ready to start?</SectionTitle>
            <SectionText className="mt-3 max-w-2xl">
              Explore our courses, compare plans, or contact our team for school and bulk learning partnerships.
            </SectionText>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/courses" className="rounded-full bg-brand-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-accentDark">
                Explore Courses
              </Link>
              <Link href="/pricing" className="rounded-full border border-brand-border px-4 py-3 text-sm font-semibold text-brand-textSecondary transition hover:border-brand-accent hover:text-brand-accent">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
