/**
 * SEO Routes — PDFLynx
 * Routes for sitemap.xml and robots.txt
 */
const express = require('express');
const router = express.Router();
const { getSitemap, getSitemapTools, getSitemapBlog, getRobotsTxt } = require('../controllers/seoController');

// Dynamic sitemap index — accessible at /sitemap.xml
router.get('/sitemap.xml', getSitemap);

// Segmented sitemaps
router.get('/sitemap-tools.xml', getSitemapTools);
router.get('/sitemap-blog.xml', getSitemapBlog);

// Dynamic robots.txt — accessible at /robots.txt
router.get('/robots.txt', getRobotsTxt);

module.exports = router;
