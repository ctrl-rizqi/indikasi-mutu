FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
# Install build tools for native modules like bcrypt
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN pnpm install --frozen-lockfile

# Generate Prisma client
WORKDIR /usr/src/app/apps/backend
RUN pnpm db:generate

# Build the backend and its workspace dependencies
WORKDIR /usr/src/app
RUN pnpm --filter @repo/backend run build

RUN pnpm --filter @repo/backend deploy --legacy /usr/src/app/pruned

FROM base AS runtime
WORKDIR /usr/src/app/apps/backend
COPY --from=build /usr/src/app/pruned ./
EXPOSE 5000
CMD ["sh", "-c", "pnpm db:generate && pnpm db:push && pnpm start"]
