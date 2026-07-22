/**
 * Create the unique index on User.phone field in MongoDB
 * This ensures phone field has unique constraint enforced at database level
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

function loadEnv() {
  if (process.env.MONGODB_URI) return
  
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
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = value
        }
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
  process.exit(1)
}

async function createPhoneIndex() {
  try {
    console.log('🔍 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const db = mongoose.connection.db
    const collection = db.collection('users')

    console.log('🔨 Creating unique index on phone field...\n')
    
    try {
      const result = await collection.createIndex(
        { phone: 1 },
        { unique: true, sparse: true }
      )
      console.log(`✅ Index created successfully: "${result}"`)
    } catch (err) {
      if (err.code === 68) {
        // Code 68: IndexKeySpecConflict - index already exists
        console.log('⚠️  Index already exists (that\'s fine)')
      } else {
        throw err
      }
    }

    console.log('\n🔎 Verifying index was created...\n')
    
    const indexesCursor = collection.listIndexes()
    const indexesArray = await indexesCursor.toArray()
    
    const phoneIndex = indexesArray.find(
      (idx) => idx.key && idx.key.phone === 1
    )

    if (phoneIndex) {
      console.log(`✅ Phone index verified: "${phoneIndex.name}"`)
      console.log(`   Spec:`, JSON.stringify(phoneIndex, null, 2))
      
      if (phoneIndex.unique === true && phoneIndex.sparse === true) {
        console.log(`\n✅ UNIQUE + SPARSE constraint is FULLY ENFORCED`)
        console.log('   The fix is ready for production!')
      } else {
        console.log(`\n⚠️  Constraint incomplete:`)
        console.log(`     unique: ${phoneIndex.unique}`)
        console.log(`     sparse: ${phoneIndex.sparse}`)
      }
    } else {
      console.log(`❌ Phone index NOT found after creation!`)
      process.exit(1)
    }

  } catch (err) {
    console.error('❌ Error during index creation:')
    console.error(err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

createPhoneIndex()
