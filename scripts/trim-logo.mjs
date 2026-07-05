// Trim the empty whitespace around the logo PNGs so they fill their canvas
// and render at a proper size in the header. Keeps a .orig backup once.
import sharp from 'sharp'
import { copyFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

async function trim(name) {
  const src = path.join(ROOT, 'public', name)
  const backup = src.replace(/\.png$/, '.orig.png')
  if (!existsSync(backup)) copyFileSync(src, backup)

  const before = await sharp(backup).metadata()
  // Trim near-white borders (threshold tolerates slight anti-aliasing).
  const buf = await sharp(backup).trim({ threshold: 15 }).toBuffer()
  const after = await sharp(buf).metadata()
  await sharp(buf).toFile(src)
  console.log(
    `${name}: ${before.width}x${before.height} -> ${after.width}x${after.height}`
  )
}

await trim('logo-full.png')
await trim('logo-icon.png')
