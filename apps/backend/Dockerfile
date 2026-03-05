# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-slim AS build

# Set environment variables for pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Enable corepack and prepare specific pnpm version to match your server (10.30.3)
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

# Install build tools for native modules like bcrypt
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy workspace manifest files for better Docker layer caching
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/resource/package.json ./packages/resource/
COPY apps/backend/package.json ./apps/backend/

# Install dependencies with memory-efficient flags
RUN pnpm install --frozen-lockfile --aggregate-output

# Copy source code and Prisma schema
COPY packages/resource ./packages/resource
COPY apps/backend ./apps/backend

# Generate Prisma client
WORKDIR /usr/src/app/apps/backend
RUN pnpm db:generate

# Build the backend
RUN pnpm run build

# Prune dependencies for production
RUN pnpm --filter @repo/backend --prod deploy --legacy /usr/src/app/pruned

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:20-slim AS runtime

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

WORKDIR /usr/src/app/apps/backend

# Copy pruned dependencies and build results
COPY --from=build /usr/src/app/pruned ./
COPY --from=build /usr/src/app/apps/backend/prisma ./prisma
COPY --from=build /usr/src/app/apps/backend/src/generated ./src/generated
COPY --from=build /usr/src/app/apps/backend/prisma.config.ts ./

EXPOSE 5000

# Using npx to ensure we find the prisma binary in the pruned node_modules
CMD ["sh", "-c", "npx prisma db push --config prisma.config.ts && node dist/index.js"]
