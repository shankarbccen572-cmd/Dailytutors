import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const publicDir = path.join(rootDir, 'public')

fs.mkdirSync(publicDir, { recursive: true })

function writePng(fileName, svg) {
  const resvg = new Resvg(svg, { background: 'rgba(0,0,0,0)' })
  const pngBuffer = Buffer.from(resvg.render().asPng())
  fs.writeFileSync(path.join(publicDir, fileName), pngBuffer)
  console.log(`Wrote ${fileName}`)
}

const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#FF3131"/>
  <circle cx="256" cy="256" r="178" fill="#FFFFFF"/>
  <path d="M182 188h148c48 0 86 38 86 86v12c0 48-38 86-86 86H182z" fill="#FF3131"/>
  <path d="M212 218h92c24 0 44 20 44 44v5c0 24-20 44-44 44h-92z" fill="#FFFFFF"/>
  <text x="256" y="430" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="72" font-weight="700" fill="#FFFFFF">DT</text>
</svg>`

const fullSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="360" viewBox="0 0 2200 360">
  <rect width="2200" height="360" fill="transparent"/>
  <circle cx="150" cy="180" r="118" fill="#FF3131"/>
  <rect x="86" y="120" width="128" height="120" rx="28" fill="#FFFFFF"/>
  <path d="M122 90h56c54 0 98 44 98 98v6c0 54-44 98-98 98h-56z" fill="#FF3131"/>
  <path d="M146 126h52c32 0 57 25 57 57v4c0 32-25 57-57 57h-52z" fill="#FFFFFF"/>
  <text x="350" y="212" font-family="Segoe UI, Arial, sans-serif" font-size="132" font-weight="700" fill="#1A1A1A">Daily Tutors</text>
</svg>`

writePng('logo-icon.png', iconSvg)
writePng('logo-full.png', fullSvg)
