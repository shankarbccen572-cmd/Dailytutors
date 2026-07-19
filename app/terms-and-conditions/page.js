import LegalPage from '@/components/LegalPage'
import { SectionTitle, SectionText, ListItem } from '@/components/ui/typography'

const sections = [
  {
    title: 'Acceptance of Terms',
    body: 'By accessing or using Daily Tutors, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the platform.',
  },
  {
    title: 'User Accounts',
    body: 'You are responsible for maintaining the confidentiality of your account details and for all activity that occurs under your account.',
  },
  {
    title: 'Course Access',
    body: 'Access to courses, lessons, and resources is provided based on your purchase, subscription, or authorized access and may be subject to additional terms.',
  },
  {
    title: 'Intellectual Property',
    body: 'All course content, notes, videos, materials, and platform design are owned by Daily Tutors or its licensors and may not be copied, redistributed, or reused without permission.',
  },
  {
    title: 'Payments',
    body: 'All fees are payable in advance and must be made using the approved payment methods displayed on the website. Payments are processed securely through Razorpay.',
  },
  {
    title: 'Refunds',
    body: 'Refunds are governed by our Refund and Cancellation Policy. In general, refund requests are reviewed based on the nature of the purchase, eligibility, and technical circumstances.',
  },
  {
    title: 'Account Suspension',
    body: 'We may suspend or terminate access to the platform if a user violates these terms, engages in fraudulent behavior, or otherwise misuses the service.',
  },
  {
    title: 'User Responsibilities',
    body: 'You agree to use the platform only for lawful purposes and not to interfere with the operation, security, or integrity of our services.',
  },
  {
    title: 'Prohibited Activities',
    body: 'Unauthorized sharing of content, impersonation, scraping, automated misuse, and attempts to bypass payment or access controls are prohibited.',
  },
  {
    title: 'Disclaimer',
    body: 'The platform is provided on an “as is” basis. We do not guarantee uninterrupted access or that all content will be error-free.',
  },
  {
    title: 'Limitation of Liability',
    body: 'Daily Tutors shall not be liable for indirect, incidental, or consequential damages arising from the use of the platform, except where prohibited by law.',
  },
  {
    title: 'Governing Law (India)',
    body: 'These terms are governed by the laws of India, and any dispute shall be subject to the jurisdiction of the courts in India.',
  },
  {
    title: 'Contact',
    body: 'If you have any questions regarding these Terms and Conditions, please contact us at hello@dailytutors.in.',
  },
]

export const metadata = {
  title: 'Terms and Conditions',
  description: 'Review the terms governing your use of Daily Tutors courses and services.',
}

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      description="These terms explain how you may use the Daily Tutors platform and the responsibilities of both parties."
      updated="19 July 2026"
      badge="Terms"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Terms and Conditions' }]}
    >
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <SectionTitle>{section.title}</SectionTitle>
            <SectionText className="mt-3">{section.body}</SectionText>
          </section>
        ))}

        <section className="rounded-2xl border border-brand-border bg-brand-surface p-6">
          <SectionTitle>Important note</SectionTitle>
          <ul className="mt-4 space-y-2">
            <ListItem>Use of the platform is subject to these terms and any relevant course-specific rules.</ListItem>
            <ListItem>We may revise the terms from time to time, and continued use implies acceptance of the latest version.</ListItem>
          </ul>
        </section>
      </div>
    </LegalPage>
  )
}
