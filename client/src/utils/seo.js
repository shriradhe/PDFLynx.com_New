/**
 * SEO Configuration — PDFLynx
 * Central source of truth for all SEO metadata, structured data, and helpers.
 */
import { blogPosts } from '../data/blogData.js';

// ─── Site Constants ───────────────────────────────────────────────────────────
export const SITE_URL = 'https://pdflynx.com';
export const SITE_NAME = 'PDFLynx';
export const SITE_TAGLINE = 'Free Online PDF Tools';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const TWITTER_HANDLE = '@pdflynx';
export const GA_MEASUREMENT_ID = 'G-G7Y4WG81QF'; // Add your GA4 ID: G-XXXXXXXXXX
export const SEARCH_CONSOLE_ID = ''; // Add your Search Console verification code

// ─── Per-Route SEO Metadata ──────────────────────────────────────────────────
export const PAGE_SEO = {
  '/': {
    title: 'PDFLynx — Free Online PDF Tools | Merge, Split, Compress & Convert',
    description:
      'PDFLynx is the complete online PDF toolkit. Merge, split, compress, convert, protect, sign, edit, and OCR your PDFs for free. No installation required.',
    keywords:
      'PDF tools, merge PDF, split PDF, compress PDF, convert PDF, PDF to Word, PDF to JPG, free PDF tools, online PDF editor',
  },
  '/merge-pdf': {
    title: 'Merge PDF — Combine PDF Files Online Free | PDFLynx',
    description:
      'Merge multiple PDF files into one document online for free. Drag and drop to reorder pages. Fast, secure, and no installation required.',
    keywords: 'merge PDF, combine PDF, join PDF, merge PDF files online free',
  },
  '/split-pdf': {
    title: 'Split PDF — Extract Pages from PDF Online Free | PDFLynx',
    description:
      'Split PDF files into multiple documents or extract specific pages. Fast, free, and easy to use. No sign-up required.',
    keywords: 'split PDF, extract PDF pages, separate PDF, divide PDF online free',
  },
  '/compress-pdf': {
    title: 'Compress PDF — Reduce PDF File Size Online Free | PDFLynx',
    description:
      'Compress PDF files to reduce size without losing quality. Choose compression level. Free online PDF compressor — no watermark.',
    keywords: 'compress PDF, reduce PDF size, shrink PDF, PDF compressor online free',
  },
  '/convert': {
    title: 'Convert PDF — PDF to Word, JPG, PNG & More | PDFLynx',
    description:
      'Convert PDF to Word, JPG, PNG, Text, and more. Also convert images and documents to PDF. Free online converter with high quality output.',
    keywords: 'convert PDF, PDF to Word, PDF to JPG, JPG to PDF, PDF converter online free',
  },
  '/rotate-pdf': {
    title: 'Rotate PDF — Rotate PDF Pages Online Free | PDFLynx',
    description:
      'Rotate PDF pages 90°, 180°, or 270°. Fix upside-down or sideways scans instantly. Free online PDF rotation tool.',
    keywords: 'rotate PDF, turn PDF pages, fix PDF orientation, rotate PDF online free',
  },
  '/watermark-pdf': {
    title: 'Watermark PDF — Add Text Watermark to PDF Free | PDFLynx',
    description:
      'Add custom text watermarks to your PDF documents. Customize font, size, color, opacity, and position. Free online watermarking tool.',
    keywords: 'watermark PDF, add watermark to PDF, stamp PDF, PDF watermark online free',
  },
  '/protect-pdf': {
    title: 'Protect PDF — Password Protect PDF Online Free | PDFLynx',
    description:
      'Secure your PDF with a strong password. Encrypt PDF files with AES-256 encryption. Free online PDF password protection.',
    keywords: 'protect PDF, password protect PDF, encrypt PDF, lock PDF online free',
  },
  '/unlock-pdf': {
    title: 'Unlock PDF — Remove PDF Password Online Free | PDFLynx',
    description:
      'Remove password protection from PDF files. Unlock secured PDFs instantly. Free, fast, and secure online tool.',
    keywords: 'unlock PDF, remove PDF password, decrypt PDF, unprotect PDF online free',
  },
  '/page-numbers': {
    title: 'Add Page Numbers to PDF — Free Online Tool | PDFLynx',
    description:
      'Add page numbers to your PDF documents. Customize position, format, font, and starting number. Free online page numbering tool.',
    keywords: 'add page numbers PDF, number PDF pages, PDF page numbering online free',
  },
  '/ocr-pdf': {
    title: 'OCR PDF — Extract Text from Scanned PDF Free | PDFLynx',
    description:
      'Extract text from scanned PDFs and images using OCR technology. Make scanned documents searchable. Free online OCR tool.',
    keywords: 'OCR PDF, extract text from PDF, scanned PDF to text, PDF OCR online free',
  },
  '/sign-pdf': {
    title: 'Sign PDF — Add Digital Signature to PDF Free | PDFLynx',
    description:
      'Add your digital signature to any PDF document. Draw, type, or upload your signature. Free online PDF signing tool.',
    keywords: 'sign PDF, digital signature PDF, e-sign PDF, sign PDF online free',
  },
  '/edit-pdf': {
    title: 'Edit PDF — Add Text, Images & Shapes to PDF Free | PDFLynx',
    description:
      'Edit PDF files online for free. Add text, images, shapes, and annotations. No software installation required.',
    keywords: 'edit PDF, PDF editor online, add text to PDF, modify PDF online free',
  },
  '/pdf-to-text': {
    title: 'PDF to Text — Extract Text from PDF Online Free | PDFLynx',
    description:
      'Extract all text content from PDF files instantly. Copy and download extracted text. Free online PDF to text converter.',
    keywords: 'PDF to text, extract text from PDF, PDF text extractor, convert PDF to text free',
  },
  '/pdf-to-png': {
    title: 'PDF to PNG — Convert PDF Pages to PNG Images Free | PDFLynx',
    description:
      'Convert PDF pages to high-quality PNG images. Export all pages or select specific ones. Free online PDF to PNG converter.',
    keywords: 'PDF to PNG, convert PDF to image, PDF to picture, PDF to PNG online free',
  },
  '/organize-pdf': {
    title: 'Organize PDF Pages — Reorder, Delete & Duplicate Free | PDFLynx',
    description:
      'Rearrange PDF pages with drag-and-drop. Delete, duplicate, or move pages easily. Free online PDF page organizer.',
    keywords: 'organize PDF, reorder PDF pages, rearrange PDF, delete PDF pages online free',
  },
  '/redact-pdf': {
    title: 'Redact PDF — Remove Sensitive Content from PDF Free | PDFLynx',
    description:
      'Permanently remove sensitive information from PDF documents. Redact text, images, and areas securely. Free online PDF redaction.',
    keywords: 'redact PDF, remove text from PDF, censor PDF, PDF redaction tool online free',
  },
  '/html-to-pdf': {
    title: 'HTML to PDF — Convert HTML to PDF Online Free | PDFLynx',
    description:
      'Convert HTML content to professional PDF documents. Paste HTML code and get a formatted PDF. Free online HTML to PDF converter.',
    keywords: 'HTML to PDF, convert HTML to PDF, webpage to PDF, HTML to PDF online free',
  },
  '/image-to-pdf': {
    title: 'Image to PDF — Convert Images to PDF Online Free | PDFLynx',
    description:
      'Merge multiple images (JPG, PNG, WebP) into a single PDF file. Customize page size and orientation. Free online image to PDF converter.',
    keywords: 'image to PDF, JPG to PDF, PNG to PDF, convert images to PDF online free',
  },
  '/annotate-pdf': {
    title: 'Annotate PDF — Add Notes & Highlights to PDF Free | PDFLynx',
    description:
      'Annotate PDF files with highlights, notes, underlines, and comments. Collaborate on documents easily. Free online PDF annotation tool.',
    keywords: 'annotate PDF, highlight PDF, add notes to PDF, PDF annotation online free',
  },
  '/fill-pdf-form': {
    title: 'Fill PDF Form — Fill Out PDF Forms Online Free | PDFLynx',
    description:
      'Fill out PDF forms online without Adobe Acrobat. Type into form fields, add checkmarks, and sign. Free online PDF form filler.',
    keywords: 'fill PDF form, PDF form filler, fill out PDF online, complete PDF form free',
  },
  '/compare-pdf': {
    title: 'Compare PDF — Compare Two PDF Files Online Free | PDFLynx',
    description:
      'Compare two PDF documents side by side. Highlight differences in text and formatting. Free online PDF comparison tool.',
    keywords: 'compare PDF, PDF diff, compare two PDFs, PDF comparison tool online free',
  },
  '/e-signature': {
    title: 'E-Signature — Electronic Signature for PDF Free | PDFLynx',
    description:
      'Create legally binding electronic signatures on PDF documents. Sign, send, and manage documents. Free online e-signature tool.',
    keywords: 'e-signature, electronic signature PDF, digital signature, sign documents online free',
  },
  '/ai-summary': {
    title: 'AI PDF Summary — Summarize PDF with AI Free | PDFLynx',
    description:
      'Get instant AI-powered summaries of your PDF documents. Choose brief, detailed, or executive summary styles. Free online AI PDF summarizer.',
    keywords: 'AI PDF summary, summarize PDF, AI document summary, PDF summarizer online free',
  },
  '/chat-with-pdf': {
    title: 'Chat with PDF — AI-Powered PDF Q&A Free | PDFLynx',
    description:
      'Upload a PDF and ask questions about its content. AI reads and understands your document to provide accurate answers. Free online PDF chat.',
    keywords: 'chat with PDF, ask PDF questions, AI PDF reader, talk to PDF online free',
  },
  '/smart-search': {
    title: 'Smart Search — AI Semantic PDF Search Free | PDFLynx',
    description:
      'Search PDF documents by meaning, not just keywords. AI-powered semantic search finds what you need even with different wording. Free online.',
    keywords: 'smart search PDF, semantic search PDF, AI PDF search, find in PDF online free',
  },
  '/pricing': {
    title: 'Pricing — PDFLynx Plans & Features',
    description:
      'Compare PDFLynx pricing plans. Free tier with 20+ tools, Pro for power users, and Enterprise for teams. Start free, upgrade anytime.',
    keywords: 'PDFLynx pricing, PDF tools pricing, free PDF tools, PDFLynx plans',
  },
  '/login': {
    title: 'Log In — PDFLynx',
    description: 'Log in to your PDFLynx account to access your dashboard, API keys, and premium features.',
    keywords: 'PDFLynx login, sign in PDFLynx',
    noindex: true,
  },
  '/register': {
    title: 'Create Account — PDFLynx',
    description: 'Create a free PDFLynx account. Get access to 20+ PDF tools, API access, and more. No credit card required.',
    keywords: 'PDFLynx register, create account PDFLynx, sign up PDFLynx',
    noindex: true,
  },
  '/dashboard': {
    title: 'Dashboard — PDFLynx',
    description: 'Your PDFLynx dashboard. View usage statistics, recent files, and manage your account.',
    noindex: true,
  },
  '/settings': {
    title: 'Settings — PDFLynx',
    description: 'Manage your PDFLynx account settings, API keys, webhooks, and preferences.',
    noindex: true,
  },
  '/blog': {
    title: 'PDFLynx Blog — Tips, News & PDF Tutorials',
    description: 'Discover the latest news, productivity tips, and tutorials on how to manage and optimize your PDF workflow.',
    keywords: 'PDF blog, PDF tutorials, productivity tips, PDFLynx news',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions — PDFLynx',
    description: 'Read the Terms and Conditions for using PDFLynx. Understand your rights and our obligations.',
    keywords: 'PDFLynx terms, terms of service, terms and conditions',
  },
  '/privacy-policy': {
    title: 'Privacy Policy — PDFLynx',
    description: 'Learn how PDFLynx protects your privacy and handles your data. We ensure your files are automatically deleted after 30 minutes.',
    keywords: 'PDFLynx privacy policy, data security, privacy',
  },
  '/dmca-policy': {
    title: 'DMCA Policy — PDFLynx',
    description: 'Read PDFLynx DMCA Policy. Learn how to report copyright infringement and our process for handling takedown requests.',
    keywords: 'DMCA policy, copyright infringement, takedown request, PDFLynx DMCA',
  },
  '/contact-us': {
    title: 'Contact Us — PDFLynx Support',
    description: 'Get in touch with the PDFLynx team. We are here to help with support, sales, or feedback.',
    keywords: 'contact PDFLynx, support, help, contact form',
  },
};

