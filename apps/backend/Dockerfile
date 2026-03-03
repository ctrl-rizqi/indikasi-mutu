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
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Generate Prisma client
WORKDIR /usr/src/app/apps/backend
RUN pnpm db:generate

# Build the backend and its workspace dependencies
WORKDIR /usr/src/app
RUN pnpm run build --filter @repo/backend...

FROM base AS runtime
WORKDIR /usr/src/app

# Copy necessary files from build stage
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /usr/src/app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /usr/src/app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /usr/src/app/apps/backend/dist ./apps/backend/dist
COPY --from=build /usr/src/app/apps/backend/prisma ./apps/backend/prisma
COPY --from=build /usr/src/app/packages/resource ./packages/resource

# Install only production dependencies
# bcrypt and other native modules need to be rebuilt for the runtime image
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && pnpm install --prod --frozen-lockfile \
    && apt-get purge -y python3 make g++ \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app/apps/backend
EXPOSE 5000

# Script to run migrations and start
CMD ["sh", "-c", "pnpm db:push && pnpm start"]
