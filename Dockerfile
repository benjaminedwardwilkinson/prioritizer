# Multi-stage Dockerfile for Prioritizer
# Architecture: ARM64 and x86_64 compatible
FROM node:22-slim AS builder

WORKDIR /app

# Copy dependency definitions (optional .npmrc handled via wildcard)
COPY package*.json .npmrc* ./

# Install all dependencies (including build tools)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build client assets for production
RUN npm run build

# --- Production Runtime Image ---
FROM node:22-slim AS runner

WORKDIR /app

# Install curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=8080
ENV DATA_DIR=/app/data

# Copy package manifests and install production dependencies
COPY package*.json .npmrc* ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy built frontend assets and server entrypoint
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Idempotently prepare persistent storage directory
RUN mkdir -p /app/data

# Expose internal service port
EXPOSE 8080

# Health check probes /api/health
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -fs http://localhost:${PORT:-8080}/api/health || exit 1

# Start full-stack server
CMD ["npm", "start"]
