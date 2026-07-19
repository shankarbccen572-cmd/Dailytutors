import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageTitle, SectionText, SectionTitle } from '@/components/ui/typography'

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Daily Tutors for course support, bulk plans, or general enquiries.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-brand-border bg-white shadow-card">
          <div className="bg-hero-glow p-8 lg:p-12">
            <PageTitle>Contact us</PageTitle>
            <SectionText className="mt-4 max-w-3xl">
              Whether you need help with a course, pricing information, or a school partnership, our team is here to help.
            </SectionText>
          </div>

          <div className="grid gap-6 p-8 lg:grid-cols-2 lg:p-12">
            <Card>
              <CardHeader>
                <CardTitle>Support</CardTitle>
                <CardDescription>For account, payment, or course access questions.</CardDescription>
              </CardHeader>
              <CardContent>
                <SectionText>Reach us at <Link href="mailto:hello@dailytutors.in" className="font-semibold text-brand-accent">hello@dailytutors.in</Link>.</SectionText>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulk and school plans</CardTitle>
                <CardDescription>We can customize learning packages for colleges, schools, and coaching institutions.</CardDescription>
              </CardHeader>
              <CardContent>
                <SectionText>Share your learning goals and team size and we will help you choose the right plan.</SectionText>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
