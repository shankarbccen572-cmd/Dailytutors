import type { MetadataRoute } from 'next'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dailytutors.in'

// Regenerate at most once an hour so newly published courses appear in the
// sitemap without needing a redeploy.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Public, always-present routes. /login is intentionally excluded (no SEO
  // value and it is a bare auth page.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/courses`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/brand-preview`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
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
          lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
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
