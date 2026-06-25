import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://soulmatesync.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/messages/', '/settings/', '/profile/', '/checkout/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
