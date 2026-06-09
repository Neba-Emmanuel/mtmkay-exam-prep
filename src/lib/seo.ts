import type { Metadata } from 'next'

export const siteConfig = {
  name: 'MTMKay Exam Prep',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://exam.mtmkay.com',
  description:
    'Computer-based exam practice, past questions, performance analytics, and visual practicals for GCE, HND, concours, and professional exams in Cameroon.',
  keywords: [
    'MTMKay',
    'exam prep Cameroon',
    'GCE past questions',
    'GCE CBT practice',
    'HND exam preparation',
    'Cameroon concours practice',
    'online exam practice',
    'science practicals',
    'GCE practicals',
    'AL past questions',
    'O Level past questions',
    'Cameroon exam resources',
    'digital learning platform',
  ],
}

export const publicRoutes = ['/', '/about', '/contact', '/privacy-policy'] as const

export function absoluteUrl(path = '/') {
  return new URL(path, siteConfig.url).toString()
}

export function createMetadata({
  title,
  description = siteConfig.description,
  path = '/',
  noIndex = false,
}: {
  title?: string
  description?: string
  path?: string
  noIndex?: boolean
} = {}): Metadata {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name
  const url = absoluteUrl(path)

  return {
    title: pageTitle,
    description,
    keywords: siteConfig.keywords,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: {
      type: 'website',
      locale: 'en_CM',
      url,
      siteName: siteConfig.name,
      title: pageTitle,
      description,
      images: [
        {
          url: absoluteUrl('/mtmkay_logo.png'),
          width: 512,
          height: 512,
          alt: `${siteConfig.name} logo`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: pageTitle,
      description,
      images: [absoluteUrl('/mtmkay_logo.png')],
    },
  }
}
