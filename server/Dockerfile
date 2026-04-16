# ── Builder stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install build tools for native modules (canvas, sharp, muhammara)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev

WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force

# ── Runner stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Install runtime dependencies + Ghostscript for PDF compression
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    librsvg \
    pixman \
    ghostscript \
    tini \
    wget

# Create non-root user before copying files
RUN addgroup -g 1001 -S nodejs && adduser -S pdflynx -u 1001

WORKDIR /app

# Copy production dependencies from builder
COPY --from=builder --chown=pdflynx:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=pdflynx:nodejs . .

# Create required directories
RUN mkdir -p uploads outputs logs && chown -R pdflynx:nodejs uploads outputs logs

# Switch to non-root user
USER pdflynx

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Use tini as init process for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
