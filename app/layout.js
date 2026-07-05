import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dailytutors.in'

// Body / UI text
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Headings (600 / 700)
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Daily Tutors | Smart Learning for Boards, NEET, JEE, UPSC & More',
    template: '%s | Daily Tutors',
  },
  description:
    'Daily Tutors offers expert-led online coaching for Class 8–12, NEET, JEE, CET, UPSC, CA and more with live classes, recorded lessons, tests and mentorship.',
  keywords: [
    'Daily Tutors',
    'online coaching',
    'NEET coaching',
    'JEE coaching',
    'UPSC coaching',
    'CA coaching',
    'board exam preparation',
    'live classes',
    'online classes India',
  ],
  applicationName: 'Daily Tutors',
  authors: [{ name: 'Daily Tutors' }],
  creator: 'Daily Tutors',
  publisher: 'Daily Tutors',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Daily Tutors',
    title: 'Daily Tutors | Smart Learning for Boards, NEET, JEE, UPSC & More',
    description:
      'Expert-guided online learning for students preparing for boards, entrance exams and competitive exams in India.',
    images: [
      {
        url: '/logo-full.png',
        width: 1200,
        height: 630,
        alt: 'Daily Tutors',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Tutors | Smart Learning for Boards, NEET, JEE, UPSC & More',
    description:
      'Expert-guided online learning for students preparing for boards, entrance exams and competitive exams in India.',
    images: ['/logo-full.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/logo-icon.png',
    shortcut: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
  other: {
    'theme-color': '#f4f7ff',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
