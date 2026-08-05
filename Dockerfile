# syntax=docker/dockerfile:1

# Stage 1: 依赖安装与前端构建，避免跨阶段复制 node_modules
FROM node:22-bookworm-slim AS builder

WORKDIR /app

ARG DEPLOY_ENV=production

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV YARN_CACHE_FOLDER=/tmp/yarn-cache

RUN corepack enable \
  && corepack prepare yarn@1.22.22 --activate

COPY package.json yarn.lock ./
COPY static/patch-package ./static/patch-package
COPY scripts/sync-libredwg-wasm.mjs ./scripts/sync-libredwg-wasm.mjs

RUN --mount=type=cache,id=riveredge-yarn-cache,target=/tmp/yarn-cache \
  yarn install --frozen-lockfile --non-interactive

COPY . .

RUN yarn run vite build src --mode "$DEPLOY_ENV" && node scripts/move-dist.js

# Stage 3: nginx 运行镜像
FROM nginx:alpine AS runtime

ENV API_UPSTREAM_URL=http://127.0.0.1:8200

ARG DEPLOY_ENV=production

COPY docker/nginx/${DEPLOY_ENV}.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
