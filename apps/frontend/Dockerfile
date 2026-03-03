# ─── Stage 1: Base ────────────────────────────────────────────────────────────
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM base AS build

ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

COPY . /usr/src/app
WORKDIR /usr/src/app

# Install semua dependencies workspace
RUN pnpm install --frozen-lockfile

# Build frontend beserta workspace dependencies-nya
RUN pnpm --filter frontend run build

# Prune hanya yang dibutuhkan untuk production
RUN pnpm --filter frontend deploy --legacy /usr/src/app/pruned

# ─── Stage 3: Runtime ─────────────────────────────────────────────────────────
FROM base AS runtime

WORKDIR /usr/src/app

# Salin hasil pruned (node_modules + dist) dari stage build
COPY --from=build /usr/src/app/pruned ./

# Salin hasil build dist
COPY --from=build /usr/src/app/apps/frontend/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/server/server.js"]
