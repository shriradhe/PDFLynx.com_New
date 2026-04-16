/**
 * SEO Component — PDFLynx
 * Reusable component that manages all <head> meta tags via react-helmet-async.
 *
 * Usage:
 *   <SEO
 *     title="Merge PDF — Combine PDF Files Online Free | PDFLynx"
 *     description="Merge multiple PDF files..."
 *     keywords="merge PDF, combine PDF"
 *     path="/merge-pdf"
 *     noindex={false}
 *     structuredData={[schema1, schema2]}
 *   />
 */
import { Helmet } from 'react-helmet-async';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, TWITTER_HANDLE } from '../utils/seo';

export default function SEO({
  title = `${SITE_NAME} — Free Online PDF Tools`,
  description = 'The complete online PDF toolkit. Merge, split, compress, convert, protect and edit PDFs for free.',
  keywords = '',
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
  structuredData = [],
}) {
  const canonicalUrl = `${SITE_URL}${path}`;

  return (
    <Helmet>
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />

      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {TWITTER_HANDLE && <meta name="twitter:site" content={TWITTER_HANDLE} />}
      {TWITTER_HANDLE && <meta name="twitter:creator" content={TWITTER_HANDLE} />}

      {/* Additional SEO */}
      <meta name="application-name" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <meta name="format-detection" content="telephone=no" />

      {/* JSON-LD Structured Data */}
      {structuredData.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
