# ─── Stage 1: Base ────────────────────────────────────────────────────────────
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM base AS build

ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /usr/src/app

# Salin file workspace root terlebih dahulu
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/

# Salin frontend package
COPY apps/frontend/ ./apps/frontend/

# Install semua dependencies
RUN pnpm install --frozen-lockfile

# Build frontend
WORKDIR /usr/src/app/apps/frontend
RUN pnpm run build

# ─── Stage 3: Runtime ─────────────────────────────────────────────────────────
FROM base AS runtime

WORKDIR /usr/src/app

# Salin node_modules dari build stage (sudah lengkap termasuk deps SSR)
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=build /usr/src/app/packages ./packages

# Salin hasil build dan server adapter
COPY --from=build /usr/src/app/apps/frontend/dist ./apps/frontend/dist
COPY apps/frontend/server.mjs ./apps/frontend/server.mjs
COPY apps/frontend/package.json ./apps/frontend/package.json

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /usr/src/app/apps/frontend

EXPOSE 3000

CMD ["node", "server.mjs"]

