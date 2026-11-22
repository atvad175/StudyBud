import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://studybud-five-puce.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    { url: `${BASE_URL}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE_URL}/features`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/mission`, lastModified, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE_URL}/about`, lastModified, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE_URL}/community`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/login`, lastModified, changeFrequency: 'yearly', priority: 0.7 },
  ]
}
