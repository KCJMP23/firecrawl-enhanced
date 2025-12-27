import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://webclone.pro'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/tmp/',
          '*.json',
          '/dashboard/settings/billing',
          '/dashboard/settings/api-keys'
        ],
        crawlDelay: 1
      },
      {
        userAgent: 'GPTBot',
        disallow: '/'
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/'
      },
      {
        userAgent: 'CCBot',
        disallow: '/'
      }
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/blog-sitemap.xml`,
      `${baseUrl}/templates-sitemap.xml`
    ],
    host: baseUrl
  }
}