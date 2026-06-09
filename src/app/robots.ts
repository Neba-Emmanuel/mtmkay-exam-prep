import type { MetadataRoute } from 'next'
import { absoluteUrl, publicRoutes, siteConfig } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [...publicRoutes],
        disallow: [
          '/admin',
          '/admin/',
          '/dashboard',
          '/exams',
          '/exams/',
          '/login',
          '/profile',
          '/register',
          '/results',
          '/results/',
          '/subscription',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteConfig.url,
  }
}
