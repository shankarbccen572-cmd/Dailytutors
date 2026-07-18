import { isDirectVideo } from '@/lib/utils'

export function isCloudinaryUrl(url = '') {
  return /https?:\/\/res\.cloudinary\.com\//.test(url)
}

// Hook for time-limited signed delivery URLs.
//
// HONEST NOTE: the current Cloudinary setup uploads PUBLIC assets (unsigned
// preset), whose delivery URLs cannot be access-restricted or expired at the
// CDN. Genuine expiring/signed delivery requires uploading assets as
// `authenticated`/`private` and enabling Cloudinary token-based auth (needs
// CLOUDINARY_API_SECRET). Until that infra is in place, the REAL protection is
// the enrollment gate on /api/lessons/[id]/video — the URL is only ever handed
// to an authenticated, purchased (or free-preview) user and is never embedded
// in server-rendered HTML. This function is where token signing plugs in once
// assets are private.
export function signVideoUrl(url) {
  if (!url) return ''
  // TODO: when CLOUDINARY_API_SECRET is set and assets are `authenticated`,
  // generate a token-signed, expiring URL here.
  return url
}

// Resolve the deliverable video source for a lesson (applies signing hook).
export function resolveVideoSource(lesson) {
  const url = signVideoUrl(lesson?.videoUrl || '')
  return { url, native: isDirectVideo(url) }
}
