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

# Copy ALL workspace files for building
COPY . .

# Install ALL dependencies
RUN pnpm install --frozen-lockfile --aggregate-output

# Generate Prisma client & Build
WORKDIR /usr/src/app/apps/backend
RUN pnpm db:generate
RUN pnpm run build

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:20-slim AS runtime

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

WORKDIR /usr/src/app

# Copy workspace manifest files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/resource/package.json ./packages/resource/
COPY apps/backend/package.json ./apps/backend/

# Copy built code
COPY --from=build /usr/src/app/packages/resource ./packages/resource
COPY --from=build /usr/src/app/apps/backend/dist ./apps/backend/dist
COPY --from=build /usr/src/app/apps/backend/prisma ./apps/backend/prisma
COPY --from=build /usr/src/app/apps/backend/prisma.config.ts ./apps/backend/

# Install only production dependencies
# This handles the workspace packages correctly without broken symlinks
RUN pnpm install --prod --frozen-lockfile --aggregate-output

# Work inside the backend folder for CMD
WORKDIR /usr/src/app/apps/backend

EXPOSE 5000

# Using npx to ensure we find the prisma binary in the pruned node_modules
CMD ["sh", "-c", "npx prisma db push --config prisma.config.ts && node dist/index.js"]
