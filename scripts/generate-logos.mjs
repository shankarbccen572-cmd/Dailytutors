// Generates the Daily Tutors logo PNGs into /public.
//   - logo-icon.png  : 512x512, icon only (favicon)
//   - logo-full.png  : wide, icon + "Daily Tutors" wordmark (navbar)
//
// Run with: npm run generate:logos

import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const publicDir = path.join(root, 'public')
const fontsDir = path.join(__dirname, 'fonts')

const ACCENT = '#FF3131'
const TEXT_PRIMARY = '#1A1A1A'

const POPPINS_BOLD_URL =
  'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf'
const fontPath = path.join(fontsDir, 'Poppins-Bold.ttf')

// The icon: an open book (white) inside an accent-red circle, transparent bg.
function iconInner() {
  return `
    <circle cx="256" cy="256" r="248" fill="${ACCENT}"/>
    <g fill="#FFFFFF">
      <path d="M256 188 C212 164 166 164 132 182 L132 330 C166 312 212 312 256 336 Z"/>
      <path d="M256 188 C300 164 346 164 380 182 L380 330 C346 312 300 312 256 336 Z"/>
    </g>
    <rect x="252" y="190" width="8" height="150" rx="4" fill="${ACCENT}"/>
  `
}

function iconSvg(size = 512) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">${iconInner()}</svg>`
}

function fullSvg() {
  const H = 360
  const iconSize = 280
  const iconX = 30
  const iconY = (H - iconSize) / 2
  const textX = iconX + iconSize + 50
  const fontSize = 150
  const baselineY = H / 2 + fontSize * 0.34
  const scale = iconSize / 512
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="${H}" viewBox="0 0 2200 ${H}">
    <g transform="translate(${iconX},${iconY}) scale(${scale})">${iconInner()}</g>
    <text x="${textX}" y="${baselineY}" font-family="Poppins" font-weight="700" font-size="${fontSize}" fill="${TEXT_PRIMARY}">Daily Tutors</text>
  </svg>`
}

async function ensureFont() {
  await mkdir(fontsDir, { recursive: true })
  if (existsSync(fontPath)) return
  console.log('Downloading Poppins-Bold.ttf …')
  const res = await fetch(POPPINS_BOLD_URL)
  if (!res.ok) throw new Error(`Font download failed: ${res.status}`)
  await writeFile(fontPath, Buffer.from(await res.arrayBuffer()))
}

function renderPng(svg, fontBuffer) {
  const resvg = new Resvg(svg, {
    background: 'rgba(0,0,0,0)',
    font: fontBuffer
      ? {
          fontBuffers: [fontBuffer],
          defaultFontFamily: 'Poppins',
          loadSystemFonts: false,
        }
      : undefined,
  })
  return Buffer.from(resvg.render().asPng())
}

async function main() {
  await mkdir(publicDir, { recursive: true })
  await ensureFont()
  const fontBuffer = await readFile(fontPath)

  // Icon (no text needed)
  await writeFile(path.join(publicDir, 'logo-icon.png'), renderPng(iconSvg(512)))
  console.log('✓ public/logo-icon.png (512x512)')

  // Full logo: render with Poppins, then trim transparent margins + add padding
  const fullRaw = renderPng(fullSvg(), fontBuffer)
  const fullTrimmed = await sharp(fullRaw)
    .trim()
    .extend({
      top: 16,
      bottom: 16,
      left: 16,
      right: 16,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()
  await writeFile(path.join(publicDir, 'logo-full.png'), fullTrimmed)
  const meta = await sharp(fullTrimmed).metadata()
  console.log(`✓ public/logo-full.png (${meta.width}x${meta.height})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
