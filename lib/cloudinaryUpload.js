// Client-side unsigned image upload to Cloudinary.
//
// Uploads go straight from the browser to Cloudinary using an unsigned upload
// preset — this works on Vercel (whose runtime filesystem is read-only) and
// isn't subject to serverless request-body size limits.

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

export function isCloudinaryConfigured() {
  return Boolean(CLOUD && PRESET)
}

// Uploads an image File and resolves to its secure HTTPS URL. `folder` groups
// uploads in the Cloudinary media library (e.g. 'hero-banners').
export async function uploadImageToCloudinary(file, folder) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.')
  }
  if (!file || !file.type?.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }

  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', PRESET)
  if (folder) fd.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body: fd,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.secure_url) {
    throw new Error(data?.error?.message || 'Upload failed')
  }
  return data.secure_url
}
