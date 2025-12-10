# Multi-stage build for ddr-public React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY ddr-public/package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY ddr-public/ .

# Build for production (no base path - served from root domain)
RUN npm run build

# Production stage - nginx to serve static files
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY ddr-public/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
