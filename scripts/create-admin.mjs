// Create (or update) a staff account with a login ID + password.
//
// Usage:
//   node scripts/create-admin.mjs <loginId> <password> [email] [name] [role]
// Examples:
//   node scripts/create-admin.mjs admin "Secret123!"
//   node scripts/create-admin.mjs jdoe "Pass123!" jdoe@school.com "J Doe" faculty
//
// role defaults to "admin". Re-running with the same loginId resets the password.
//
// Self-contained: defines the User schema and password hashing inline so it
// doesn't depend on the project's TypeScript files (which Node can't import
// directly).

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scryptSync, randomBytes } from 'node:crypto'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// Mirrors lib/password.ts — "salt:hash" using scrypt.
function hashPassword(plain) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(plain, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

// Minimal .env.local loader (so we don't need dotenv).
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

// Schema mirrors models/User.ts (only the fields this script writes).
const UserSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true, index: true },
    username: { type: String, unique: true, sparse: true, index: true },
    password: { type: String, select: false },
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    image: { type: String },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      default: 'student',
    },
  },
  { timestamps: true }
)
const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function main() {
  loadEnv()

  const [, , loginId, password, email, name, role] = process.argv
  if (!loginId || !password) {
    console.error(
      'Usage: node scripts/create-admin.mjs <loginId> <password> [email] [name] [role]'
    )
    process.exit(1)
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('Missing MONGODB_URI (set it in .env.local)')
    process.exit(1)
  }

  const username = loginId.trim().toLowerCase()
  const mail = (email || `${username}@admin.local`).trim().toLowerCase()
  const finalRole = role === 'faculty' ? 'faculty' : 'admin'

  await mongoose.connect(uri)

  const user = await User.findOneAndUpdate(
    { username },
    {
      $set: {
        username,
        email: mail,
        name: name || (finalRole === 'admin' ? 'Administrator' : 'Faculty'),
        role: finalRole,
        password: hashPassword(password),
        // Synthetic googleId so the sparse-unique index never sees a null.
        googleId: `cred:${username}`,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  console.log('\n✅ Staff account ready:')
  console.log('   Login ID :', user.username)
  console.log('   Email    :', user.email)
  console.log('   Role     :', user.role)
  console.log('\nSign in at /admin/login with this Login ID and the password you set.')

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
