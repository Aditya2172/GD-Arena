# ==========================================
# GD ARENA — BACKEND DOCKERFILE
# Multi-Stage Production Build
# ==========================================

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and server package configs
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --workspace=gd-arena-server

# Copy server source code and tsconfig
COPY server/tsconfig.json ./server/
COPY server/src ./server/src

# Compile TypeScript
RUN npm --prefix server run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install curl for docker healthcheck
RUN apk add --no-cache curl

# Create non-root system group and user for security compliance
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy dependencies and compiled javascript from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/package.json

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "server/dist/index.js"]
