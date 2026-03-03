# Build stage
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter frontend run build

# Runtime stage
FROM node:20-slim AS runtime
WORKDIR /usr/src/app

# Di monorepo, kita butuh node_modules dan package.json dari root dan app
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy app files
COPY --from=build /usr/src/app/apps/frontend ./apps/frontend
COPY --from=build /usr/src/app/packages/resource ./packages/resource

WORKDIR /usr/src/app/apps/frontend

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000
# Langsung jalankan file-nya
CMD ["node", "dist/server/server.js"]
