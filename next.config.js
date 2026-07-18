/** @type {import('next').NextConfig} */

// Baseline security headers applied to every response. Intentionally excludes a
// strict Content-Security-Policy for now: the app loads Razorpay checkout,
// Google Sign-In and YouTube/Vimeo/Cloudinary embeds, so a CSP must be authored
// and tested against those origins in a dedicated pass before enforcing (adding
// a wrong CSP would silently break payments). These headers are safe today.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Protects our own pages from being framed (clickjacking). Does not affect
  // our ability to embed third-party players.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
