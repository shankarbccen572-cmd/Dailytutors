/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { SITE_DEFAULTS } from '@/lib/siteDefaults'

// Inline social icons keyed by type — kept local so we don't depend on
// brand-icon exports that vary between lucide-react versions.
const svg = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const SOCIAL_ICONS = {
  instagram: (
    <svg {...svg}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  linkedin: (
    <svg {...svg}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-9h4v1.5" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  youtube: (
    <svg {...svg}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-2C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  ),
  twitter: (
    <svg {...svg}>
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  ),
  facebook: (
    <svg {...svg}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  whatsapp: (
    <svg {...svg}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
    </svg>
  ),
  mail: (
    <svg {...svg}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 5L2 7" />
    </svg>
  ),
}

export default function SiteFooter({
  about = SITE_DEFAULTS.footerAbout,
  columns = SITE_DEFAULTS.footerColumns,
  socials = SITE_DEFAULTS.socialLinks,
  footerText = SITE_DEFAULTS.footerText,
}) {
  const cols = Array.isArray(columns) ? columns : []
  const social = (Array.isArray(socials) ? socials : []).filter((x) => x?.href)

  return (
    <footer className="border-t border-brand-border bg-brand-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <img src="/logo-full.png" alt="Daily Tutors" className="h-11 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-textSecondary">{about}</p>
            {social.length ? (
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                {social.map((item, i) => (
                  <a
                    key={`${item.type}-${i}`}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    aria-label={item.type}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-textSecondary transition hover:-translate-y-0.5 hover:border-brand-accent hover:text-brand-accent hover:shadow-card"
                  >
                    {SOCIAL_ICONS[item.type] || SOCIAL_ICONS.mail}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {cols.map((col, i) => (
            <div key={`${col.title}-${i}`}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-textPrimary">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {(col.links || []).map((link, li) => (
                  <li key={`${link.label}-${li}`}>
                    <Link href={link.href || '/'} className="text-sm text-brand-textSecondary transition hover:text-brand-accent">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-brand-border pt-6 sm:flex-row">
          <p className="text-center text-sm text-brand-textSecondary sm:text-left">{footerText}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-brand-textSecondary sm:justify-end">
            <Link href="/privacy-policy" className="transition hover:text-brand-textPrimary">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="transition hover:text-brand-textPrimary">Terms</Link>
            <Link href="/refund-policy" className="transition hover:text-brand-textPrimary">Refund Policy</Link>
            <Link href="/cookie-policy" className="transition hover:text-brand-textPrimary">Cookie Policy</Link>
            <Link href="/about" className="transition hover:text-brand-textPrimary">About</Link>
            <Link href="/contact" className="transition hover:text-brand-textPrimary">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
