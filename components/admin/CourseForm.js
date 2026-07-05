'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from './ImageUpload'
import {
  CATEGORY_GROUPS,
  ALL_CATEGORIES,
  TARGETS_BY_CATEGORY,
  LANGUAGES,
} from '@/lib/options'

const inputCls =
  'w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-accent'
const labelCls = 'block text-sm font-medium text-brand-textPrimary'

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

// Keep an existing (possibly custom / legacy) value selectable even if it's
// not in the predefined list, so editing older courses never drops data.
function withCurrent(list, current) {
  return current && !list.includes(current) ? [current, ...list] : list
}

export default function CourseForm({ mode = 'create', initialData = null, courseId = null }) {
  const router = useRouter()

  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    examTarget: initialData?.examTarget || '',
    language: initialData?.language || 'English',
    instructorName: initialData?.instructorName || '',
    instructorBio: initialData?.instructorBio || '',
    originalPrice: initialData?.originalPrice ?? '',
    discountPrice: initialData?.discountPrice ?? '',
    thumbnail: initialData?.thumbnail || '',
    previewVideo: initialData?.previewVideo || '',
    badgeLabel: initialData?.badgeLabel || 'Online',
    badgeColor: initialData?.badgeColor || '#FF3131',
    premiumBadgeLabel: initialData?.premiumBadgeLabel || 'Pro',
    premiumBadgeColor: initialData?.premiumBadgeColor || '#F59E0B',
    premiumFeatureText: initialData?.premiumFeatureText || 'Premium Features Included',
    cardBorderColor: initialData?.cardBorderColor || '#EAEAEA',
    exploreButtonColor: initialData?.exploreButtonColor || '#FF3131',
    buyNowButtonColor: initialData?.buyNowButtonColor || '#FF3131',
    expirationDays: initialData?.expirationDays ?? 365,
    expirationOption: initialData?.expirationDays === null ? 'lifetime' : (initialData?.expirationDays === 180 ? '6-months' : '1-year'),
  })
  const [learn, setLearn] = useState(
    initialData?.whatYouLearn?.length ? initialData.whatYouLearn : ['']
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Changing the category re-scopes the exam-target options; drop a target
  // that no longer belongs to the newly selected category.
  function updateCategory(v) {
    setForm((f) => {
      const valid = TARGETS_BY_CATEGORY[v] || []
      const examTarget = valid.includes(f.examTarget) ? f.examTarget : ''
      return { ...f, category: v, examTarget }
    })
  }

  const targetOptions = TARGETS_BY_CATEGORY[form.category] || []

  async function save(status) {
    setError('')
    setSavedMsg('')
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    setSaving(true)

    const payload = {
      ...form,
      originalPrice: Number(form.originalPrice) || 0,
      discountPrice: Number(form.discountPrice) || 0,
      whatYouLearn: learn.map((s) => s.trim()).filter(Boolean),
      status,
    }

    try {
      const url = mode === 'create' ? '/api/courses' : `/api/courses/${courseId}`
      const method = mode === 'create' ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Save failed')
      }
      const data = await res.json()
      if (mode === 'create') {
        router.push(`/admin/courses/${data._id}/edit`)
      } else {
        setSavedMsg(`Saved as ${status} ✓`)
        router.refresh()
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Basic info */}
      <section className="rounded-xl border border-brand-border bg-brand-primary p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-brand-textPrimary">
          Course details
        </h2>
        <div className="grid gap-5">
          <Field label="Title *">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Complete UPSC Prelims Foundation"
            />
          </Field>
          <Field label="Description">
            <textarea
              className={`${inputCls} min-h-[100px]`}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="What is this course about?"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Category">
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) => updateCategory(e.target.value)}
              >
                <option value="">Select category…</option>
                {/* Preserve a legacy/custom value from an older course. */}
                {form.category && !ALL_CATEGORIES.includes(form.category) && (
                  <optgroup label="Current">
                    <option value={form.category}>{form.category}</option>
                  </optgroup>
                )}
                {CATEGORY_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map((it) => (
                      <option key={it} value={it}>
                        {it}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="Exam target">
              <select
                className={inputCls}
                value={form.examTarget}
                onChange={(e) => update('examTarget', e.target.value)}
                disabled={!form.category}
              >
                <option value="">
                  {form.category ? 'Select target…' : 'Pick a category first'}
                </option>
                {withCurrent(targetOptions, form.examTarget).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Language">
              <select
                className={inputCls}
                value={form.language}
                onChange={(e) => update('language', e.target.value)}
              >
                {withCurrent(LANGUAGES, form.language).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </section>

      {/* Thumbnail */}
      <section className="rounded-xl border border-brand-border bg-brand-primary p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-brand-textPrimary">
          Thumbnail
        </h2>
        <ImageUpload
          value={form.thumbnail}
          onChange={(url) => update('thumbnail', url)}
        />
      </section>

      {/* Badge Design */}
      <section className="rounded-xl border border-brand-border bg-brand-primary p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-brand-textPrimary">
          Badge Customization
        </h2>
        <p className="mb-4 text-sm text-brand-textSecondary">
          Customize the course card badge (e.g., Online, Offline, Batch)
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Badge Label">
            <input
              className={inputCls}
              value={form.badgeLabel}
              onChange={(e) => update('badgeLabel', e.target.value)}
              placeholder="e.g. Online, Offline, Batch"
            />
          </Field>
          <Field label="Badge Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-16 rounded-lg border border-brand-border cursor-pointer"
                value={form.badgeColor}
                onChange={(e) => update('badgeColor', e.target.value)}
              />
              <input
                type="text"
                className={inputCls}
                value={form.badgeColor}
                onChange={(e) => update('badgeColor', e.target.value)}
                placeholder="#FF3131"
              />
            </div>
          </Field>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-brand-accentLight/30 p-3">
          <span className="text-sm text-brand-textSecondary">Preview:</span>
          <span
            className="inline-flex items-center gap-1.5 rounded-r-md py-1 pl-3 pr-3.5 text-[11px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: form.badgeColor }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {form.badgeLabel}
          </span>
        </div>
      </section>

      {/* Premium Badge Customization */}
      <section className="rounded-xl border border-brand-border bg-brand-primary p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-brand-textPrimary">
          Premium Badge Customization
        </h2>
        <p className="mb-4 text-sm text-brand-textSecondary">
          Customize the premium features badge (e.g., Pro, Elite, VIP)
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Premium Badge Label">
            <input
              className={inputCls}
              value={form.premiumBadgeLabel}
              onChange={(e) => update('premiumBadgeLabel', e.target.value)}
              placeholder="e.g. Pro, Elite, VIP"
            />
          </Field>
          <Field label="Premium Badge Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-16 rounded-lg border border-brand-border cursor-pointer"
                value={form.premiumBadgeColor}
                onChange={(e) => update('premiumBadgeColor', e.target.value)}
              />
              <input
                type="text"
                className={inputCls}
                value={form.premiumBadgeColor}
                onChange={(e) => update('premiumBadgeColor', e.target.value)}
                placeholder="#F59E0B"
              />
            </div>
          </Field>
          <Field label="Premium Feature Text">
            <input
              className={inputCls}
              value={form.premiumFeatureText}
              onChange={(e) => update('premiumFeatureText', e.target.value)}
              placeholder="Premium Features Included"
            />
          </Field>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-brand-accentLight/30 p-3">
          <span className="text-sm text-brand-textSecondary">Preview:</span>
          <div className="flex items-center justify-between rounded-lg bg-brand-textPrimary px-3 py-2">
            <span className="flex items-center gap-2 text-xs font-medium text-white">
              Premium Badge
            </span>
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: form.premiumBadgeColor }}
            >
              {form.premiumBadgeLabel}
            </span>
          </div>
        </div>
      </section>

      {/* Card & Button Customization */}
      <section className="rounded-xl border border-brand-border bg-brand-primary p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-brand-textPrimary">
          Card & Button Customization
        </h2>
        <p className="mb-4 text-sm text-brand-textSecondary">
          Customize card border and button colors
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Card Border Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-16 rounded-lg border border-brand-border cursor-pointer"
                value={form.cardBorderColor}
                onChange={(e) => update('cardBorderColor', e.target.value)}
              />
              <input
                type="text"
                className={inputCls}
                value={form.cardBorderColor}
                onChange={(e) => update('cardBorderColor', e.target.value)}
                placeholder="#EAEAEA"
              />
            </div>
          </Field>
          <Field label="Explore Button Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-16 rounded-lg border border-brand-border cursor-pointer"
                value={form.exploreButtonColor}
                onChange={(e) => update('exploreButtonColor', e.target.value)}
              />
              <input
                type="text"
                className={inputCls}
                value={form.exploreButtonColor}
                onChange={(e) => update('exploreButtonColor', e.target.value)}
                placeholder="#FF3131"
              />
            </div>
          </Field>
          <Field label="Buy Now Button Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-16 rounded-lg border border-brand-border cursor-pointer"
                value={form.buyNowButtonColor}
                onChange={(e) => update('buyNowButtonColor', e.target.value)}
              />
              <input
                type="text"
                className={inputCls}
                value={form.buyNowButtonColor}
                onChange={(e) => update('buyNowButtonColor', e.target.value)}
                placeholder="#FF3131"
              />
            </div>
          </Field>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-brand-accentLight/30 p-3">
          <span className="text-sm text-brand-textSecondary">Preview:</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled
              className="rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors"
              style={{
                borderColor: form.exploreButtonColor,
                color: form.exploreButtonColor,
              }}
            >
              Explore
            </button>
            <button
              type="button"
              disabled
              className="rounded-xl px-3 py-1.5 text-sm font-semibold text-white transition-transform"
              style={{ backgroundColor: form.buyNowButtonColor }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="rounded-xl border border-brand-border bg-brand-primary p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-brand-textPrimary">
          Pricing
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Original price (₹)">
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.originalPrice}
              onChange={(e) => update('originalPrice', e.target.value)}
              placeholder="4999"
            />
          </Field>
          <Field label="Discount price (₹)">
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.discountPrice}
              onChange={(e) => update('discountPrice', e.target.value)}
              placeholder="1999"
            />
          </Field>
        </div>
      </section>

      {/* Course Expiration */}
      <section className="rounded-xl border border-brand-border bg-brand-primary p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-brand-textPrimary">
          Course Expiration
        </h2>
        <p className="mb-4 text-sm text-brand-textSecondary">
          Set how many days students can access the course after enrollment/purchase
        </p>
        <Field label="Course Access Duration">
          <select
            className={inputCls}
            value={form.expirationOption}
            onChange={(e) => {
              const val = e.target.value
              const days = val === '6-months' ? 180 : val === '1-year' ? 365 : null
              update('expirationOption', val)
              update('expirationDays', days)
            }}
          >
            <option value="6-months">6 Months</option>
            <option value="1-year">1 Year</option>
            <option value="lifetime">Lifetime</option>
          </select>
          <p className="mt-1 text-xs text-brand-textSecondary">
            {form.expirationOption === '6-months' ? '180 days - Students lose access after 6 months' : form.expirationOption === '1-year' ? '365 days - Students lose access after 1 year' : 'No expiration - Students have permanent access'}
          </p>
        </Field>
      </section>

      {/* Instructor */}
      <section className="rounded-xl border border-brand-border bg-brand-primary p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-brand-textPrimary">
          Instructor
        </h2>
        <div className="grid gap-5">
          <Field label="Instructor name">
            <input
              className={inputCls}
              value={form.instructorName}
              onChange={(e) => update('instructorName', e.target.value)}
              placeholder="Full name"
            />
          </Field>
          <Field label="Instructor bio">
            <textarea
              className={`${inputCls} min-h-[80px]`}
              value={form.instructorBio}
              onChange={(e) => update('instructorBio', e.target.value)}
              placeholder="Short bio / credentials"
            />
          </Field>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="rounded-xl border border-brand-border bg-brand-primary p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-brand-textPrimary">
          What you&apos;ll learn
        </h2>
        <div className="space-y-3">
          {learn.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={inputCls}
                value={item}
                onChange={(e) =>
                  setLearn((arr) => arr.map((x, idx) => (idx === i ? e.target.value : x)))
                }
                placeholder={`Learning outcome ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => setLearn((arr) => arr.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded-md border border-brand-border px-3 py-2 text-sm text-brand-accent hover:bg-brand-accentLight"
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLearn((arr) => [...arr, ''])}
            className="rounded-md border border-dashed border-brand-border px-4 py-2 text-sm font-medium text-brand-textSecondary hover:border-brand-accent hover:text-brand-accent"
          >
            + Add bullet
          </button>
        </div>
      </section>

      {/* Actions */}
      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-brand-border bg-brand-primary/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          {error && <span className="text-brand-accent">{error}</span>}
          {savedMsg && <span className="text-brand-success">{savedMsg}</span>}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={saving}
            onClick={() => save('draft')}
            className="rounded-lg border border-brand-border px-6 py-2.5 font-medium text-brand-textPrimary transition-colors hover:bg-brand-accentLight disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save('published')}
            className="rounded-lg bg-brand-accent px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-accentDark disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}
