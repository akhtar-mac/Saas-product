import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object;
}

const defaultTitle = 'ETaxwala - Your Business Doctor | Business Registration, Tax & Compliance';
const defaultDesc = 'ETaxwala Business Solutions - 250+ services for business registration, ITR filing, GST, audit, compliance, web development, and marketing. Trusted by 1 Lakh+ customers. 120+ franchises across India.';
const defaultKeywords = 'business registration, company registration, GST registration, ITR filing, tax audit, LLP, private limited, MSME, FSSAI, trademark, web development, marketing';

export default function SEO({ title, description, keywords, image, url, type = 'website', schema }: SEOProps) {
  const fullTitle = title ? `${title} | ETaxwala` : defaultTitle;
  const desc = description || defaultDesc;
  const kw = keywords || defaultKeywords;
  const img = image || 'https://etaxwala.com/public/img/ofc1.jpg';
  const fullUrl = url ? `https://etaxwala.com${url}` : 'https://etaxwala.com';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={kw} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={img} />
      <meta property="og:site_name" content="ETaxwala" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}