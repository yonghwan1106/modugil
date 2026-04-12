import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://modugil.vercel.app';
  const lastModified = new Date();

  return [
    { url: baseUrl, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/dashboard`, lastModified, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/data`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/roadmap`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
