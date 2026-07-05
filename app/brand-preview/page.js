/* eslint-disable @next/next/no-img-element */

const SWATCHES = [
  { name: 'primary', hex: '#FFFFFF', bordered: true },
  { name: 'accent', hex: '#FF3131' },
  { name: 'accentDark', hex: '#D81F1F' },
  { name: 'accentLight', hex: '#FFEAEA', bordered: true },
  { name: 'textPrimary', hex: '#1A1A1A' },
  { name: 'textSecondary', hex: '#6B6B6B' },
  { name: 'border', hex: '#EAEAEA', bordered: true },
  { name: 'success', hex: '#1F9D55' },
  { name: 'warning', hex: '#F5A623' },
]

function Section({ title, children }) {
  return (
    <section className="mb-16">
      <h2 className="mb-6 font-heading text-2xl font-semibold text-brand-textPrimary">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function BrandPreview() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-16">
        <h1 className="font-heading text-4xl font-bold text-brand-textPrimary">
          Daily Tutors
        </h1>
        <p className="mt-2 text-brand-textSecondary">
          Brand foundation — visual checkpoint
        </p>
      </header>

      {/* Logos */}
      <Section title="Logos">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-brand-border bg-brand-primary p-8">
            <img
              src="/logo-full.png"
              alt="Daily Tutors full logo"
              className="h-16 w-auto"
            />
            <span className="text-sm text-brand-textSecondary">
              logo-full.png · navbar
            </span>
          </div>
          <div className="flex flex-col items-center gap-4 rounded-xl border border-brand-border bg-brand-primary p-8">
            <img
              src="/logo-icon.png"
              alt="Daily Tutors icon"
              className="h-16 w-16"
            />
            <span className="text-sm text-brand-textSecondary">
              logo-icon.png · favicon (512×512)
            </span>
          </div>
        </div>
      </Section>

      {/* Color swatches */}
      <Section title="Colors">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {SWATCHES.map((s) => (
            <div
              key={s.name}
              className="overflow-hidden rounded-xl border border-brand-border"
            >
              <div
                className={`h-24 w-full ${s.bordered ? 'border-b border-brand-border' : ''}`}
                style={{ backgroundColor: s.hex }}
              />
              <div className="bg-brand-primary px-4 py-3">
                <p className="font-heading text-sm font-semibold text-brand-textPrimary">
                  brand-{s.name}
                </p>
                <p className="font-mono text-xs uppercase text-brand-textSecondary">
                  {s.hex}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Button */}
      <Section title="Button">
        <button
          type="button"
          className="rounded-lg bg-brand-accent px-6 py-3 font-medium text-white transition-colors hover:bg-brand-accentDark"
        >
          Get started
        </button>
        <p className="mt-3 text-sm text-brand-textSecondary">
          accent background · white text · accent-dark on hover
        </p>
      </Section>

      {/* Card */}
      <Section title="Card">
        <div className="max-w-sm rounded-xl border border-brand-border bg-brand-primary p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold text-brand-textPrimary">
            Introduction to Design
          </h3>
          <p className="mt-2 text-sm text-brand-textSecondary">
            A short course that walks you through the fundamentals of visual
            design, color, and typography.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-brand-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accentDark"
          >
            Enroll now
          </button>
        </div>
      </Section>
    </main>
  )
}
