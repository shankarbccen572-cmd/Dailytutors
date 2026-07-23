import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PageTitle, SectionText, SectionTitle } from '@/components/ui/typography'
import Breadcrumbs from '@/components/Breadcrumbs'

const plans = [
  {
    name: '8th Standard',
    features: ['HD Video Lectures', 'Notes', 'Practice Tests', 'Doubt Support'],
    highlight: false,
  },
  {
    name: '9th Standard',
    features: ['HD Video Lectures', 'Notes', 'Practice Tests', 'Doubt Support'],
    highlight: true,
  },
  {
    name: '10th Standard',
    features: ['HD Video Lectures', 'Notes', 'Practice Tests', 'Doubt Support'],
    highlight: false,
  },
  {
    name: '11th Standard',
    features: ['HD Video Lectures', 'Notes', 'Practice Tests', 'Doubt Support', 'Certificate'],
    highlight: false,
  },
  {
    name: '12th Standard',
    features: ['HD Video Lectures', 'Notes', 'Practice Tests', 'Doubt Support', 'Certificate'],
    highlight: false,
  },
  {
    name: 'KCET Complete Course',
    features: ['HD Video Lectures', 'Notes', 'Practice Tests', 'Doubt Support', 'Certificate'],
    highlight: false,
  },
  {
    name: 'NEET Complete Course',
    features: ['HD Video Lectures', 'Notes', 'Practice Tests', 'Doubt Support', 'Certificate'],
    highlight: false,
  },
]

export const metadata = {
  title: 'Pricing',
  description: 'Explore professional coaching plans for school, KCET, and NEET preparation.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Pricing' }]} />

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-brand-border bg-white shadow-card">
          <div className="bg-hero-glow p-8 lg:p-12">
            <div className="inline-flex items-center rounded-full border border-brand-border bg-white/90 px-3 py-1 text-sm font-medium text-brand-textSecondary shadow-sm">
              Learning plans
            </div>
            <PageTitle className="mt-6">Premium coaching plans for every stage</PageTitle>
            <SectionText className="mt-4 max-w-3xl">
              Choose a plan tailored to your board, competitive exam, or school preparation goals. Every course includes high-quality resources and mentor support.
            </SectionText>
          </div>

          <Separator />

          <div className="p-8 lg:p-12">
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.name} className={plan.highlight ? 'border-brand-accent/40 shadow-accentLg' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>Structured learning with expert guidance.</CardDescription>
                      </div>
                      {plan.highlight ? (
                        <span className="rounded-full bg-brand-accentLight px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
                          Popular
                        </span>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="mt-2 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm text-brand-textSecondary">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-accentLight text-brand-accent">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/login"
                      className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-brand-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-accentDark"
                    >
                      Enroll Now
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-10 rounded-3xl border border-brand-border bg-brand-surface p-8">
              <SectionTitle>Contact us for bulk or school plans</SectionTitle>
              <SectionText className="mt-3 max-w-2xl">
                Need classroom access, institutional pricing, or a custom learning package? Our team can tailor a plan for schools, coaching centers, and larger groups.
              </SectionText>
              <Link href="mailto:support@dailytutors.in" className="mt-6 inline-flex items-center rounded-full bg-brand-secondary px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-secondaryDark">
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
