import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import CookieConsentBanner from '@/components/CookieConsentBanner'
import ScrollToTop from '@/components/ScrollToTop'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dailytutors.in'

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
    default: 'Daily Tutors - Online Coaching for 9th/10th, PUC, NEET, CET & JEE',
    template: '%s | Daily Tutors',
  },
  description:
    'Daily Tutors provides expert-led online coaching for Class 9/10, PUC, NEET, CET, JEE with live classes, recorded lessons, mock tests and mentorship.',
  keywords: [
    'Daily Tutors',
    'online coaching',
    'NEET coaching',
    'JEE coaching',
    'CET coaching',
    '9th class coaching',
    '10th class coaching',
    'PUC coaching',
    'board exam preparation',
    'live classes',
  ],
  applicationName: 'Daily Tutors',
  authors: [{ name: 'Daily Tutors' }],
  creator: 'Daily Tutors',
  publisher: 'Daily Tutors',
  category: 'Education',
  classification: 'Online learning platform',
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Daily Tutors',
    title: 'Daily Tutors - Online Coaching for 9th/10th, PUC, NEET, CET & JEE',
    description:
      'Expert-guided online learning for students preparing for boards, NEET, JEE, CET and PUC.',
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
    title: 'Daily Tutors - Online Coaching for 9th/10th, PUC, NEET, CET & JEE',
    description:
      'Expert-guided online learning for students preparing for boards, NEET, JEE, CET and PUC.',
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
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  other: {
    'theme-color': '#f4f7ff',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f4f7ff',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <Providers>
          {children}
          <CookieConsentBanner />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  )
}
