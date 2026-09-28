const fs = require('fs');
const path = require('path');

const servicesPath = path.join(__dirname, '../apps/web/src/lib/constants/services.ts');
const publicDir = path.join(__dirname, '../apps/web/public');
const sitemapPath = path.join(publicDir, 'sitemap.xml');
const robotsPath = path.join(publicDir, 'robots.txt');

// Read services.ts
const content = fs.readFileSync(servicesPath, 'utf8');

// Categories
const categories = [
  'registration',
  'other-registrations',
  'taxation',
  'audit',
  'consultancy',
  'ip',
  'marketing',
  'legal'
];

// Extract services
const serviceList = [];
const serviceBlockMatch = content.match(/export const services: ServiceItem\[\] = \[([\s\S]*?)\];/);

if (serviceBlockMatch) {
  const block = serviceBlockMatch[1];
  // Regex to extract name, slug, category
  const itemRegex = /{\s*id:[^,]+,\s*name:\s*['"]([^'"]+)['"],\s*slug:\s*['"]([^'"]+)['"],\s*category:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = itemRegex.exec(block)) !== null) {
    serviceList.push({
      name: match[1],
      slug: match[2],
      category: match[3],
    });
  }
}

console.log(`Found ${serviceList.length} services for sitemap generation.`);

const today = new Date().toISOString().split('T')[0];

const coreUrls = [
  { loc: 'https://etaxwala.com/', priority: '1.0', changefreq: 'daily' },
  { loc: 'https://etaxwala.com/services', priority: '0.9', changefreq: 'daily' },
  { loc: 'https://etaxwala.com/itr-filing', priority: '0.9', changefreq: 'weekly' },
  { loc: 'https://etaxwala.com/fpc-training', priority: '0.9', changefreq: 'weekly' },
  { loc: 'https://etaxwala.com/appointment', priority: '0.9', changefreq: 'weekly' },
  { loc: 'https://etaxwala.com/about', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://etaxwala.com/contact', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://etaxwala.com/careers', priority: '0.7', changefreq: 'monthly' },
  { loc: 'https://etaxwala.com/blog', priority: '0.8', changefreq: 'daily' },
  { loc: 'https://etaxwala.com/legal/terms', priority: '0.4', changefreq: 'yearly' },
  { loc: 'https://etaxwala.com/legal/privacy', priority: '0.4', changefreq: 'yearly' },
  { loc: 'https://etaxwala.com/legal/refund', priority: '0.4', changefreq: 'yearly' },
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- ── 1. Core High-Priority Pages ── -->
`;

for (const u of coreUrls) {
  xml += `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>\n`;
}

xml += `\n  <!-- ── 2. Primary Service Categories ── -->\n`;
for (const cat of categories) {
  xml += `  <url>
    <loc>https://etaxwala.com/services/${cat}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>\n`;
}

xml += `\n  <!-- ── 3. Complete Services Catalog (250+ Indexable Service Pages) ── -->\n`;
for (const s of serviceList) {
  xml += `  <url>
    <loc>https://etaxwala.com/services/${s.category}/${s.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>\n`;
}

xml += `</urlset>\n`;

fs.writeFileSync(sitemapPath, xml, 'utf8');
console.log(`Generated sitemap.xml with ${coreUrls.length + categories.length + serviceList.length} indexed URLs at: ${sitemapPath}`);

// Also update robots.txt with exact portal and crm protection
const robotsTxt = `# robots.txt for ETaxwala - Chartered Accountants & Legal Services
User-agent: *
Allow: /
Allow: /services/
Allow: /itr-filing
Allow: /fpc-training
Allow: /appointment
Allow: /about
Allow: /contact
Allow: /blog

# Block private portal, staff CRM, and backend APIs from search engine indexing
Disallow: /portal/
Disallow: /crm/
Disallow: /api/
Disallow: /admin/

# Sitemaps
Sitemap: https://etaxwala.com/sitemap.xml
`;

fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
console.log(`Updated robots.txt at: ${robotsPath}`);
