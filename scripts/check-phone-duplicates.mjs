/**
 * Diagnostic script: Check for duplicate phone numbers in MongoDB users collection
 * and verify unique index creation
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// Minimal .env.local loader (parse .env files better)
function loadEnv() {
  if (process.env.MONGODB_URI) return
  
  // Try .env.local first, then .env
  const filesToTry = [
    path.join(ROOT, '.env.local'),
    path.join(ROOT, '.env')
  ]
  
  for (const filePath of filesToTry) {
    try {
      const raw = readFileSync(filePath, 'utf8')
      for (const line of raw.split('\n')) {
        if (!line.trim() || line.trim().startsWith('#')) continue
        const eqIdx = line.indexOf('=')
        if (eqIdx === -1) continue
        const key = line.substring(0, eqIdx).trim()
        let value = line.substring(eqIdx + 1).trim()
        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = value
        }
        // Stop early once we have MONGODB_URI
        if (process.env.MONGODB_URI) return
      }
    } catch (e) {
      // file doesn't exist or can't be read, try next
    }
  }
}

loadEnv()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment')
  console.error('Checked files:')
  console.error('  .env.local path:', path.join(ROOT, '.env.local'))
  try {
    const exists = readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    console.error('  .env.local exists: yes')
    console.error('  First 100 chars:', exists.substring(0, 100))
  } catch {
    console.error('  .env.local exists: no')
  }
  process.exit(1)
}

async function checkPhoneDuplicates() {
  try {
    console.log('🔍 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const db = mongoose.connection.db
    const collection = db.collection('users')

    // Check 1: Find all non-null phone values and group by phone to find duplicates
    console.log('📋 Checking for duplicate phone numbers...\n')
    
    const duplicates = await collection.aggregate([
      {
        $match: {
          phone: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$phone',
          count: { $sum: 1 },
          userIds: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]).toArray()

    if (duplicates.length === 0) {
      console.log('✅ No duplicate phone numbers found in users collection\n')
    } else {
      console.log(`⚠️  Found ${duplicates.length} phone numbers with duplicates:\n`)
      duplicates.forEach((dup, idx) => {
        console.log(`${idx + 1}. Phone: ${dup._id}`)
        console.log(`   Count: ${dup.count}`)
        console.log(`   User IDs: ${dup.userIds.map(id => id.toString()).join(', ')}`)
        console.log()
      })
    }

    // Check 2: Get information about indexes on the collection
    console.log('🔎 Checking indexes on users collection...\n')
    
    const indexesCursor = collection.listIndexes()
    const indexesArray = await indexesCursor.toArray()
    console.log('Existing indexes:')
    indexesArray.forEach((idx) => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx))
    })
    console.log()

    // Check 3: Look specifically for the phone unique index
    const phoneIndex = indexesArray.find(
      (idx) => idx.key && idx.key.phone === 1
    )

    if (phoneIndex) {
      console.log(`✅ Phone index found: "${phoneIndex.name}"`)
      console.log(`   Spec:`, JSON.stringify(phoneIndex, null, 2))
      
      if (phoneIndex.unique === true) {
        console.log(`   ✅ UNIQUE constraint is ENFORCED\n`)
      } else {
        console.log(`   ⚠️  UNIQUE constraint is NOT enforced (unique: ${phoneIndex.unique})\n`)
      }
    } else {
      console.log(`❌ No index found on phone field\n`)
    }

    // Check 4: Show total user count
    const totalCount = await collection.countDocuments()
    const nullPhoneCount = await collection.countDocuments({ phone: null })
    const withPhoneCount = totalCount - nullPhoneCount

    console.log('📊 Summary:')
    console.log(`   Total users: ${totalCount}`)
    console.log(`   Users with phone: ${withPhoneCount}`)
    console.log(`   Users with null phone: ${nullPhoneCount}`)

  } catch (err) {
    console.error('❌ Error during diagnostic check:')
    console.error(err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

checkPhoneDuplicates()
