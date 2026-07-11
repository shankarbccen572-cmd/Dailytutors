import { NextResponse } from 'next/server'
import { ADMIN_TOKEN_NAME } from '@/lib/adminJwt'
import {
  createStudentToken,
  verifyStudentToken,
  STUDENT_TOKEN_NAME,
  STUDENT_TOKEN_MAX_AGE,
} from '@/lib/studentJwt'

// Dev flag: when auth is disabled, let every request through untouched.
const AUTH_DISABLED = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

const STUDENT_ROUTES = [
  '/dashboard',
  '/dashboard/',
  '/courses',
  '/courses/',
  '/learn',
  '/learn/',
  '/my-courses',
  '/my-courses/',
  '/cart',
  '/cart/',
  '/checkout',
  '/checkout/',
  '/certificates',
  '/certificates/',
  '/watch-course',
  '/watch-course/',
]

function isStudentRoute(pathname) {
  return STUDENT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}`)
  )
}

function getSafeCallbackUrl(url) {
  const candidate = `${url.pathname}${url.search}`
  return candidate.startsWith('/') && !candidate.startsWith('//') ? candidate : '/dashboard'
}

// Protects /dashboard, /courses, /learn and related student routes. Unauthenticated
// visitors are redirected to /login, while admin routes use /admin/login.
export default async function middleware(req) {
  const { pathname } = req.nextUrl

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)
  const pass = NextResponse.next({ request: { headers: requestHeaders } })

  if (AUTH_DISABLED) return pass
  if (pathname === '/admin/login') return pass

  if (pathname.startsWith('/admin')) {
    const adminToken = req.cookies.get(ADMIN_TOKEN_NAME)?.value
    if (adminToken) return pass
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  if (isStudentRoute(pathname)) {
    const studentToken = req.cookies.get(STUDENT_TOKEN_NAME)?.value
    const studentVerified = studentToken
      ? await verifyStudentToken(studentToken)
      : { valid: false }

    if (studentVerified.valid) return pass

    const sessionToken = await import('next-auth/jwt').then(({ getToken }) =>
      getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    )

    if (sessionToken) {
      const token = await createStudentToken({
        userId: sessionToken.uid || sessionToken.sub,
        email: sessionToken.email,
        role: sessionToken.role,
      }, STUDENT_TOKEN_MAX_AGE)

      const response = NextResponse.next({ request: { headers: requestHeaders } })
      response.cookies.set({
        name: STUDENT_TOKEN_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: STUDENT_TOKEN_MAX_AGE,
      })
      return response
    }

    const callbackUrl = getSafeCallbackUrl(req.nextUrl)
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('callbackUrl', callbackUrl)
    return NextResponse.redirect(url)
  }

  return pass
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
    '/courses',
    '/courses/:path*',
    '/learn/:path*',
    '/my-courses',
    '/my-courses/:path*',
    '/cart',
    '/cart/:path*',
    '/checkout',
    '/checkout/:path*',
    '/certificates',
    '/certificates/:path*',
    '/watch-course/:path*',
  ],
}
