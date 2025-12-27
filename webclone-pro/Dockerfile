# WebClone Pro - Production-Optimized Multi-Stage Dockerfile
# Secure, minimal image with health checks and non-root user

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Development Dependencies & Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy application source
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the application
RUN npm run build && \
    npm prune --production

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy public assets
COPY --from=builder /app/public ./public

# Copy production build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy configuration files
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/tmp /app/.next/cache && \
    chown -R nextjs:nodejs /app/logs /app/tmp /app/.next/cache

# Security: Drop all capabilities
USER nextjs

# Expose application port
EXPOSE 3000

# Environment configuration
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { \
    let data = ''; \
    res.on('data', (chunk) => data += chunk); \
    res.on('end', () => { \
      try { \
        const health = JSON.parse(data); \
        process.exit(health.status === 'healthy' ? 0 : 1); \
      } catch { \
        process.exit(1); \
      } \
    }); \
  }).on('error', () => process.exit(1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the production server
CMD ["node", "server.js"]