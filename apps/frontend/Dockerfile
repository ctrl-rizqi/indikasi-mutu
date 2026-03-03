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
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build the frontend and its workspace dependencies
# Note: VITE_ variables must be set at build time for SPAs
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm run build --filter frontend...

# Runtime stage (Nginx)
FROM nginx:alpine AS runtime
COPY --from=build /usr/src/app/apps/frontend/dist /usr/share/nginx/html

# SPA Nginx config
RUN printf 'server {\n\
    listen 80;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
