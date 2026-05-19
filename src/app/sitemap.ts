import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

const publicRoutes = ['/', '/about', '/contact', '/privacy']

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return publicRoutes.map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
