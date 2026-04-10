import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://pins.dk',
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 1,
        },
        {
            url: 'https://pins.dk/dashboard',
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: 'https://pins.dk/terms-of-service',
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        },
    ]
}