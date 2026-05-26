# ============================================
# Backend Dockerfile - Production Ready
# Multi-stage build for Express.js API
# ============================================

# Stage 1: Dependencies
# Install production dependencies only
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Builder (optional - for TypeScript compilation if needed)
# Skip if using plain JavaScript
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Stage 3: Runner
# Production image with minimal dependencies
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Set environment to production
ENV NODE_ENV=production

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY --chown=nodejs:nodejs . .

# Create necessary directories
RUN mkdir -p /app/public/photos /app/public/files /app/public/winnerPhotoes /app/logs && \
    chown -R nodejs:nodejs /app/public /app/logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "index.js"]

