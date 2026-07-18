'use client'

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import { uploadImageToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinaryUpload'

export default function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')
  const configured = isCloudinaryConfigured()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!configured) {
      setErr('Cloudinary is not configured yet — paste an image URL below instead.')
      return
    }
    setErr('')
    setUploading(true)
    try {
      const url = await uploadImageToCloudinary(file, 'course-thumbnails')
      onChange(url)
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-brand-border bg-brand-accentLight/40">
          {value ? (
            <img src={value} alt="Thumbnail" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-brand-textSecondary">No image</span>
          )}
        </div>
        <div className="space-y-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="block text-sm text-brand-textSecondary file:mr-3 file:rounded-md file:border-0 file:bg-brand-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-accentDark"
          />
          {uploading && <p className="text-xs text-brand-textSecondary">Uploading…</p>}
          {!configured && (
            <p className="text-xs text-brand-warning">
              Cloudinary not configured — paste a URL below for now.
            </p>
          )}
        </div>
      </div>
      <input
        type="url"
        placeholder="…or paste an image URL"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-accent"
      />
      {err && <p className="text-sm text-brand-accent">{err}</p>}
    </div>
  )
}
