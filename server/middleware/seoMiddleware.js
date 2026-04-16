/**
 * SEO Middleware — PDFLynx
 * Provides compression, caching, security headers, and canonical redirect handling.
 */

/**
 * Security & SEO headers middleware.
 * Adds HSTS, content security, and cache control headers.
 */
const seoHeaders = (req, res, next) => {
  // Strict Transport Security — force HTTPS for 1 year + include subdomains
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer policy for privacy + SEO link equity
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  next();
};

/**
 * Canonical redirect middleware.
 * In production: redirects www → non-www and strips trailing slashes.
 */
const canonicalRedirect = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') return next();

  const host = req.get('host') || '';
  const url = req.originalUrl;

  // Redirect www to non-www
  if (host.startsWith('www.')) {
    const newHost = host.replace(/^www\./, '');
    return res.redirect(301, `https://${newHost}${url}`);
  }

  // Remove trailing slash (except for root "/")
  if (url.length > 1 && url.endsWith('/')) {
    return res.redirect(301, url.slice(0, -1));
  }

  next();
};

/**
 * Cache control middleware for API responses.
 * Sets appropriate cache headers based on route type.
 */
const cacheControl = (req, res, next) => {
  // Don't cache API mutation endpoints
  if (req.method !== 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    return next();
  }

  // Cache health check
  if (req.path === '/api/health') {
    res.setHeader('Cache-Control', 'public, max-age=30');
    return next();
  }

  // Don't cache authenticated API endpoints
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'private, no-cache');
    return next();
  }

  next();
};

module.exports = {
  seoHeaders,
  canonicalRedirect,
  cacheControl,
};