// ─── JSON-LD Structured Data Generators ───────────────────────────────────────

/**
 * Organization schema — appears on homepage
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description:
      'PDFLynx is a free online PDF toolkit offering 20+ professional tools to merge, split, compress, convert, protect, sign, and edit PDF documents.',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${SITE_URL}/pricing`,
    },
  };
}

/**
 * WebSite schema with SearchAction — appears on homepage
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'The complete online PDF toolkit — free, fast, and privacy-first.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Global SoftwareApplication schema for the main brand/service (appears on homepage)
 */
export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: "PDFLynx",
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Free online toolkit to merge, split, compress, and edit PDFs without watermarks or registration.',
  };
}

/**
 * BreadcrumbList schema — appears on tool pages
 */
export function generateBreadcrumbSchema(path, pageTitle) {
  const items = [
    { name: 'Home', url: SITE_URL },
  ];

  if (path && path !== '/') {
    items.push({
      name: pageTitle || formatPathToTitle(path),
      url: `${SITE_URL}${path}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * SoftwareApplication schema — appears on individual tool pages
 */
export function generateToolSchema(toolData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: toolData.name || 'PDFLynx Tool',
    description: toolData.description || '',
    url: `${SITE_URL}${toolData.path}`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: toolData.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: toolData.rating,
          ratingCount: toolData.ratingCount,
          bestRating: '5',
          worstRating: '1',
        }
      : undefined,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * Article/BlogPosting schema — appears on individual blog post pages
 */
export function generateBlogSchema(postData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: postData.title,
    description: postData.excerpt,
    datePublished: new Date(postData.date).toISOString(),
    author: {
      '@type': 'Organization',
      name: postData.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${postData.slug}`,
    },
  };
}

// ─── Tool metadata for structured data ────────────────────────────────────────
export const TOOL_SCHEMAS = {
  '/merge-pdf': { name: 'Merge PDF — PDFLynx', description: 'Combine multiple PDF files into one document online for free.', path: '/merge-pdf' },
  '/split-pdf': { name: 'Split PDF — PDFLynx', description: 'Split PDF into multiple files or extract pages.', path: '/split-pdf' },
  '/compress-pdf': { name: 'Compress PDF — PDFLynx', description: 'Reduce PDF file size without losing quality.', path: '/compress-pdf' },
  '/convert': { name: 'Convert PDF — PDFLynx', description: 'Convert PDF to Word, JPG, PNG and more.', path: '/convert' },
  '/rotate-pdf': { name: 'Rotate PDF — PDFLynx', description: 'Rotate PDF pages in any direction.', path: '/rotate-pdf' },
  '/watermark-pdf': { name: 'Watermark PDF — PDFLynx', description: 'Add custom text watermarks to PDF.', path: '/watermark-pdf' },
  '/protect-pdf': { name: 'Protect PDF — PDFLynx', description: 'Password protect your PDF with AES encryption.', path: '/protect-pdf' },
  '/unlock-pdf': { name: 'Unlock PDF — PDFLynx', description: 'Remove password protection from PDF files.', path: '/unlock-pdf' },
  '/page-numbers': { name: 'Add Page Numbers — PDFLynx', description: 'Add page numbers to PDF documents.', path: '/page-numbers' },
  '/ocr-pdf': { name: 'OCR PDF — PDFLynx', description: 'Extract text from scanned PDFs with OCR.', path: '/ocr-pdf' },
  '/sign-pdf': { name: 'Sign PDF — PDFLynx', description: 'Add digital signatures to PDF documents.', path: '/sign-pdf' },
  '/edit-pdf': { name: 'Edit PDF — PDFLynx', description: 'Edit PDF files — add text, images, and shapes.', path: '/edit-pdf' },
  '/pdf-to-text': { name: 'PDF to Text — PDFLynx', description: 'Extract text from PDF files.', path: '/pdf-to-text' },
  '/pdf-to-png': { name: 'PDF to PNG — PDFLynx', description: 'Convert PDF pages to PNG images.', path: '/pdf-to-png' },
  '/organize-pdf': { name: 'Organize PDF — PDFLynx', description: 'Reorder, delete, and duplicate PDF pages.', path: '/organize-pdf' },
  '/redact-pdf': { name: 'Redact PDF — PDFLynx', description: 'Remove sensitive content from PDFs permanently.', path: '/redact-pdf' },
  '/html-to-pdf': { name: 'HTML to PDF — PDFLynx', description: 'Convert HTML to professional PDF documents.', path: '/html-to-pdf' },
  '/image-to-pdf': { name: 'Image to PDF — PDFLynx', description: 'Convert images to PDF files.', path: '/image-to-pdf' },
  '/annotate-pdf': { name: 'Annotate PDF — PDFLynx', description: 'Add highlights, notes, and comments to PDF.', path: '/annotate-pdf' },
  '/fill-pdf-form': { name: 'Fill PDF Form — PDFLynx', description: 'Fill out PDF forms online.', path: '/fill-pdf-form' },
  '/compare-pdf': { name: 'Compare PDF — PDFLynx', description: 'Compare two PDF files side by side.', path: '/compare-pdf' },
  '/e-signature': { name: 'E-Signature — PDFLynx', description: 'Electronic signatures for PDF documents.', path: '/e-signature' },
  '/ai-summary': { name: 'AI Summary — PDFLynx', description: 'AI-powered PDF document summarization.', path: '/ai-summary' },
  '/chat-with-pdf': { name: 'Chat with PDF — PDFLynx', description: 'Ask questions about your PDF using AI.', path: '/chat-with-pdf' },
  '/smart-search': { name: 'Smart Search — PDFLynx', description: 'Semantic AI search across PDF content.', path: '/smart-search' },
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Get SEO data for a given path. Falls back to defaults.
 */
export function getPageSeo(path) {
  // Handle dynamic blog routes
  if (path.startsWith('/blog/') && path !== '/blog') {
    const slug = path.split('/blog/')[1];
    const post = blogPosts.find((p) => p.slug === slug);
    if (post) {
      return {
        title: `${post.title} | ${SITE_NAME} Blog`,
        description: post.excerpt,
        keywords: post.seoKeywords || `pdf tutorial, ${post.category.toLowerCase()}`,
      };
    }
  }

  return PAGE_SEO[path] || {
    title: `${formatPathToTitle(path)} | ${SITE_NAME}`,
    description: `Use ${SITE_NAME}'s free online PDF tools. No installation, no sign-up required.`,
    keywords: 'PDF tools, online PDF, free PDF',
  };
}

/**
 * Get structured data arrays for a given path (for injection via SEO component).
 */
export function getStructuredData(path) {
  const schemas = [];

  if (path === '/') {
    schemas.push(generateOrganizationSchema());
    schemas.push(generateWebSiteSchema());
    schemas.push(generateSoftwareApplicationSchema());
  }

  if (TOOL_SCHEMAS[path]) {
    schemas.push(generateToolSchema(TOOL_SCHEMAS[path]));
  }

  // Handle dynamic blog routes structured data
  if (path.startsWith('/blog/') && path !== '/blog') {
    const slug = path.split('/blog/')[1];
    const post = blogPosts.find((p) => p.slug === slug);
    if (post) {
      schemas.push(generateBlogSchema(post));
    }
  }

  if (path !== '/') {
    const seo = getPageSeo(path);
    schemas.push(generateBreadcrumbSchema(path, seo.title?.split(' | ')[0]?.split(' — ')[0] || formatPathToTitle(path)));
  }

  return schemas;
}

/**
 * Convert a URL path to a human-readable title.
 * e.g. "/merge-pdf" → "Merge PDF"
 */
function formatPathToTitle(path) {
  return path
    .replace(/^\//, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Pdf/g, 'PDF')
    .replace(/Ocr/g, 'OCR')
    .replace(/Html/g, 'HTML')
    .replace(/Ai/g, 'AI');
}

/**
 * All public (indexable) routes for sitemap generation
 */
export const PUBLIC_ROUTES = [
  ...Object.entries(PAGE_SEO)
    .filter(([, data]) => !data.noindex)
    .map(([path]) => path),
  ...blogPosts.map(post => `/blog/${post.slug}`)
];
