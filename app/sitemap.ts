import type { MetadataRoute } from 'next'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dailytutors.in'

// Regenerate at most once an hour so newly published courses appear in the
// sitemap without needing a redeploy.
export const revalidate = 3600

// Emit lastmod as a plain W3C date (YYYY-MM-DD). This is the most widely
// accepted format — some validators dislike the millisecond-precision ISO
// timestamp Next.js produces from a Date object.
function ymd(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = ymd(new Date())

  // Public, always-present routes. /login and /brand-preview are intentionally
  // excluded (no SEO value — auth page and internal design preview).
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: today, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/courses`, lastModified: today, changeFrequency: 'weekly', priority: 0.9 },
  ]

  let courseRoutes: MetadataRoute.Sitemap = []
  try {
    if (process.env.MONGODB_URI) {
      await dbConnect()
      const courses = await Course.find({ status: 'published' })
        .select('slug updatedAt')
        .lean()

      courseRoutes = courses
        .filter((c: any) => c.slug)
        .map((c: any) => ({
          url: `${BASE_URL}/courses/${c.slug}`,
          lastModified: c.updatedAt ? ymd(new Date(c.updatedAt)) : today,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
    }
  } catch (err) {
    // A DB hiccup must never break the sitemap — fall back to the static routes
    // so /sitemap.xml always returns valid XML with HTTP 200.
    console.error('sitemap: failed to load courses', err)
  }

  return [...staticRoutes, ...courseRoutes]
}
