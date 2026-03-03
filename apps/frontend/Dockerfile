# Build stage
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
# Install build tools just in case (e.g. for esbuild/native modules)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN pnpm install --frozen-lockfile

# Build the frontend and its workspace dependencies
# Note: VITE_ variables must be set at build time for SPAs
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm --filter frontend run build

RUN pnpm --filter frontend deploy --legacy /usr/src/app/pruned-frontend

FROM node:20-slim AS runtime
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /usr/src/app/apps/frontend
COPY --from=build /usr/src/app/pruned-frontend ./
# Copy from the dist folder as requested
COPY --from=build /usr/src/app/apps/frontend/dist ./dist/server

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000
CMD ["pnpm", "start"]
