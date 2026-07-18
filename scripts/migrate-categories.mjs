// Seed the canonical Category collection and (non-destructively) back-fill
// every Course's categoryId from its legacy free-text `category` value.
//
// Usage:
//   node scripts/migrate-categories.mjs --dry-run   # preview, writes nothing
//   node scripts/migrate-categories.mjs             # apply
//
// Idempotent: safe to re-run. It only sets categoryId where missing/changed and
// never deletes data. Mirrors lib/categories.ts (kept in sync by hand because
// Node cannot import the project's TypeScript directly).

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')

// --- Canonical taxonomy (mirror of lib/categories.ts) ---------------------
const CATEGORIES = [
  { name: '8th Standard', slug: '8th-standard', kind: 'school', order: 1 },
  { name: '9th Standard', slug: '9th-standard', kind: 'school', order: 2 },
  { name: '10th Standard', slug: '10th-standard', kind: 'school', order: 3 },
  { name: '11th Standard', slug: '11th-standard', kind: 'school', order: 4 },
  { name: '12th Standard', slug: '12th-standard', kind: 'school', order: 5 },
  { name: 'NEET', slug: 'neet', kind: 'exam', order: 6 },
  { name: 'KCET', slug: 'kcet', kind: 'exam', order: 7 },
]

const LEGACY_CATEGORY_MAP = {
  'Class 8': '8th Standard',
  'Class 9': '9th Standard',
  'Class 10': '10th Standard',
  'Class 11': '11th Standard',
  'Class 12': '12th Standard',
  '8th Standard': '8th Standard',
  '9th Standard': '9th Standard',
  '10th Standard': '10th Standard',
  '11th Standard': '11th Standard',
  '12th Standard': '12th Standard',
  NEET: 'NEET',
  CET: 'KCET',
  KCET: 'KCET',
}

function loadEnv() {
  if (process.env.MONGODB_URI) return
  try {
    const raw = readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
      }
    }
  } catch {
    // no .env.local — rely on real env vars
  }
}

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    kind: { type: String, enum: ['school', 'exam'], default: 'school' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)
// Loose Course schema — we only read `category` and write `categoryId`/`category`.
const CourseSchema = new mongoose.Schema({}, { strict: false, timestamps: true })

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema)
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)

async function main() {
  loadEnv()
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('Missing MONGODB_URI (set it in .env.local)')
    process.exit(1)
  }

  console.log(DRY_RUN ? '\n🔍 DRY RUN — no writes will be made.\n' : '\n✍️  Applying migration.\n')
  await mongoose.connect(uri)

  // 1) Seed / upsert categories.
  const byName = {}
  for (const c of CATEGORIES) {
    let doc = await Category.findOne({ slug: c.slug })
    if (!doc) {
      console.log(`  + category "${c.name}"${DRY_RUN ? ' (would create)' : ''}`)
      if (!DRY_RUN) doc = await Category.create(c)
      else doc = { _id: `dry:${c.slug}`, ...c }
    } else {
      console.log(`  = category "${c.name}" exists`)
    }
    byName[c.name] = doc
  }

  // 2) Back-fill courses.
  const courses = await Course.find({}).lean()
  let updated = 0
  let unmapped = 0
  for (const course of courses) {
    if (course.categoryId) continue // already linked; leave it.
    const legacy = (course.category || '').toString().trim()
    const canonical = LEGACY_CATEGORY_MAP[legacy]
    if (!canonical) {
      unmapped++
      console.log(`  ! course "${course.title}" has unmapped category "${legacy || '(empty)'}" — assign manually in admin`)
      continue
    }
    const cat = byName[canonical]
    console.log(`  → course "${course.title}": "${legacy}" → "${canonical}"${DRY_RUN ? ' (would set)' : ''}`)
    if (!DRY_RUN) {
      await Course.updateOne(
        { _id: course._id },
        { $set: { categoryId: cat._id, category: canonical } }
      )
    }
    updated++
  }

  console.log(`\nSummary: ${CATEGORIES.length} categories, ${updated} course(s) ${DRY_RUN ? 'to update' : 'updated'}, ${unmapped} needing manual assignment.`)
  if (DRY_RUN) console.log('Re-run without --dry-run to apply.')

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
