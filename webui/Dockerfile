# Multi-stage build: build React app with Vite, then serve via Nginx

# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (leverage Docker layer cache)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
  else npm install; fi

# Copy source
COPY . .

# Build with optional API base URL override
# Pass at build time: --build-arg VITE_API_URL=https://api.example.com
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine AS runtime

WORKDIR /usr/share/nginx/html

# Remove default static assets
RUN rm -rf ./*

# Copy build artifacts
COPY --from=build /app/dist .

# Add Nginx config for SPA routing and gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]


