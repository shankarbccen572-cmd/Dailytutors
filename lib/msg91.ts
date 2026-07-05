// MSG91 OTP integration (India). All calls are server-side only — the authkey
// must never reach the browser.
//
// Docs: https://docs.msg91.com/otp
//   Send:   POST https://control.msg91.com/api/v5/otp?template_id=..&mobile=..
//   Verify: GET  https://control.msg91.com/api/v5/otp/verify?otp=..&mobile=..
//   Retry:  GET  https://control.msg91.com/api/v5/otp/retry?mobile=..&retrytype=text
//
// If MSG91 is not configured (no authkey/template), we fall back to a DEV MODE
// in non-production that accepts a fixed OTP so the full login flow can be
// tested locally without an MSG91 account. This never activates in production.

const AUTH_KEY = process.env.MSG91_AUTH_KEY
const TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID
const OTP_EXPIRY = process.env.MSG91_OTP_EXPIRY || '5' // minutes
const BASE = 'https://control.msg91.com/api/v5'
const DEV_OTP = '123456'

// Convert any user input to MSG91's expected format: country code + number,
// digits only, e.g. "919071366466".
export function toMsg91Mobile(phone: string): string {
  let d = String(phone || '').replace(/\D/g, '')
  if (d.length === 10) d = `91${d}`
  else if (d.length === 11 && d.startsWith('0')) d = `91${d.slice(1)}`
  return d
}

export function isValidIndianMobile(phone: string): boolean {
  return /^91[6-9]\d{9}$/.test(toMsg91Mobile(phone))
}

export function isMsg91Configured(): boolean {
  return Boolean(AUTH_KEY && TEMPLATE_ID)
}

type OtpResult = { ok: boolean; message: string; dev?: boolean }

export async function sendOtp(phone: string): Promise<OtpResult> {
  const mobile = toMsg91Mobile(phone)
  if (!isValidIndianMobile(mobile)) {
    return { ok: false, message: 'Enter a valid 10-digit Indian mobile number.' }
  }

  if (!isMsg91Configured()) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, message: 'OTP service is not configured.' }
    }
    console.warn(`[msg91] DEV MODE (no MSG91_AUTH_KEY): use OTP ${DEV_OTP} for ${mobile}.`)
    return { ok: true, message: `Dev mode: enter ${DEV_OTP}.`, dev: true }
  }

  try {
    const url =
      `${BASE}/otp?template_id=${encodeURIComponent(TEMPLATE_ID as string)}` +
      `&mobile=${mobile}&otp_expiry=${OTP_EXPIRY}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { authkey: AUTH_KEY as string, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const data = await res.json().catch(() => ({}))
    if (data?.type === 'success') return { ok: true, message: 'OTP sent.' }
    return { ok: false, message: data?.message || 'Failed to send OTP.' }
  } catch (err) {
    console.error('[msg91] sendOtp failed', err)
    return { ok: false, message: 'Failed to reach OTP service. Try again.' }
  }
}

export async function verifyOtp(phone: string, otp: string): Promise<OtpResult> {
  const mobile = toMsg91Mobile(phone)
  const code = String(otp || '').replace(/\D/g, '')
  if (!code) return { ok: false, message: 'Enter the OTP.' }

  if (!isMsg91Configured()) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, message: 'OTP service is not configured.' }
    }
    return code === DEV_OTP
      ? { ok: true, message: 'OTP verified (dev mode).' }
      : { ok: false, message: `Invalid OTP. Dev mode expects ${DEV_OTP}.` }
  }

  try {
    const url = `${BASE}/otp/verify?otp=${code}&mobile=${mobile}`
    const res = await fetch(url, {
      method: 'GET',
      headers: { authkey: AUTH_KEY as string },
    })
    const data = await res.json().catch(() => ({}))
    if (data?.type === 'success') return { ok: true, message: 'OTP verified.' }
    return { ok: false, message: data?.message || 'Invalid or expired OTP.' }
  } catch (err) {
    console.error('[msg91] verifyOtp failed', err)
    return { ok: false, message: 'Failed to reach OTP service. Try again.' }
  }
}
