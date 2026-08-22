import { services, categories } from '@/lib/constants/services';

// Generates sitemap entries for all public pages
export function generateSitemap() {
  const baseUrl = 'https://etaxwala.com';

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/services', priority: '0.9', changefreq: 'weekly' },
    { url: '/appointment', priority: '0.7', changefreq: 'monthly' },
    { url: '/itr-filing', priority: '0.9', changefreq: 'monthly' },
    { url: '/fpc-training', priority: '0.8', changefreq: 'monthly' },
    { url: '/blog', priority: '0.7', changefreq: 'weekly' },
    { url: '/legal/terms', priority: '0.3', changefreq: 'yearly' },
    { url: '/legal/privacy', priority: '0.3', changefreq: 'yearly' },
    { url: '/legal/refund', priority: '0.3', changefreq: 'yearly' },
  ];

  const categoryPages = categories.map((c) => ({
    url: `/services/${c.slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  }));

  const servicePages = services.map((s) => ({
    url: `/services/${s.category}/${s.slug}`,
    priority: s.isFeatured ? '0.8' : '0.7',
    changefreq: 'monthly',
  }));

  const allPages = [...staticPages, ...categoryPages, ...servicePages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return xml;
}