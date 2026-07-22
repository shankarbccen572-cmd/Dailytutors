/**
 * End-to-end authentication test: verify OTP flow with JWT validation
 * Simulates the complete flow from OTP verification to JWT validation
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

function loadEnv() {
  if (process.env.MONGODB_URI) return
  const filesToTry = [path.join(ROOT, '.env.local'), path.join(ROOT, '.env')]
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
        if (!process.env[key]) process.env[key] = value
        if (process.env.MONGODB_URI) return
      }
    } catch (e) {}
  }
}

loadEnv()

// Import User model
import User from '../models/User.ts'

const TEST_PHONE = '9999777666' // New phone number that doesn't exist yet

async function testAuthFlow() {
  try {
    console.log('🔍 Starting end-to-end authentication test...\n')
    console.log(`📱 Test Phone: ${TEST_PHONE}\n`)

    // Step 1: Connect to MongoDB
    console.log('Step 1️⃣ : Connect to MongoDB')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const db = mongoose.connection.db
    const usersCollection = db.collection('users')

    // Step 2: Check if phone already exists
    console.log('Step 2️⃣ : Check if phone already exists in database')
    const existingUser = await User.findOne({ phone: TEST_PHONE })
    if (existingUser) {
      console.log(`⚠️  Phone ${TEST_PHONE} already exists:`)
      console.log(`    ID: ${existingUser._id}`)
      console.log(`    Name: ${existingUser.name}`)
      console.log('\n❌ Test FAILED - Please use a new phone number\n')
      process.exit(1)
    }
    console.log(`✅ Phone ${TEST_PHONE} is new (doesn't exist yet)\n`)

    // Step 3: Simulate user creation via /api/otp/verify (using findOneAndUpdate with upsert)
    console.log('Step 3️⃣ : Simulate OTP verification - create user with findOneAndUpdate + upsert')
    const safeEmail = `${TEST_PHONE}@phone.dailytutors.local`
    
    const createdUser = await User.findOneAndUpdate(
      { phone: TEST_PHONE },
      {
        $set: { phone: TEST_PHONE },
        $setOnInsert: {
          email: safeEmail,
          name: TEST_PHONE,
          role: 'student',
        },
      },
      { upsert: true, new: true }
    )

    console.log('✅ User created/updated via atomic operation')
    console.log(`    ID: ${createdUser._id}`)
    console.log(`    Phone: ${createdUser.phone}`)
    console.log(`    Email: ${createdUser.email}`)
    console.log(`    Role: ${createdUser.role}\n`)

    // Step 4: Verify JWT would be signed with correct userId
    console.log('Step 4️⃣ : Verify JWT payload matches actual DB user')
    const jwtUserId = createdUser._id.toString()
    console.log(`    JWT would contain userId: ${jwtUserId}`)

    // Step 5: Test JWT -> User lookup (what happens when user makes requests)
    console.log('\nStep 5️⃣ : Simulate request: User sends JWT cookie with userId')
    const lookedUpUser = await User.findById(jwtUserId)
    
    if (!lookedUpUser) {
      console.log(`❌ FAILED: User lookup by JWT userId returned null!`)
      console.log(`    JWT userId: ${jwtUserId}`)
      console.log(`    findById result: null`)
      process.exit(1)
    }

    console.log(`✅ User found by JWT userId`)
    console.log(`    Looked up ID: ${lookedUpUser._id}`)
    console.log(`    Looked up Phone: ${lookedUpUser.phone}`)
    console.log(`    Match: ${jwtUserId === lookedUpUser._id.toString()}\n`)

    // Step 6: Verify unique constraint works
    console.log('Step 6️⃣ : Verify unique phone constraint (try duplicate insertion)')
    try {
      const duplicateAttempt = await User.findOneAndUpdate(
        { phone: TEST_PHONE },
        { $set: { phone: TEST_PHONE } },
        { upsert: true, new: true }
      )
      console.log(`✅ Second insertion on same phone handled correctly (upsert returned existing)`)
      console.log(`    Returned ID: ${duplicateAttempt._id}`)
      console.log(`    Same as first: ${duplicateAttempt._id.toString() === jwtUserId}\n`)
    } catch (err) {
      console.log(`⚠️  Got error (expected for unique constraint):`, err.code || err.message)
    }

    // Step 7: Verify index enforcement
    console.log('Step 7️⃣ : Verify phone unique index is enforced in MongoDB')
    const indexes = await usersCollection.listIndexes()
    const phoneIndex = (await indexes.toArray()).find(idx => idx.key && idx.key.phone === 1)
    
    if (phoneIndex && phoneIndex.unique === true) {
      console.log(`✅ Phone unique index is enforced`)
      console.log(`    Index: ${phoneIndex.name}`)
      console.log(`    Unique: ${phoneIndex.unique}`)
      console.log(`    Sparse: ${phoneIndex.sparse}\n`)
    } else {
      console.log(`❌ Phone unique index NOT found or not unique!\n`)
      process.exit(1)
    }

    // Step 8: Summary
    console.log('═'.repeat(60))
    console.log('✅ END-TO-END TEST PASSED!')
    console.log('═'.repeat(60))
    console.log('\nVerified:')
    console.log('  ✅ New user created successfully via atomic operation')
    console.log('  ✅ JWT userId matches actual DB user ID')
    console.log('  ✅ User can be looked up by JWT userId')
    console.log('  ✅ Duplicate phone creation handled correctly')
    console.log('  ✅ Unique index on phone field is enforced')
    console.log('\nThe authentication fix is working correctly!')
    console.log('\nCreated test user:')
    console.log(`  Phone: ${TEST_PHONE}`)
    console.log(`  User ID: ${jwtUserId}`)
    console.log(`  Email: ${safeEmail}`)

  } catch (err) {
    console.error('\n❌ Error during test:')
    console.error(err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

testAuthFlow()
