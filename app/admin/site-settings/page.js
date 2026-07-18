'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { SITE_DEFAULTS, SOCIAL_TYPES, mergeSiteSettings } from '@/lib/siteDefaults'
import { ICON_NAMES } from '@/lib/icons'
import { uploadImageToCloudinary } from '@/lib/cloudinaryUpload'

/* ---------- small presentational helpers ---------- */

const inputCls =
  'w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2 text-sm text-brand-textPrimary outline-none focus:border-brand-accent'

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      {label ? <label className="mb-1.5 block text-sm font-medium text-brand-textSecondary">{label}</label> : null}
      <input type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  )
}

function Area({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      {label ? <label className="mb-1.5 block text-sm font-medium text-brand-textSecondary">{label}</label> : null}
      <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  )
}

function IconSelect({ label, value, onChange }) {
  return (
    <div>
      {label ? <label className="mb-1.5 block text-sm font-medium text-brand-textSecondary">{label}</label> : null}
      <select value={value || 'Sparkles'} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {ICON_NAMES.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
    </div>
  )
}

function Section({ title, desc, children }) {
  return (
    <section className="rounded-3xl border border-brand-border bg-white p-6 shadow-card">
      <h2 className="text-lg font-semibold text-brand-textPrimary">{title}</h2>
      {desc ? <p className="mt-1 text-sm text-brand-textSecondary">{desc}</p> : null}
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  )
}

function AddButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold text-brand-textPrimary transition hover:bg-brand-accentLight"
    >
      <Plus className="h-4 w-4" /> {children}
    </button>
  )
}

function RemoveButton({ onClick, label = 'Remove' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border px-3 py-2 text-xs font-semibold text-brand-textSecondary transition hover:bg-brand-accentLight"
    >
      <Trash2 className="h-3.5 w-3.5" /> {label}
    </button>
  )
}

