'use client'

import { useEffect, useState } from 'react'
import { Plus, Save } from 'lucide-react'

const DEFAULT_SETTING = {
  navbarLinks: [
    { label: 'Courses', href: '/courses' },
    { label: 'Learn', href: '/learn' },
    { label: 'Login', href: '/login' },
  ],
  heroBanners: [
    {
      title: '8 AM IST • Every Morning',
      subtitle: 'Start your day with curated current affairs from The Hindu, PIB, and Indian Express.',
      imageUrl: '',
      bgColor: '#8B0000',
      textColor: '#FFFFFF',
      ctaText: "Read Today's Brief",
      ctaHref: '/courses',
      position: 1,
    },
    {
      title: 'Live Classes Every Day',
      subtitle: 'Stay on top of your syllabus with live sessions and doubt solving every day.',
      imageUrl: '',
      bgColor: '#B22222',
      textColor: '#FFFFFF',
      ctaText: 'Join Live Now',
      ctaHref: '/learn',
      position: 2,
    },
    {
      title: 'Practice with Mock Tests',
      subtitle: 'Build confidence with daily mock tests, quizzes, and performance tracking.',
      imageUrl: '',
      bgColor: '#C00000',
      textColor: '#FFFFFF',
      ctaText: 'Start Practice',
      ctaHref: '/courses',
      position: 3,
    },
    {
      title: 'Expert Mentorship',
      subtitle: 'Learn from experienced tutors who guide your prep with strategy and clarity.',
      imageUrl: '',
      bgColor: '#DC143C',
      textColor: '#FFFFFF',
      ctaText: 'Meet Mentors',
      ctaHref: '/login',
      position: 4,
    },
    {
      title: 'Track Progress Effortlessly',
      subtitle: 'Get daily analytics, scorecards, and study plans tailored for your goals.',
      imageUrl: '',
      bgColor: '#B22234',
      textColor: '#FFFFFF',
      ctaText: 'View Dashboard',
      ctaHref: '/dashboard',
      position: 5,
    },
  ],
  heroStats: [
    { value: '10k+', label: 'Active learners' },
    { value: '200+', label: 'Video lessons' },
    { value: '95%', label: 'Success mindset' },
  ],
  featureLabels: [
    'Expert Faculty with Real Experience',
    'Live & Recorded Classes',
    'Daily Practice Tests',
    'Personalized Mentorship',
    'Performance Tracking',
    'Doubt Clearing Sessions',
    'Study Materials & Notes',
  ],
  footerText: '© 2026 Daily Tutors. All rights reserved.',
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTING)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [error, setError] = useState('')

  function normalizeSettings(data) {
    return {
      ...DEFAULT_SETTING,
      ...data,
      navbarLinks: Array.isArray(data?.navbarLinks) ? data.navbarLinks : DEFAULT_SETTING.navbarLinks,
      heroBanners: Array.isArray(data?.heroBanners) ? data.heroBanners : DEFAULT_SETTING.heroBanners,
      heroStats: Array.isArray(data?.heroStats) ? data.heroStats : DEFAULT_SETTING.heroStats,
      featureLabels: Array.isArray(data?.featureLabels) ? data.featureLabels : DEFAULT_SETTING.featureLabels,
    }
  }

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/site-settings')
      if (!res.ok) {
        setError('Unable to load settings')
        setLoading(false)
        return
      }
      const data = await res.json()
      setSettings(normalizeSettings(data))
      setLoading(false)
    }
    load()
  }, [])

  async function save(updatedSettings = settings) {
    setSaving(true)
    setSaved(false)
    setError('')
    const res = await fetch('/api/admin/site-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSettings),
    })
    if (!res.ok) {
      setError('Unable to save settings')
      setSaving(false)
      return
    }
    const data = await res.json()
    setSettings(normalizeSettings(data))
    setSaved(true)
    setSaving(false)
    window.setTimeout(() => setSaved(false), 2000)
  }

  function updateBanner(index, key, value) {
    setSettings((prev) => {
      const next = [...prev.heroBanners]
      next[index] = {
        ...next[index],
        [key]: key === 'position' ? Number(value) : value,
      }
      return { ...prev, heroBanners: next }
    })
  }

  async function uploadBannerImage(index, file) {
    if (!file) return
    setUploading(true)
    setUploadError('')

    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Upload failed')
      }

      const nextSettings = {
        ...settings,
        heroBanners: settings.heroBanners.map((banner, i) =>
          i === index ? { ...banner, imageUrl: data.url } : banner
        ),
      }
      setSettings(nextSettings)
      await save(nextSettings)
    } catch (uploadErr) {
      setUploadError(uploadErr.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-brand-textSecondary">Loading site settings…</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-textPrimary">Landing Page Settings</h1>
          <p className="text-sm text-brand-textSecondary">
            Update the homepage hero banners, navbar, stats, and footer text.
          </p>
        </div>
        <button
          onClick={() => save()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-accent transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-brand-warning/30 bg-brand-warning/10 p-4 text-sm text-brand-warning">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-brand-border bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-brand-textPrimary">Navbar links</h2>
          <p className="mt-1 text-sm text-brand-textSecondary">Manage the top navigation links shown on the landing page.</p>
          <div className="mt-6 space-y-4">
            {settings.navbarLinks.map((link, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-brand-textSecondary">Label</label>
                  <input
                    value={link.label}
                    onChange={(event) =>
                      setSettings((prev) => {
                        const next = [...prev.navbarLinks]
                        next[index] = { ...next[index], label: event.target.value }
                        return { ...prev, navbarLinks: next }
                      })
                    }
                    className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2 text-sm text-brand-textPrimary outline-none focus:border-brand-accent"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-brand-textSecondary">Href</label>
                  <input
                    value={link.href}
                    onChange={(event) =>
                      setSettings((prev) => {
                        const next = [...prev.navbarLinks]
                        next[index] = { ...next[index], href: event.target.value }
                        return { ...prev, navbarLinks: next }
                      })
                    }
                    className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2 text-sm text-brand-textPrimary outline-none focus:border-brand-accent"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setSettings((prev) => ({
                ...prev,
                navbarLinks: [...prev.navbarLinks, { label: 'New link', href: '/#' }],
              }))
            }
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold text-brand-textPrimary transition hover:bg-brand-accentLight"
          >
            <Plus className="h-4 w-4" /> Add nav link
          </button>
        </section>

        <section className="rounded-3xl border border-brand-border bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-brand-textPrimary">Hero banners</h2>
          <p className="mt-1 text-sm text-brand-textSecondary">
            Add, remove, and configure banner slides shown in the homepage hero.
          </p>
          <div className="mt-6 space-y-6">
            {(settings.heroBanners || DEFAULT_SETTING.heroBanners).map((banner, index) => (
              <div key={index} className="space-y-4 rounded-3xl border border-brand-border bg-brand-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-brand-textPrimary">Banner {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        heroBanners: prev.heroBanners.filter((_, i) => i !== index),
                      }))
                    }
                    className="rounded-xl border border-brand-border px-3 py-2 text-xs font-semibold text-brand-textSecondary hover:bg-brand-accentLight"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-brand-textSecondary">Title</label>
                    <input
                      value={banner.title}
                      onChange={(event) => updateBanner(index, 'title', event.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-white px-4 py-2 text-sm text-brand-textPrimary outline-none focus:border-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-textSecondary">Subtitle</label>
                    <input
                      value={banner.subtitle}
                      onChange={(event) => updateBanner(index, 'subtitle', event.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-white px-4 py-2 text-sm text-brand-textPrimary outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-brand-textSecondary">Banner image URL</label>
                    <input
                      value={banner.imageUrl}
                      onChange={(event) => updateBanner(index, 'imageUrl', event.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-white px-4 py-2 text-sm text-brand-textPrimary outline-none focus:border-brand-accent"
                      placeholder="https://..."
                    />
                    <p className="mt-2 text-xs text-brand-textSecondary">
                      Or upload a local image to store under <code>/uploads/hero-banners</code>.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-textSecondary">Upload local image</label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(event) => uploadBannerImage(index, event.target.files?.[0])}
                      className="w-full rounded-xl border border-brand-border bg-white px-4 py-2 text-sm text-brand-textPrimary outline-none file:mr-3 file:rounded-md file:border-0 file:bg-brand-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-accentDark"
                    />
                    {uploading && <p className="mt-2 text-xs text-brand-textSecondary">Uploading image…</p>}
                    {uploadError && <p className="mt-2 text-xs text-brand-warning">{uploadError}</p>}
                    {banner.imageUrl ? (
                      <div className="mt-3 rounded-2xl border border-brand-border bg-white p-2">
                        <p className="text-xs text-brand-textSecondary">Current image preview</p>
                        <img
                          src={banner.imageUrl}
                          alt={`Banner ${index + 1} preview`}
                          className="mt-2 h-24 w-full rounded-xl object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-brand-textSecondary">CTA href</label>
                    <input
                      value={banner.ctaHref}
                      onChange={(event) => updateBanner(index, 'ctaHref', event.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-white px-4 py-2 text-sm text-brand-textPrimary outline-none focus:border-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-textSecondary">Position</label>
                    <input
                      type="number"
                      min={1}
                      value={banner.position || index + 1}
                      onChange={(event) => updateBanner(index, 'position', event.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-white px-4 py-2 text-sm text-brand-textPrimary outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-brand-textSecondary">Background</label>
                    <input
                      type="color"
                      value={banner.bgColor}
                      onChange={(event) => updateBanner(index, 'bgColor', event.target.value)}
                      className="h-10 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm text-brand-textPrimary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-textSecondary">Text color</label>
                    <input
                      type="color"
                      value={banner.textColor}
                      onChange={(event) => updateBanner(index, 'textColor', event.target.value)}
                      className="h-10 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm text-brand-textPrimary outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  heroBanners: [
                    ...prev.heroBanners,
                    {
                      title: 'New hero banner',
                      subtitle: 'Banner subtitle goes here.',
                      imageUrl: '',
                      bgColor: '#D92F2F',
                      textColor: '#FFFFFF',
                      ctaText: 'Learn more',
                      ctaHref: '/courses',
                      position: prev.heroBanners.length + 1,
                    },
                  ],
                }))
              }
              className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold text-brand-textPrimary transition hover:bg-brand-accentLight"
            >
              <Plus className="h-4 w-4" /> Add banner
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-brand-border bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold text-brand-textPrimary">Hero stats</h2>
        <p className="mt-1 text-sm text-brand-textSecondary">Update the values shown beneath the hero section.</p>
        <div className="mt-6 space-y-4">
          {settings.heroStats.map((item, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary">Value</label>
                <input
                  value={item.value}
                  onChange={(event) =>
                    setSettings((prev) => {
                      const next = [...prev.heroStats]
                      next[index] = { ...next[index], value: event.target.value }
                      return { ...prev, heroStats: next }
                    })
                  }
                  className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2 text-sm text-brand-textPrimary outline-none focus:border-brand-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary">Label</label>
                <input
                  value={item.label}
                  onChange={(event) =>
                    setSettings((prev) => {
                      const next = [...prev.heroStats]
                      next[index] = { ...next[index], label: event.target.value }
                      return { ...prev, heroStats: next }
                    })
                  }
                  className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2 text-sm text-brand-textPrimary outline-none focus:border-brand-accent"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-brand-border bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold text-brand-textPrimary">Feature list</h2>
        <p className="mt-1 text-sm text-brand-textSecondary">Update the short feature list beneath the hero section.</p>
        <div className="mt-6 space-y-4">
          {settings.featureLabels.map((label, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={label}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    featureLabels: prev.featureLabels.map((item, i) => (i === index ? event.target.value : item)),
                  }))
                }
                className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2 text-sm text-brand-textPrimary outline-none focus:border-brand-accent"
              />
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    featureLabels: prev.featureLabels.filter((_, i) => i !== index),
                  }))
                }
                className="inline-flex h-10 items-center justify-center rounded-xl border border-brand-border px-4 text-sm text-brand-textSecondary hover:bg-brand-accentLight"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSettings((prev) => ({ ...prev, featureLabels: [...prev.featureLabels, ''] }))}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold text-brand-textPrimary transition hover:bg-brand-accentLight"
          >
            <Plus className="h-4 w-4" /> Add feature
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-brand-border bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold text-brand-textPrimary">Footer</h2>
        <label className="mt-4 block text-sm font-medium text-brand-textSecondary">Footer text</label>
        <textarea
          rows={3}
          value={settings.footerText}
          onChange={(event) => setSettings((prev) => ({ ...prev, footerText: event.target.value }))}
          className="mt-2 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-textPrimary outline-none focus:border-brand-accent"
        />
      </section>
    </div>
  )
}
