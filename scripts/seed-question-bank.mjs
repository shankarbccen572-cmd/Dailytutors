// Seed the Question Bank subjects for each category, per the spec's subject
// sets. Idempotent and non-destructive: only creates a subject if one with the
// same name doesn't already exist under that category. Run AFTER
// migrate-categories.mjs (it needs the categories to exist).
//
// Usage:
//   node scripts/seed-question-bank.mjs --dry-run   # preview
//   node scripts/seed-question-bank.mjs             # apply

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')

const SCHOOL_SUBJECTS = ['Kannada', 'English', 'Hindi', 'Mathematics', 'Science', 'Social Science']
const NEET_SUBJECTS = ['Physics', 'Chemistry', 'Biology']
const KCET_SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology']

// category name -> subject list
const SUBJECTS_BY_CATEGORY = {
  '8th Standard': SCHOOL_SUBJECTS,
  '9th Standard': SCHOOL_SUBJECTS,
  '10th Standard': SCHOOL_SUBJECTS,
  '11th Standard': SCHOOL_SUBJECTS,
  '12th Standard': SCHOOL_SUBJECTS,
  NEET: NEET_SUBJECTS,
  KCET: KCET_SUBJECTS,
}

function loadEnv() {
  if (process.env.MONGODB_URI) return
  try {
    const raw = readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    // rely on real env vars
  }
}

const CategorySchema = new mongoose.Schema({ name: String, slug: String }, { strict: false })
const BankSubjectSchema = new mongoose.Schema({}, { strict: false, timestamps: true })
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema)
const BankSubject = mongoose.models.BankSubject || mongoose.model('BankSubject', BankSubjectSchema)

async function main() {
  loadEnv()
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('Missing MONGODB_URI (set it in .env.local)')
    process.exit(1)
  }

  console.log(DRY_RUN ? '\n🔍 DRY RUN — no writes.\n' : '\n✍️  Seeding question-bank subjects.\n')
  await mongoose.connect(uri)

  const categories = await Category.find({}).lean()
  const byName = Object.fromEntries(categories.map((c) => [c.name, c]))

  let created = 0
  let order = await BankSubject.countDocuments()
  for (const [catName, subjectNames] of Object.entries(SUBJECTS_BY_CATEGORY)) {
    const cat = byName[catName]
    if (!cat) {
      console.log(`  ! category "${catName}" not found — run migrate:categories first, skipping`)
      continue
    }
    for (const name of subjectNames) {
      const exists = await BankSubject.findOne({ categoryId: cat._id, name })
      if (exists) {
        console.log(`  = ${catName} / ${name} exists`)
        continue
      }
      console.log(`  + ${catName} / ${name}${DRY_RUN ? ' (would create)' : ''}`)
      if (!DRY_RUN) {
        await BankSubject.create({ name, categoryId: cat._id, exams: [catName], order: order++ })
      }
      created++
    }
  }

  console.log(`\nSummary: ${created} subject(s) ${DRY_RUN ? 'to create' : 'created'}.`)
  if (DRY_RUN) console.log('Re-run without --dry-run to apply.')
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