/* ---------- page ---------- */

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState(SITE_DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/site-settings')
        if (!res.ok) throw new Error('load')
        const data = await res.json()
        setSettings(mergeSiteSettings(data))
      } catch {
        setError('Unable to load settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function save(updated = settings) {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error('save')
      const data = await res.json()
      setSettings(mergeSiteSettings(data))
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Unable to save settings')
    } finally {
      setSaving(false)
    }
  }

  /* generic state helpers */
  const setKey = (key, value) => setSettings((p) => ({ ...p, [key]: value }))
  const setItem = (key, index, patch) =>
    setSettings((p) => ({ ...p, [key]: p[key].map((it, i) => (i === index ? { ...it, ...patch } : it)) }))
  const addItem = (key, item) => setSettings((p) => ({ ...p, [key]: [...(p[key] || []), item] }))
  const removeItem = (key, index) => setSettings((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== index) }))

  function updateBanner(index, key, value) {
    setItem('heroBanners', index, { [key]: key === 'position' ? Number(value) : value })
  }

  async function uploadBannerImage(index, file) {
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const url = await uploadImageToCloudinary(file, 'hero-banners')
      const next = {
        ...settings,
        heroBanners: settings.heroBanners.map((b, i) => (i === index ? { ...b, imageUrl: url } : b)),
      }
      setSettings(next)
      await save(next)
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-brand-textSecondary">Loading site settings…</div>
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Sticky save bar */}
      <div className="sticky top-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-4 border-b border-brand-border bg-brand-surface/90 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-textPrimary">Landing page content</h1>
          <p className="text-sm text-brand-textSecondary">Everything on the public pages is edited here.</p>
        </div>
        <button
          onClick={() => save()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-accent transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-brand-warning/30 bg-brand-warning/10 p-4 text-sm text-brand-warning">{error}</div>
      ) : null}

      {/* NAVBAR */}
      <Section title="Navbar links" desc="Top navigation links shown on every public page.">
        {settings.navbarLinks.map((link, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Label" value={link.label} onChange={(v) => setItem('navbarLinks', index, { label: v })} />
            <Field label="Href" value={link.href} onChange={(v) => setItem('navbarLinks', index, { href: v })} />
            <RemoveButton onClick={() => removeItem('navbarLinks', index)} />
          </div>
        ))}
        <AddButton onClick={() => addItem('navbarLinks', { label: 'New link', href: '/' })}>Add nav link</AddButton>
      </Section>

      {/* HERO BANNERS */}
      <Section title="Hero banners" desc="Slides shown in the homepage hero carousel.">
        {(settings.heroBanners || []).map((banner, index) => (
          <div key={index} className="space-y-4 rounded-2xl border border-brand-border bg-brand-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-brand-textPrimary">Banner {index + 1}</h3>
              <RemoveButton onClick={() => removeItem('heroBanners', index)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title" value={banner.title} onChange={(v) => updateBanner(index, 'title', v)} />
              <Field label="Subtitle" value={banner.subtitle} onChange={(v) => updateBanner(index, 'subtitle', v)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Field label="Banner image URL" value={banner.imageUrl} onChange={(v) => updateBanner(index, 'imageUrl', v)} placeholder="https://..." />
                <p className="mt-2 text-xs text-brand-textSecondary">Or upload a local image below.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-textSecondary">Upload image</label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => uploadBannerImage(index, e.target.files?.[0])}
                  className="w-full rounded-xl border border-brand-border bg-white px-4 py-2 text-sm text-brand-textPrimary outline-none file:mr-3 file:rounded-md file:border-0 file:bg-brand-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-accentDark"
                />
                {uploading && <p className="mt-2 text-xs text-brand-textSecondary">Uploading…</p>}
                {uploadError && <p className="mt-2 text-xs text-brand-warning">{uploadError}</p>}
                {banner.imageUrl ? (
                  <div className="mt-3 space-y-2">
                    <img src={banner.imageUrl} alt={`Banner ${index + 1}`} className="h-24 w-full rounded-xl object-contain" style={{ backgroundColor: banner.bgColor }} />
                    <button
                      type="button"
                      onClick={() => updateBanner(index, 'imageUrl', '')}
                      className="inline-flex items-center rounded-xl border border-brand-border px-3 py-2 text-xs font-semibold text-brand-textSecondary transition hover:bg-brand-accentLight"
                    >
                      Remove image
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="CTA text" value={banner.ctaText} onChange={(v) => updateBanner(index, 'ctaText', v)} />
              <Field label="CTA href" value={banner.ctaHref} onChange={(v) => updateBanner(index, 'ctaHref', v)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <Field label="Position" type="number" value={banner.position ?? index + 1} onChange={(v) => updateBanner(index, 'position', v)} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-textSecondary">Size</label>
                <select value={banner.size || 'medium'} onChange={(e) => updateBanner(index, 'size', e.target.value)} className={inputCls}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
                <p className="mt-1 text-xs text-brand-textSecondary">Controls banner height.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-textSecondary">Background</label>
                <input type="color" value={banner.bgColor} onChange={(e) => updateBanner(index, 'bgColor', e.target.value)} className="h-10 w-full rounded-xl border border-brand-border bg-white px-3 py-1" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-textSecondary">Text color</label>
                <input type="color" value={banner.textColor} onChange={(e) => updateBanner(index, 'textColor', e.target.value)} className="h-10 w-full rounded-xl border border-brand-border bg-white px-3 py-1" />
              </div>
            </div>
          </div>
        ))}
        <AddButton
          onClick={() =>
            addItem('heroBanners', { title: 'New banner', subtitle: '', imageUrl: '', bgColor: '#D92F2F', textColor: '#FFFFFF', ctaText: 'Learn more', ctaHref: '/courses', position: (settings.heroBanners?.length || 0) + 1 })
          }
        >
          Add banner
        </AddButton>
      </Section>

      {/* HERO STATS */}
      <Section title="Hero stats" desc="The three numbers shown just below the hero.">
        {settings.heroStats.map((item, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Value" value={item.value} onChange={(v) => setItem('heroStats', index, { value: v })} />
            <Field label="Label" value={item.label} onChange={(v) => setItem('heroStats', index, { label: v })} />
            <RemoveButton onClick={() => removeItem('heroStats', index)} />
          </div>
        ))}
        <AddButton onClick={() => addItem('heroStats', { value: '', label: '' })}>Add stat</AddButton>
      </Section>

      {/* HIGHLIGHTS */}
      <Section title="Highlights" desc="The compact 3-across cards under the stats (e.g. Daily Live).">
        {settings.highlights.map((h, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-[10rem_1fr_1fr_auto] sm:items-end">
            <IconSelect label="Icon" value={h.icon} onChange={(v) => setItem('highlights', index, { icon: v })} />
            <Field label="Title" value={h.title} onChange={(v) => setItem('highlights', index, { title: v })} />
            <Field label="Subtitle" value={h.sub} onChange={(v) => setItem('highlights', index, { sub: v })} />
            <RemoveButton onClick={() => removeItem('highlights', index)} />
          </div>
        ))}
        <AddButton onClick={() => addItem('highlights', { icon: 'Sparkles', title: '', sub: '' })}>Add highlight</AddButton>
      </Section>

      {/* EXAM SECTION */}
      <Section title="Exam categories section" desc="Heading text and the category cards.">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Badge" value={settings.examBadge} onChange={(v) => setKey('examBadge', v)} />
          <Field label="Heading" value={settings.examHeading} onChange={(v) => setKey('examHeading', v)} />
          <Field label="Subheading" value={settings.examSubheading} onChange={(v) => setKey('examSubheading', v)} />
        </div>
        <div className="space-y-3 border-t border-brand-border pt-4">
          {settings.examCategories.map((cat, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[10rem_1fr_1.4fr_1fr_auto] sm:items-end rounded-2xl border border-brand-border bg-brand-surface p-3">
              <IconSelect label="Icon" value={cat.icon} onChange={(v) => setItem('examCategories', index, { icon: v })} />
              <Field label="Title" value={cat.title} onChange={(v) => setItem('examCategories', index, { title: v })} />
              <Field
                label="Tags (comma-separated)"
                value={(cat.tags || []).join(', ')}
                onChange={(v) => setItem('examCategories', index, { tags: v.split(',').map((t) => t.trim()).filter(Boolean) })}
              />
              <Field label="Link" value={cat.href} onChange={(v) => setItem('examCategories', index, { href: v })} />
              <RemoveButton onClick={() => removeItem('examCategories', index)} />
            </div>
          ))}
          <AddButton onClick={() => addItem('examCategories', { icon: 'Sparkles', title: '', tags: [], href: '/courses' })}>Add category</AddButton>
        </div>
      </Section>

      {/* WHY SECTION */}
      <Section title="Why-choose section" desc="Heading and the feature chips.">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Badge" value={settings.whyBadge} onChange={(v) => setKey('whyBadge', v)} />
          <Field label="Heading" value={settings.whyHeading} onChange={(v) => setKey('whyHeading', v)} />
          <Field label="Subheading" value={settings.whySubheading} onChange={(v) => setKey('whySubheading', v)} />
        </div>
        <div className="space-y-3 border-t border-brand-border pt-4">
          {settings.featureLabels.map((label, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field label={index === 0 ? 'Feature' : ''} value={label} onChange={(v) => setKey('featureLabels', settings.featureLabels.map((f, i) => (i === index ? v : f)))} />
              <RemoveButton onClick={() => removeItem('featureLabels', index)} />
            </div>
          ))}
          <AddButton onClick={() => addItem('featureLabels', '')}>Add feature</AddButton>
        </div>
      </Section>

      {/* CTA */}
      <Section title="Closing call-to-action" desc="The red banner near the bottom of the homepage.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Heading" value={settings.ctaHeading} onChange={(v) => setKey('ctaHeading', v)} />
          <Field label="Subtitle" value={settings.ctaSubtitle} onChange={(v) => setKey('ctaSubtitle', v)} />
          <Field label="Primary button label" value={settings.ctaPrimaryLabel} onChange={(v) => setKey('ctaPrimaryLabel', v)} />
          <Field label="Secondary button label" value={settings.ctaSecondaryLabel} onChange={(v) => setKey('ctaSecondaryLabel', v)} />
          <Field label="Secondary button link" value={settings.ctaSecondaryHref} onChange={(v) => setKey('ctaSecondaryHref', v)} />
        </div>
      </Section>

      {/* COURSES PAGE */}
      <Section title="Courses page header" desc="Text at the top of the /courses catalog page.">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Badge" value={settings.coursesBadge} onChange={(v) => setKey('coursesBadge', v)} />
          <Field label="Title" value={settings.coursesTitle} onChange={(v) => setKey('coursesTitle', v)} />
          <Field label="Subtitle" value={settings.coursesSubtitle} onChange={(v) => setKey('coursesSubtitle', v)} />
        </div>
      </Section>

      {/* FOOTER */}
      <Section title="Footer" desc="About text, link columns, socials and the copyright line.">
        <Area label="About text" value={settings.footerAbout} onChange={(v) => setKey('footerAbout', v)} />

        <div className="space-y-4 border-t border-brand-border pt-4">
          <p className="text-sm font-semibold text-brand-textPrimary">Link columns</p>
          {settings.footerColumns.map((col, ci) => (
            <div key={ci} className="space-y-3 rounded-2xl border border-brand-border bg-brand-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <Field label="Column title" value={col.title} onChange={(v) => setItem('footerColumns', ci, { title: v })} />
                <div className="pt-6"><RemoveButton onClick={() => removeItem('footerColumns', ci)} label="Remove column" /></div>
              </div>
              {(col.links || []).map((link, li) => (
                <div key={li} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <Field label="Label" value={link.label} onChange={(v) => setItem('footerColumns', ci, { links: col.links.map((l, i) => (i === li ? { ...l, label: v } : l)) })} />
                  <Field label="Href" value={link.href} onChange={(v) => setItem('footerColumns', ci, { links: col.links.map((l, i) => (i === li ? { ...l, href: v } : l)) })} />
                  <RemoveButton onClick={() => setItem('footerColumns', ci, { links: col.links.filter((_, i) => i !== li) })} />
                </div>
              ))}
              <AddButton onClick={() => setItem('footerColumns', ci, { links: [...(col.links || []), { label: 'New', href: '/' }] })}>Add link</AddButton>
            </div>
          ))}
          <AddButton onClick={() => addItem('footerColumns', { title: 'New column', links: [] })}>Add column</AddButton>
        </div>

        <div className="space-y-3 border-t border-brand-border pt-4">
          <p className="text-sm font-semibold text-brand-textPrimary">Social links</p>
          {settings.socialLinks.map((soc, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-textSecondary">Type</label>
                <select value={soc.type} onChange={(e) => setItem('socialLinks', index, { type: e.target.value })} className={inputCls}>
                  {SOCIAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Field label="URL" value={soc.href} onChange={(v) => setItem('socialLinks', index, { href: v })} placeholder="https://..." />
              <RemoveButton onClick={() => removeItem('socialLinks', index)} />
            </div>
          ))}
          <AddButton onClick={() => addItem('socialLinks', { type: 'mail', href: '' })}>Add social</AddButton>
        </div>

        <div className="border-t border-brand-border pt-4">
          <Field label="Copyright line" value={settings.footerText} onChange={(v) => setKey('footerText', v)} />
        </div>
      </Section>
    </div>
  )
}
