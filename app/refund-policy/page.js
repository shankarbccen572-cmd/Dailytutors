import LegalPage from '@/components/LegalPage'
import { SectionTitle, SectionText, ListItem } from '@/components/ui/typography'

const sections = [
  {
    title: 'Digital Products',
    body: 'All courses and learning materials provided through Daily Tutors are digital products. Refunds are assessed based on access, eligibility, and the nature of the purchase.',
  },
  {
    title: 'Course Purchases',
    body: 'If a course is purchased but access has not yet been provided or there is a technical issue preventing use, you may request a review of your purchase.',
  },
  {
    title: 'Duplicate Payments',
    body: 'If a duplicate payment is identified for the same course purchase, we will review the transaction and process a refund for the duplicate amount where appropriate.',
  },
  {
    title: 'Failed Transactions',
    body: 'If a payment fails but your account shows a pending or unsuccessful charge, we recommend contacting support for verification before requesting a refund.',
  },
  {
    title: 'Technical Issues',
    body: 'If you experience a technical issue that prevents access to purchased content despite reasonable attempts to resolve it, please contact support with details so we can investigate.',
  },
  {
    title: 'Refund Eligibility',
    body: 'Refunds are generally considered for duplicate or failed payments, inaccessible content caused by technical issues, or cases where the purchase was made in error. Refunds are not guaranteed in all situations.',
  },
  {
    title: 'Refund Timeline',
    body: 'Approved refunds are typically processed within 7–10 business days after confirmation, depending on the payment method and banking/processor timelines.',
  },
  {
    title: 'Subscription Cancellation',
    body: 'If a subscription or recurring plan is offered, you may contact support to request cancellation. Access will continue until the end of the paid period unless otherwise stated.',
  },
  {
    title: 'Contact Support',
    body: 'Please email tutorsdaily@gmail.com with your order details, payment reference, and a description of the issue if you need help with a refund or cancellation request.',
  },
]

export const metadata = {
  title: 'Refund and Cancellation Policy',
  description: 'Understand refund eligibility, timelines, and support for course purchases on Daily Tutors.',
}

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      description="We aim to make refunds simple and transparent for digital course purchases and payment issues."
      updated="19 July 2026"
      badge="Refunds"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Refund Policy' }]}
    >
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <SectionTitle>{section.title}</SectionTitle>
            <SectionText className="mt-3">{section.body}</SectionText>
          </section>
        ))}

        <section className="rounded-2xl border border-brand-border bg-brand-surface p-6">
          <SectionTitle>Need help?</SectionTitle>
          <ul className="mt-4 space-y-2">
            <ListItem>Include your order ID, payment reference, and the issue you experienced.</ListItem>
            <ListItem>We review all refund requests carefully and will respond as quickly as possible.</ListItem>
          </ul>
        </section>
      </div>
    </LegalPage>
  )
}
