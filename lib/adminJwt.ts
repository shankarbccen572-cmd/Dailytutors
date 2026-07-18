function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('Missing ADMIN_JWT_SECRET or NEXTAUTH_SECRET environment variable')
  }
  return secret
}

export const ADMIN_TOKEN_NAME = 'admin_token'
export const ADMIN_TOKEN_MAX_AGE = 20 * 60 // 20 minutes

function utf8ToBytes(value: string) {
  return new TextEncoder().encode(value)
}

function bytesToUtf8(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes)
}

function base64UrlEncode(data: string | Uint8Array) {
  const bytes = typeof data === 'string' ? utf8ToBytes(data) : data
  let base64 = ''
  if (typeof btoa !== 'undefined') {
    let binary = ''
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i])
    }
    base64 = btoa(binary)
  } else {
    base64 = Buffer.from(bytes).toString('base64')
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(value: string) {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), '=')
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/')
  if (typeof atob !== 'undefined') {
    return atob(base64)
  }
  return Buffer.from(base64, 'base64').toString('utf8')
}

function getSubtle() {
  const globalCrypto =
    typeof crypto !== 'undefined'
      ? crypto
      : typeof globalThis !== 'undefined'
      ? (globalThis as any).crypto || (globalThis as any).webcrypto
      : undefined

  if (globalCrypto?.subtle) {
    return globalCrypto.subtle
  }

  throw new Error('Web Crypto API is required for JWT signing')
}

async function sign(payload: string) {
  const subtle = getSubtle()
  const secret = getSecret()
  const key = await subtle.importKey(
    'raw',
    utf8ToBytes(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await subtle.sign('HMAC', key, utf8ToBytes(payload))
  return base64UrlEncode(new Uint8Array(signature))
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export async function createAdminToken(payload: Record<string, unknown>, expiresInSeconds = ADMIN_TOKEN_MAX_AGE) {
  const issuedAt = Math.floor(Date.now() / 1000)
  const fullPayload = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + expiresInSeconds,
  }

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64UrlEncode(JSON.stringify(fullPayload))
  const signature = await sign(`${header}.${body}`)
  return `${header}.${body}.${signature}`
}

export async function verifyAdminToken(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return { valid: false, reason: 'invalid_format' }

    const [header, body, signature] = parts
    const expectedSignature = await sign(`${header}.${body}`)
    if (!timingSafeEqual(signature, expectedSignature)) {
      return { valid: false, reason: 'invalid_signature' }
    }

    const payload = JSON.parse(base64UrlDecode(body))
    if (typeof payload !== 'object' || payload === null) return { valid: false, reason: 'invalid_payload' }

    if (typeof payload.exp !== 'number' || Math.floor(Date.now() / 1000) >= payload.exp) {
      return { valid: false, reason: 'expired' }
    }

    return { valid: true as const, payload }
  } catch (error) {
    return { valid: false, reason: 'exception' }
  }
}
