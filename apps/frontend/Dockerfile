# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-slim AS build

# Set environment variables for build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Enable corepack and prepare specific pnpm version to match your server (10.30.3)
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

WORKDIR /usr/src/app

# Copy workspace manifest files for better Docker layer caching
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/resource/package.json ./packages/resource/
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies with memory-efficient flags
RUN pnpm install --frozen-lockfile --aggregate-output

# Copy the source code
COPY packages/resource ./packages/resource
COPY apps/frontend ./apps/frontend

# Build arguments for Vite
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

# Build the frontend application in production mode
WORKDIR /usr/src/app/apps/frontend
RUN pnpm run build

# ─── Stage 2: Runtime (nginx) ─────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Copy build results from the build stage
COPY --from=build /usr/src/app/apps/frontend/dist /usr/share/nginx/html

# Copy nginx configuration for SPA
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
