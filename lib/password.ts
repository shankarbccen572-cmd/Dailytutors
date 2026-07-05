import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

// Hash a plain password as "salt:hash" using scrypt (no external dependency).
export function hashPassword(plain) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(plain, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

// Constant-time check of a plain password against a stored "salt:hash".
export function verifyPassword(plain, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const hashBuf = Buffer.from(hash, 'hex')
  const testBuf = scryptSync(plain, salt, 64)
  if (testBuf.length !== hashBuf.length) return false
  return timingSafeEqual(testBuf, hashBuf)
}
