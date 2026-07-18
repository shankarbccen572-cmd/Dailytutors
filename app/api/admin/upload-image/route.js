import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Uploads must go to Cloudinary, not the local filesystem: Vercel's runtime
// filesystem is read-only/ephemeral, so fs.writeFile into public/uploads always
// fails in production. We do a server-side *signed* upload using the Cloudinary
// API key/secret (no unsigned preset needed) and return the secure URL.
export const runtime = 'nodejs'

// Vercel serverless request bodies are capped (~4.5 MB). Reject larger images
// with a clear message instead of a generic failure.
const MAX_BYTES = 4 * 1024 * 1024

export async function POST(req) {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error:
          'Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
      },
      { status: 500 }
    )
  }

  let formData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid upload request' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || typeof file === 'string' || !('arrayBuffer' in file)) {
    return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
  }
  if (!file.type?.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
  }
  if (typeof file.size === 'number' && file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'Image is larger than 4 MB. Please upload a smaller image or paste an image URL.' },
      { status: 400 }
    )
  }

  // Allow callers to group uploads (e.g. hero-banners, course-thumbnails).
  const rawFolder = formData.get('folder')
  const folder =
    typeof rawFolder === 'string' && /^[\w-]+$/.test(rawFolder) ? rawFolder : 'hero-banners'

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

    const timestamp = Math.floor(Date.now() / 1000)
    // Cloudinary signature: SHA1 of the alphabetically-sorted params being sent
    // (excluding file, api_key, resource_type) concatenated with the API secret.
    const toSign = `folder=${folder}&timestamp=${timestamp}`
    const signature = crypto
      .createHash('sha1')
      .update(toSign + apiSecret)
      .digest('hex')

    const uploadForm = new FormData()
    uploadForm.append('file', dataUri)
    uploadForm.append('api_key', apiKey)
    uploadForm.append('timestamp', String(timestamp))
    uploadForm.append('folder', folder)
    uploadForm.append('signature', signature)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadForm,
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data.secure_url) {
      console.error('Cloudinary upload failed:', data?.error || res.status)
      return NextResponse.json(
        { error: data?.error?.message || 'Upload failed' },
        { status: 502 }
      )
    }

    return NextResponse.json({ url: data.secure_url })
  } catch (error) {
    console.error('upload-image failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
