# ==========================================
# GD ARENA — FRONTEND DOCKERFILE
# Multi-Stage Build: Node.js -> Nginx Alpine
# ==========================================

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and client package configs
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --workspace=gd-arena-client

# Copy client source code, assets, and config
COPY client/tsconfig*.json ./client/
COPY client/vite.config.ts ./client/
COPY client/tailwind.config.js ./client/
COPY client/postcss.config.js ./client/
COPY client/index.html ./client/
COPY client/src ./client/src

# Build client production bundles
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm --prefix client run build

# Stage 2: Production Nginx Server
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
