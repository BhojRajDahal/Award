# ============================================
# Frontend Dockerfile - Production Ready
# Multi-stage build for Next.js with Nginx
# ============================================

# Stage 1: Dependencies
# Install all dependencies needed for building
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm (faster and more efficient than npm)
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install dependencies
# Use --no-frozen-lockfile if lockfile is outdated, otherwise use frozen-lockfile
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --frozen-lockfile || pnpm install; \
    else \
      pnpm install; \
    fi

# Stage 2: Builder
# Build the Next.js application
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
# Using standalone output for smaller production image
RUN pnpm build

# Stage 3: Runner (Node.js + Nginx)
# Run Next.js standalone server with Nginx as reverse proxy
FROM node:20-alpine AS runner
WORKDIR /app

# Default runtime environment (can be overridden at runtime)
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Install Nginx, supervisor, and wget for health checks
RUN apk add --no-cache nginx supervisor wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application from builder (standalone mode)
# Note: Next.js standalone output requires output: 'standalone' in next.config.mjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy custom Nginx configuration to http.d (included inside http block)
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create necessary directories
RUN mkdir -p /var/log/nginx /var/log/supervisor /run/nginx /etc/supervisor/conf.d && \
    chown -R nextjs:nodejs /app && \
    chown -R nginx:nginx /var/log/nginx /run/nginx && \
    chmod -R 755 /app && \
    chmod 755 /var/log/supervisor

# Switch to non-root user for Next.js
USER nextjs

# Expose port 3000 (Next.js) and 80 (Nginx)
EXPOSE 3000 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start both Next.js and Nginx with supervisor
# Note: Supervisor needs to run as root, so we'll handle this differently
# Alternative: Use a startup script that runs both processes
USER root
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
