import Breadcrumbs from '@/components/Breadcrumbs'
import { Separator } from '@/components/ui/separator'
import { PageTitle, SectionText } from '@/components/ui/typography'

export default function LegalPage({ title, description, updated, breadcrumbs = [], badge = 'Policy', children }) {
  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-brand-border bg-white shadow-card">
          <div className="bg-hero-glow p-8 lg:p-10">
            <div className="inline-flex items-center rounded-full border border-brand-border bg-white/90 px-3 py-1 text-sm font-medium text-brand-textSecondary shadow-sm">
              {badge}
            </div>
            <PageTitle className="mt-6">{title}</PageTitle>
            <SectionText className="mt-4 max-w-3xl">{description}</SectionText>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-brand-textSecondary">
              <span className="inline-flex items-center rounded-full bg-brand-accentLight px-3 py-1 font-medium text-brand-accent">
                Last updated {updated}
              </span>
            </div>
          </div>

          <Separator />

          <div className="p-8 lg:p-10">{children}</div>
        </div>
      </div>
    </div>
  )
}
