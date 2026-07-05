import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(req) {
  const formData = await req.formData()
  const file = formData.get('file')

  if (!file || typeof file === 'string' || !('arrayBuffer' in file)) {
    return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
  }

  if (!file.type?.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = path.extname(file.name) || '.png'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'hero-banners')
  const uploadPath = path.join(uploadDir, fileName)

  try {
    await fs.mkdir(uploadDir, { recursive: true })
    await fs.writeFile(uploadPath, buffer)
    return NextResponse.json({ url: `/uploads/hero-banners/${fileName}` })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
