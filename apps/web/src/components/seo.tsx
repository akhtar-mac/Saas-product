import { Helmet } from 'react-helmet-async';

export interface SEOFaqItem {
  question: string;
  answer: string;
}

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object;
  faqs?: SEOFaqItem[];
  noIndex?: boolean;
}

const defaultTitle = 'ETaxwala — Chartered Accountants & Business Registration India';
const defaultDesc =
  'ETaxwala Business Solutions — India’s trusted CA firm for Private Limited Company Registration, LLP, ITR Filing, GST Compliance, Tax Audit & Trademark. Over 1 Lakh+ clients served across India.';
const defaultKeywords =
  'company registration india, private limited company, ITR filing online, GST registration, chartered accountant online, tax audit, LLP registration, trademark registration, business compliance';

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  schema,
  faqs,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ETaxwala` : defaultTitle;
  const desc = description || defaultDesc;
  const kw = keywords || defaultKeywords;
  const img = image || 'https://etaxwala.com/hero_corporate_growth.jpg';
  const fullUrl = url ? `https://etaxwala.com${url}` : 'https://etaxwala.com';

  // 1. Organization & AccountingService Master Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'AccountingService',
    '@id': 'https://etaxwala.com/#organization',
    name: 'ETaxwala Business Solutions',
    legalName: 'ETaxwala Business Solutions Private Limited',
    url: 'https://etaxwala.com',
    logo: 'https://etaxwala.com/logo_black.png',
    image: img,
    description: desc,
    telephone: '+91-7071070707',
    email: 'support@etaxwala.com',
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Credit Card, Debit Card, Net Banking, UPI',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.6139,
      longitude: 77.209,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:30',
        closes: '19:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '12480',
      bestRating: '5',
      worstRating: '1',
    },
    sameAs: [
      'https://www.facebook.com/etaxwala',
      'https://www.linkedin.com/company/etaxwala',
      'https://twitter.com/etaxwala',
    ],
  };

  // 2. Breadcrumbs Schema
  let breadcrumbSchema = null;
  if (url && url !== '/') {
    const segments = url.split('/').filter(Boolean);
    const itemListElement = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://etaxwala.com',
      },
    ];

    let currentPath = 'https://etaxwala.com';
    segments.forEach((seg, idx) => {
      currentPath += `/${seg}`;
      const formattedName = seg
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      itemListElement.push({
        '@type': 'ListItem',
        position: idx + 2,
        name: formattedName,
        item: currentPath,
      });
    });

    breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement,
    };
  }

  // 3. FAQPage Schema for Google Rich Snippets
  let faqSchema = null;
  if (faqs && faqs.length > 0) {
    faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={kw} />
      <meta
        name="robots"
        content={
          noIndex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        }
      />

      {/* Geo / Local SEO Metadata for India */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={img} />
      <meta property="og:site_name" content="ETaxwala" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Master Organization JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      {/* Breadcrumb JSON-LD */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* FAQ Rich Results JSON-LD */}
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}

      {/* Custom Service/Product JSON-LD */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}