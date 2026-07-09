// MSG91 OTP Widget — server-side helpers.
//
// The OTP is sent AND verified entirely in the browser by the MSG91 OTP Widget,
// which hands the client a signed "access-token" on success. The only call we
// make from the server is verifyAccessToken, which confirms that token is
// authentic and returns the verified mobile number.
//
// This is NOT the REST OTP API: there is no template_id, no dev-mode fallback,
// and the authkey is used ONLY to authenticate the verifyAccessToken call — it
// never sends or verifies raw OTP codes and never reaches the browser.
//
// Docs: https://docs.msg91.com/otp/verify-access-token

const AUTH_KEY = process.env.MSG91_AUTH_KEY
const BASE = 'https://control.msg91.com/api/v5'
const DEBUG = process.env.MSG91_DEBUG === 'true'

// Convert any user input to MSG91's expected format: country code + number,
// digits only, e.g. "919071366466".
export function toMsg91Mobile(phone: string): string {
  let d = String(phone || '').replace(/\D/g, '')
  if (d.length === 10) d = `91${d}`
  else if (d.length === 11 && d.startsWith('0')) d = `91${d.slice(1)}`
  return d
}

// Reduce any accepted form to the bare 10-digit Indian local number, which is
// what we persist on the user record.
export function toLocalIndianPhone(phone: string): string {
  const d = toMsg91Mobile(phone)
  return d.startsWith('91') && d.length === 12 ? d.slice(2) : d.replace(/^0/, '')
}

export function isValidIndianMobile(phone: string): boolean {
  return /^91[6-9]\d{9}$/.test(toMsg91Mobile(phone))
}

export function isMsg91Configured(): boolean {
  return Boolean(AUTH_KEY)
}

type VerifyResult =
  | { ok: true; mobile: string }
  | { ok: false; message: string }

// Decode a JWT payload without verifying (safe to read only AFTER MSG91 has
// confirmed the token is authentic). Returns the parsed object or null.
function decodeTokenPayload(token: string): any {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(b64, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

// The widget access-token's payload carries the verified identifier.
function decodeIdentifier(token: string): string | null {
  const data = decodeTokenPayload(token)
  const id = data?.mobile ?? data?.identifier ?? data?.number ?? data?.phone
  return id ? String(id) : null
}

// Verify a widget access-token server-side and return the verified mobile.
export async function verifyAccessToken(token: string): Promise<VerifyResult> {
  const accessToken = String(token || '').trim()
  if (!accessToken) return { ok: false, message: 'Verification token is required.' }
  if (!isMsg91Configured()) {
    return { ok: false, message: 'OTP service is not configured. Set MSG91_AUTH_KEY.' }
  }

  const url = `${BASE}/widget/verifyAccessToken`
  const reqBody = { authkey: AUTH_KEY as string, 'access-token': accessToken }
  if (DEBUG) {
    // Mask the authkey so it never lands in logs in full.
    const maskedKey = `${(AUTH_KEY as string).slice(0, 4)}…${(AUTH_KEY as string).slice(-4)}`
    console.debug('[msg91] verifyAccessToken → POST', url)
    console.debug('[msg91] verifyAccessToken request', { authkey: maskedKey, 'access-token': accessToken })
    console.debug('[msg91] verifyAccessToken decoded token payload', decodeTokenPayload(accessToken))
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody),
    })
    const text = await res.text()
    let data: any = {}
    try {
      data = JSON.parse(text)
    } catch {
      data = { text }
    }
    if (DEBUG) {
      console.debug('[msg91] verifyAccessToken status', res.status, res.statusText)
      console.debug('[msg91] verifyAccessToken response', data)
    }

    if (data?.type === 'success') {
      // Prefer the identifier baked into the token; fall back to a phone-shaped
      // value echoed in the response message.
      const fromToken = decodeIdentifier(accessToken)
      const fromResp = /^\+?\d{6,15}$/.test(String(data.message || '')) ? String(data.message) : null
      const mobile = String(fromToken || fromResp || '').replace(/\D/g, '')
      if (DEBUG) {
        console.debug('[msg91] verifyAccessToken resolved mobile', { fromToken, fromResp, mobile })
      }
      if (!mobile) {
        return { ok: false, message: 'Verified, but no phone number was returned. Please try again.' }
      }
      return { ok: true, mobile }
    }

    return { ok: false, message: data?.message || 'Could not verify the OTP. Please try again.' }
  } catch (err) {
    console.error('[msg91] verifyAccessToken failed', err)
    return { ok: false, message: 'Failed to reach the verification service. Try again.' }
  }
}
