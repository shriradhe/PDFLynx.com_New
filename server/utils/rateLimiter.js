const rateLimit = require('express-rate-limit');

// ─── General API rate limiter (100 req / 15 min per IP) ───────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// ─── Auth rate limiter (10 attempts / 15 min) ─────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// ─── PDF processing limiter (30 operations / hour per IP) ─────────────────────
const pdfLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Hourly PDF processing limit reached. Upgrade to Pro for unlimited processing.',
  },
});

module.exports = { generalLimiter, authLimiter, pdfLimiter };
