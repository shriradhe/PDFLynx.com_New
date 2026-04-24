/**
 * SEO Controller — PDFLynx
 * Handles dynamic sitemap.xml and robots.txt generation.
 */

const SITE_URL = 'https://pdflynx.com';
const googleIndexingService = require('../services/googleIndexingService');

// ─── All public (indexable) routes ────────────────────────────────────────────
const PUBLIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/merge-pdf', priority: '0.9', changefreq: 'weekly' },
  { path: '/split-pdf', priority: '0.9', changefreq: 'weekly' },
  { path: '/compress-pdf', priority: '0.9', changefreq: 'weekly' },
  { path: '/convert', priority: '0.9', changefreq: 'weekly' },
  { path: '/rotate-pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/watermark-pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/protect-pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/unlock-pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/page-numbers', priority: '0.7', changefreq: 'weekly' },
  { path: '/ocr-pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/sign-pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/edit-pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/pdf-to-text', priority: '0.7', changefreq: 'weekly' },
  { path: '/pdf-to-png', priority: '0.7', changefreq: 'weekly' },
  { path: '/organize-pdf', priority: '0.7', changefreq: 'weekly' },
  { path: '/redact-pdf', priority: '0.7', changefreq: 'weekly' },
  { path: '/html-to-pdf', priority: '0.7', changefreq: 'weekly' },
  { path: '/image-to-pdf', priority: '0.7', changefreq: 'weekly' },
  { path: '/annotate-pdf', priority: '0.7', changefreq: 'weekly' },
  { path: '/fill-pdf-form', priority: '0.7', changefreq: 'weekly' },
  { path: '/compare-pdf', priority: '0.7', changefreq: 'weekly' },
  { path: '/e-signature', priority: '0.7', changefreq: 'weekly' },
  { path: '/ai-summary', priority: '0.8', changefreq: 'weekly' },
  { path: '/chat-with-pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/smart-search', priority: '0.8', changefreq: 'weekly' },
  { path: '/pricing', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
  { path: '/privacy-policy', priority: '0.5', changefreq: 'monthly' },
  { path: '/terms-and-conditions', priority: '0.5', changefreq: 'monthly' },
  { path: '/dmca-policy', priority: '0.5', changefreq: 'monthly' },
];

// ─── Blog routes ──────────────────────────────────────────────────────────────
const BLOG_SLUGS = [
  'how-to-merge-pdf-files',
  'reduce-pdf-file-size',
  'ai-pdf-summarization-guide',
  'how-to-split-pdf-pages',
  'convert-pdf-to-word-without-losing-formatting',
  'how-to-password-protect-pdf',
  'guide-to-scanning-and-ocr',
  'how-to-chat-with-pdf-files',
  'how-to-electronically-sign-pdf',
  'semantic-search-vs-keyword-search',
  'how-to-rearrange-and-organize-pdf-pages',
  'watermarking-pdfs-for-business'
];

const BLOG_ROUTES = BLOG_SLUGS.map(slug => ({
  path: `/blog/${slug}`,
  priority: '0.6',
  changefreq: 'monthly'
}));

/**
 * Helper to generate URL XML nodes
 */
const generateUrlNodes = (routes) => {
  const today = new Date().toISOString().split('T')[0];
  return routes.map(route => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n');
};

/**
 * GET /sitemap.xml
 * Dynamically generates a Sitemap Index pointing to tools and blog sitemaps.
 */
const getSitemap = (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-tools.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-blog.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(sitemap);
};

/**
 * GET /sitemap-tools.xml
 * Dynamically generates XML sitemap for public tools and pages.
 */
const getSitemapTools = (req, res) => {
  const urls = generateUrlNodes(PUBLIC_ROUTES);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(sitemap);
};

/**
 * GET /sitemap-blog.xml
 * Dynamically generates XML sitemap for blog posts.
 */
const getSitemapBlog = (req, res) => {
  const urls = generateUrlNodes(BLOG_ROUTES);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(sitemap);
};

/**
 * GET /robots.txt
 * Serves robots.txt with crawl directives and sitemap reference.
 */
const getRobotsTxt = (req, res) => {
  const robotsTxt = `# robots.txt — PDFLynx
# ${SITE_URL}

User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /settings
Disallow: /login
Disallow: /register
Disallow: /outputs/

# Block crawlers from spamming search functions or internal logic
Disallow: /*?query=*
Disallow: /*&sort=*

# Crawl-delay
Crawl-delay: 1

# Explicit Googlebot allowance
User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /settings
Disallow: /outputs/

User-agent: Googlebot-Image
Allow: /

User-agent: Googlebot-Mobile
Allow: /

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml
`;

  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'public, max-age=86400');
  res.status(200).send(robotsTxt);
};

/**
 * POST /api/seo/index-url
 * Admin/internal endpoint to submit URLs to Google Indexing API.
 */
const requestUrlIndexing = async (req, res) => {
  const { url, type } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: 'URL is required' });
  }

  // Type defaults to URL_UPDATED if not provided, allowing URL_DELETED as well
  const notificationType = type === 'URL_DELETED' ? 'URL_DELETED' : 'URL_UPDATED';

  try {
    const result = await googleIndexingService.publishURL(url, notificationType);
    
    if (result.success) {
      res.status(200).json({ success: true, message: 'URL indexing requested successfully', data: result.data });
    } else {
      res.status(500).json({ success: false, message: 'Failed to request URL indexing', error: result.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error during indexing request', error: error.message });
  }
};

module.exports = {
  getSitemap,
  getSitemapTools,
  getSitemapBlog,
  getRobotsTxt,
  requestUrlIndexing,
};
