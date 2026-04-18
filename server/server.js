// Load .env but do NOT override variables already set by docker-compose (or the OS)
require('dotenv').config({ override: false });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const connectDB = require('./config/db');
const validateEnv = require('./utils/envValidator');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const batchRoutes = require('./routes/batchRoutes');
const previewRoutes = require('./routes/previewRoutes');
const compareRoutes = require('./routes/compareRoutes');
const signatureRoutes = require('./routes/signatureRoutes');
const aiRoutes = require('./routes/aiRoutes');
const seoRoutes = require('./routes/seoRoutes');
const seoApiRoutes = require('./routes/seoApiRoutes');
const { startCleanupScheduler, cleanDirectory } = require('./utils/fileHelper');
const { generalLimiter } = require('./utils/rateLimiter');
const { initQueue, initWorker, closeQueue } = require('./services/queueService');
const { initEmail } = require('./services/emailService');
const { errorHandler } = require('./middleware/errorHandler');
const { seoHeaders, canonicalRedirect, cacheControl } = require('./middleware/seoMiddleware');

const app = express();

// ─── Trust Proxy (for rate limiting behind reverse proxy) ─────────────────
app.set('trust proxy', 1);

// ─── Validate Environment ─────────────────────────────────────────────────────
validateEnv();

// ─── Connect to Database ───────────────────────────────────────────────────────
connectDB();

// ─── Initialize Queue System ──────────────────────────────────────────────────
initQueue();
initWorker();

// ─── Initialize Email Service ─────────────────────────────────────────────────
initEmail();

// ─── Ensure Upload/Output Directories Exist ───────────────────────────────────
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
const outputDir = path.join(__dirname, process.env.OUTPUT_DIR || 'outputs');
[uploadDir, outputDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── Compression Middleware (gzip/brotli) ─────────────────────────────────────
app.use(compression({
  level: 6,
  threshold: 1024, // only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// ─── SEO Middleware ───────────────────────────────────────────────────────────
app.use(canonicalRedirect);
app.use(seoHeaders);
app.use(cacheControl);

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{nonce}'", 'https://www.googletagmanager.com', 'https://www.google-analytics.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://www.google-analytics.com'],
      connectSrc: ["'self'", 'https://www.google-analytics.com', 'https://analytics.google.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
}));

// ─── CORS Configuration ───────────────────────────────────────────────────────
const buildAllowedOrigins = () => {
  if (process.env.NODE_ENV !== 'production') {
    return ['http://localhost:5173', 'http://localhost:3000'];
  }
  const origins = (process.env.CLIENT_URL || 'https://pdflynx.com')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  // Also allow www. variant automatically
  const withWww = [];
  origins.forEach((origin) => {
    withWww.push(origin);
    try {
      const url = new URL(origin);
      if (!url.hostname.startsWith('www.')) {
        withWww.push(`${url.protocol}//www.${url.hostname}`);
      }
    } catch (_) {}
  });
  return [...new Set(withWww)];
};

const allowedOrigins = buildAllowedOrigins();
if (process.env.NODE_ENV !== 'production') {
  console.log('[CORS] Allowed origins:', allowedOrigins);
}


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
  })
);

// ─── CSRF Protection ────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  next();
});

// ─── General Middleware ────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(generalLimiter);

// ─── Request ID ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// ─── Response Time Header ─────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  const originalEnd = res.end.bind(res);
  res.end = function (...args) {
    const ns = Number(process.hrtime.bigint() - start);
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${(ns / 1e6).toFixed(2)}ms`);
    }
    return originalEnd(...args);
  };
  next();
});

// ─── Static Files (processed outputs) ─────────────────────────────────────────
app.use('/outputs', (req, res, next) => {
  const safeName = path.basename(decodeURIComponent(req.path));
  const requestedPath = req.path.replace(/^\//, '');

  if (safeName !== requestedPath || !/^[a-zA-Z0-9_\-\.]+\.(pdf|txt|zip|jpg|jpeg|png|docx)$/i.test(safeName)) {
    logger.warn(`Path traversal attempt blocked: ${req.path}`);
    return res.status(400).json({ success: false, message: 'Invalid file path.' });
  }

  // Set Content-Disposition for safe file serving
  const ext = path.extname(safeName).toLowerCase();
  const inlineTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
  if (inlineTypes.includes(ext)) {
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
  } else {
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
  }
  // Prevent XSS for SVG/HTML-like content
  res.setHeader('X-Content-Type-Options', 'nosniff');

  req.sanitizedFilename = safeName;
  next();
}, express.static(outputDir));

// ─── SEO Routes (before API routes for priority) ─────────────────────────────
app.use('/', seoRoutes);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/batch', batchRoutes);
app.use('/api/preview', previewRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/signature', signatureRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/seo', seoApiRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler (centralized) ──────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`PDFLynx Server running on http://localhost:${PORT}`);
  logger.info(`Uploads dir: ${uploadDir}`);
  logger.info(`Outputs dir: ${outputDir}`);
  startCleanupScheduler();
});

// ─── WebSocket Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  logger.info(`WebSocket client connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    logger.info(`Client ${socket.id} joined room: ${roomId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`WebSocket client disconnected: ${socket.id}`);
  });
});

module.exports = { app, io };

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received. Starting graceful shutdown...`);

  const shutdownTimeout = setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);

  try {
    server.close(async () => {
      logger.info('HTTP server closed.');

      try {
        await cleanDirectory(uploadDir);
        await cleanDirectory(outputDir);
        logger.info('Temporary files cleaned up.');
      } catch (err) {
        logger.error('Error during cleanup:', err.message);
      }

      try {
        await require('mongoose').connection.close();
        logger.info('MongoDB connection closed.');
      } catch (err) {
        logger.error('Error closing MongoDB connection:', err.message);
      }

      try {
        await closeQueue();
        logger.info('Queue system closed.');
      } catch (err) {
        logger.error('Error closing queue:', err.message);
      }

      clearTimeout(shutdownTimeout);
      process.exit(0);
    });
  } catch (err) {
    logger.error('Error during shutdown:', err.message);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ─── Global Uncaught Exception Handler ─────────────────────────────────
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  logger.error('Stack:', err.stack);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
