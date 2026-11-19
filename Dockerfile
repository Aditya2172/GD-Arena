# ==========================================
# GD ARENA — UNIFIED FULL-STACK DOCKERFILE
# Single-container production deployment
# Node.js 20 Express serves both REST APIs & React SPA
# ==========================================

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install all workspace dependencies
RUN npm ci

# Copy full source tree
COPY server/ ./server/
COPY client/ ./client/

# Build client production SPA
RUN npm --prefix client run build

# Build server TypeScript code
RUN npm --prefix server run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install curl for healthcheck
RUN apk add --no-cache curl

# Non-root user setup for security hardening
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy dependencies and compiled artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/client/dist ./client/dist

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "server/dist/index.js"]
