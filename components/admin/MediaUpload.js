'use client'

import { useRef, useState } from 'react'

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

// 6 MB chunks — Cloudinary requires chunks to be a multiple of 5 MB (except
// the final one). Chunking is more reliable for large videos and lets us
// report real progress.
const CHUNK = 6 * 1024 * 1024
// Cloudinary's free tier rejects videos larger than this.
const MAX_BYTES = 100 * 1024 * 1024

function mb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1)
}

// Generic upload-or-paste control for any media (video, pdf, file). Uploads to
// Cloudinary's `auto` endpoint in chunks with progress; otherwise the admin
// pastes a URL. Calls onChange(secureUrl) once a URL is available.
export default function MediaUpload({
  value,
  onChange,
  onUploadingChange,
  accept = '*/*',
  label = 'Upload file',
  compact = false,
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [err, setErr] = useState('')
  const inputRef = useRef(null)
  const configured = Boolean(CLOUD && PRESET)

  function setBusy(b) {
    setUploading(b)
    onUploadingChange?.(b)
  }

  // Upload a single chunk via XHR so we get upload-progress events.
  function uploadChunk(file, start, end, uniqueId, onChunkProgress) {
    return new Promise((resolve, reject) => {
      const fd = new FormData()
      fd.append('file', file.slice(start, end))
      fd.append('upload_preset', PRESET)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`)
      xhr.setRequestHeader('X-Unique-Upload-Id', uniqueId)
      xhr.setRequestHeader('Content-Range', `bytes ${start}-${end - 1}/${file.size}`)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onChunkProgress(e.loaded)
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText))
          } catch {
            reject(new Error('Bad response from Cloudinary'))
          }
        } else {
          let msg = `Upload failed (${xhr.status})`
          try {
            msg = JSON.parse(xhr.responseText).error?.message || msg
          } catch {}
          reject(new Error(msg))
        }
      }
      xhr.onerror = () => reject(new Error('Network error during upload'))
      xhr.send(fd)
    })
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!configured) {
      setErr('Cloudinary not configured — paste a URL below instead.')
      return
    }
    if (file.size > MAX_BYTES) {
      setErr(
        `This file is ${mb(file.size)} MB. Cloudinary's free tier caps uploads at 100 MB — ` +
          'please upload it to YouTube/Vimeo and paste the link instead.'
      )
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setErr('')
    setProgress(0)
    setBusy(true)
    const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    try {
      let start = 0
      let result = null
      while (start < file.size) {
        const end = Math.min(start + CHUNK, file.size)
        const base = start
        result = await uploadChunk(file, start, end, uniqueId, (loaded) => {
          setProgress(Math.round(((base + loaded) / file.size) * 100))
        })
        start = end
      }
      if (result?.secure_url) {
        onChange(result.secure_url)
        setProgress(100)
      } else {
        throw new Error(result?.error?.message || 'Upload failed')
      }
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFile}
          disabled={uploading}
          className="block text-sm text-brand-textSecondary file:mr-3 file:rounded-md file:border-0 file:bg-brand-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-accentDark disabled:opacity-50"
        />
        {value && !uploading && (
          <span className="text-xs font-medium text-brand-success">✓ set</span>
        )}
      </div>

      {uploading && (
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-brand-accentLight">
            <div
              className="h-full rounded-full bg-brand-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-brand-textSecondary">
            Uploading… {progress}%
          </p>
        </div>
      )}

      <input
        type="url"
        placeholder={`…or paste a ${label.toLowerCase()} URL`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-accent"
      />
      {!configured && !compact && (
        <p className="text-xs text-brand-warning">
          Cloudinary not configured — paste a URL for now.
        </p>
      )}
      {err && <p className="text-xs text-brand-accent">{err}</p>}
    </div>
  )
}
