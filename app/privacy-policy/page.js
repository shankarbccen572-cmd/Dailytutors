import Link from 'next/link'
import LegalPage from '@/components/LegalPage'
import { SectionTitle, SectionText, ListItem } from '@/components/ui/typography'

const sections = [
  {
    title: 'Introduction',
    body: 'At Daily Tutors, we respect your privacy and are committed to handling your personal information with care. This Privacy Policy explains what information we collect, how we use it, and the choices you have when using our platform.',
  },
  {
    title: 'Information We Collect',
    body: 'We collect information that helps us operate the platform, provide courses, process payments, and improve the learning experience. This includes information you provide directly, data that arrives through our services, and information gathered by cookies and similar tools.',
  },
  {
    title: 'Personal Information',
    body: 'When you sign up, create an account, or contact us, we may collect your name, email address, phone number, education level, and account preferences. We may also store profile information needed to deliver course access and support services.',
  },
  {
    title: 'Payment Information',
    body: 'Payments for course purchases are securely processed through Razorpay. We do not store your card details on our servers. Razorpay handles the payment transaction and security checks according to its own privacy and compliance practices.',
  },
  {
    title: 'Device Information',
    body: 'We may collect device and browser details, IP address, operating system, app or website usage patterns, and referral information to maintain security, detect fraud, and improve performance.',
  },
  {
    title: 'Cookies',
    body: 'We use cookies and similar tracking technologies to remember your preferences, keep you signed in, and understand how visitors use our website. These may include essential cookies, authentication cookies, analytics cookies, and functional cookies.',
  },
  {
    title: 'How We Use Information',
    body: 'We use the information we collect to provide access to online courses, process payments securely, maintain user accounts, communicate updates, and improve the platform. We may also use aggregated data to better understand learner preferences and product performance.',
  },
  {
    title: 'Data Security',
    body: 'We use commercially reasonable safeguards to protect the information we collect. However, no system is completely immune to risk, and we encourage users to keep their login credentials secure and contact us promptly if they notice any suspicious activity.',
  },
  {
    title: 'Third-party Services',
    body: 'Our platform may use trusted third-party services such as Razorpay for payments, Google Authentication for sign-in, Cloudinary for media storage, MongoDB for data storage, and Vercel for hosting and deployment. These providers are used only where necessary to deliver the experience you expect.',
  },
  {
    title: 'User Rights',
    body: 'Depending on applicable law, you may have the right to access, correct, update, or request deletion of your personal information, or to withdraw consent for certain processing. Please contact us if you would like to exercise these rights.',
  },
  {
    title: 'Children\'s Privacy',
    body: 'Our services are intended for students and users who are old enough to use the platform independently or with guardian permission. We do not knowingly collect sensitive personal data from children without appropriate consent.',
  },
  {
    title: 'Policy Updates',
    body: 'We may update this Privacy Policy from time to time to reflect changes in our services, laws, or security practices. Any revised policy will be posted on this page with an updated effective date.',
  },
  {
    title: 'Contact Information',
    body: 'If you have questions about this Privacy Policy or your personal information, please reach out to us at tutorsdaily@gmail.com.',
  },
]

export const metadata = {
  title: 'Privacy Policy',
  description: 'Read Daily Tutors privacy practices for data collection, payments, security, and your rights.',
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="We are committed to protecting your personal information and handling it responsibly across our learning platform."
      updated="19 July 2026"
      badge="Privacy"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]}
    >
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <SectionTitle>{section.title}</SectionTitle>
            <SectionText className="mt-3">{section.body}</SectionText>
          </section>
        ))}

        <section>
          <SectionTitle>Key Services We Use</SectionTitle>
          <ul className="mt-4 space-y-2">
            <ListItem>Razorpay for payment processing</ListItem>
            <ListItem>Google Authentication for sign-in and account access</ListItem>
            <ListItem>Cloudinary for media hosting and delivery</ListItem>
            <ListItem>MongoDB for storing course and user account data</ListItem>
            <ListItem>Vercel for secure hosting and deployment of the platform</ListItem>
          </ul>
        </section>

        <section className="rounded-2xl border border-brand-border bg-brand-surface p-6">
          <SectionTitle>Questions or concerns?</SectionTitle>
          <SectionText className="mt-3">
            Contact our support team at <Link href="mailto:tutorsdaily@gmail.com" className="font-semibold text-brand-accent">tutorsdaily@gmail.com</Link>.
          </SectionText>
        </section>
      </div>
    </LegalPage>
  )
}
