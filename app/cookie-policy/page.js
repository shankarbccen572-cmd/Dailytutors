import LegalPage from '@/components/LegalPage'
import { SectionTitle, SectionText, ListItem } from '@/components/ui/typography'

const sections = [
  {
    title: 'What are cookies?',
    body: 'Cookies are small text files stored on your browser that help websites remember preferences, keep sessions active, and collect usage information.',
  },
  {
    title: 'Essential Cookies',
    body: 'These cookies are necessary for core platform functions such as authentication, security, load balancing, and preserving your selected settings.',
  },
  {
    title: 'Authentication Cookies',
    body: 'Authentication cookies help keep you signed in and allow secure access to your account, course dashboard, and learning tools.',
  },
  {
    title: 'Analytics Cookies',
    body: 'We may use analytics cookies to understand how visitors browse the site, which pages are most useful, and how we can improve the learning experience.',
  },
  {
    title: 'Functional Cookies',
    body: 'Functional cookies remember choices like language preferences and recent interactions so the experience feels more personalized and consistent.',
  },
  {
    title: 'Marketing Cookies',
    body: 'Marketing cookies may be used to understand campaign performance and to show relevant updates or offers based on your browsing activity.',
  },
  {
    title: 'Third-party Cookies',
    body: 'Some cookies may be placed by third-party services such as Razorpay, Google Analytics, Google OAuth, Cloudinary, and Vercel to support payments, authentication, analytics, and media delivery.',
  },
]

export const metadata = {
  title: 'Cookie Policy',
  description: 'Learn how Daily Tutors uses cookies, consent choices, and browser controls.',
}

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      description="We use cookies to improve security, personalize your experience, and understand how our learning platform is used."
      updated="19 July 2026"
      badge="Cookies"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cookie Policy' }]}
    >
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <SectionTitle>{section.title}</SectionTitle>
            <SectionText className="mt-3">{section.body}</SectionText>
          </section>
        ))}

        <section className="rounded-2xl border border-brand-border bg-brand-surface p-6">
          <SectionTitle>Managing cookies in your browser</SectionTitle>
          <ul className="mt-4 space-y-2">
            <ListItem>You can usually disable or delete cookies from your browser settings.</ListItem>
            <ListItem>Blocking essential cookies may affect login, checkout, and account access.</ListItem>
            <ListItem>To manage preferences, visit your browser privacy settings or clear cookies for this site.</ListItem>
          </ul>
        </section>
      </div>
    </LegalPage>
  )
}
