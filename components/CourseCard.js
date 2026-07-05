/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { GraduationCap, Users, Sparkles, Tag } from 'lucide-react'

// Marketing course card used on the catalog and the dashboard "explore" grid.
export default function CourseCard({ course: c }) {
  const price = c.discountPrice > 0 ? c.discountPrice : c.originalPrice
  const hasDiscount = c.discountPrice > 0 && c.originalPrice > c.discountPrice
  const discountPct = hasDiscount
    ? Math.round(((c.originalPrice - c.discountPrice) / c.originalPrice) * 100)
    : 0
  const isFree = !c.originalPrice && !c.discountPrice

  return (
    <div
      className="group flex flex-col rounded-2xl border bg-white p-3 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover"
      style={{ borderColor: c.cardBorderColor || '#EAEAEA' }}
    >
      {/* Thumbnail + Badge ribbon */}
      <Link
        href={`/courses/${c.slug}`}
        className="relative block aspect-video w-full overflow-hidden rounded-xl bg-brand-accentLight/40"
      >
        <span
          className="absolute left-0 top-3 z-10 inline-flex items-center gap-1.5 rounded-r-md py-1 pl-3 pr-3.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-accent"
          style={{ backgroundColor: c.badgeColor || '#FF3131' }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          {c.badgeLabel || 'Online'}
        </span>
        {c.thumbnail ? (
          <img
            src={c.thumbnail}
            alt={c.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-accent/40">
            <GraduationCap className="h-12 w-12" />
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col px-1 pt-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/courses/${c.slug}`}>
            <h3 className="font-heading text-base font-semibold text-brand-textPrimary group-hover:text-brand-accentDark">
              {c.title}
            </h3>
          </Link>
          {c.language && (
            <span className="shrink-0 rounded-full bg-brand-surface px-2.5 py-1 text-xs font-medium text-brand-textSecondary">
              {c.language}
            </span>
          )}
        </div>

        {/* Meta rows */}
        <div className="mt-3 space-y-1.5 text-sm text-brand-textSecondary">
          {c.examTarget && (
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0 text-brand-accent" />
              For {c.examTarget} Aspirants
            </p>
          )}
          {c.instructorName && (
            <p className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 shrink-0 text-brand-accent" />
              {c.instructorName}
            </p>
          )}
        </div>

        {/* Premium feature strip */}
        <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-textPrimary px-3 py-2">
          <span className="flex items-center gap-2 text-xs font-medium text-white">
            <Sparkles className="h-4 w-4 text-brand-warning" />
            {c.premiumFeatureText || 'Premium Features Included'}
          </span>
          <span
            className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: c.premiumBadgeColor || '#F59E0B' }}
          >
            {c.premiumBadgeLabel || 'Pro'}
          </span>
        </div>

        <div className="mt-4 flex-1" />

        {/* Price */}
        <div className="pt-3" style={{ borderTop: `1px solid ${c.cardBorderColor || '#EAEAEA'}` }}>
          <div className="flex items-end justify-between gap-2">
            <div>
              {isFree ? (
                <span className="font-heading text-xl font-bold text-brand-success">
                  Free
                </span>
              ) : (
                <span className="flex items-baseline gap-2">
                  <span className="font-heading text-xl font-bold text-brand-accent">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-brand-textSecondary line-through">
                      ₹{c.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </span>
              )}
              <p className="text-[11px] uppercase tracking-wide text-brand-textSecondary">
                For full batch
              </p>
            </div>
            {hasDiscount && (
              <span className="mb-0.5 flex items-center gap-1 rounded-full bg-brand-success/10 px-2 py-1 text-xs font-semibold text-brand-success">
                <Tag className="h-3.5 w-3.5" />
                {discountPct}% off
              </span>
            )}
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            href={`/courses/${c.slug}`}
            className="rounded-xl border px-4 py-2.5 text-center text-sm font-semibold transition-colors hover:bg-opacity-10"
            style={{
              borderColor: c.exploreButtonColor || '#FF3131',
              color: c.exploreButtonColor || '#FF3131',
            }}
          >
            Explore
          </Link>
          <Link
            href={`/courses/${c.slug}`}
            className="rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: c.buyNowButtonColor || '#FF3131' }}
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  )
}
