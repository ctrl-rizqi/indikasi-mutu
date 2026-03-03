# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-slim AS build

ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /usr/src/app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/frontend/ ./apps/frontend/

RUN pnpm install --frozen-lockfile

WORKDIR /usr/src/app/apps/frontend
RUN pnpm run build

# ─── Stage 2: Runtime (nginx) ─────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Salin hasil build ke nginx web root
COPY --from=build /usr/src/app/apps/frontend/dist /usr/share/nginx/html

# Konfigurasi nginx untuk SPA (redirect semua route ke index.html)
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
