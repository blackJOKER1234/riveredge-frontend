# Docker 部署

## 构建前端

```bash
yarn build:development
yarn build:staging
yarn build:production
```

## 构建镜像

`DEPLOY_ENV` 可选值为 `development`、`staging`、`production`，默认使用 `production`。

```bash
docker build --build-arg DEPLOY_ENV=staging -t riveredge-frontend:staging .
docker build --build-arg DEPLOY_ENV=production -t riveredge-frontend:production .
```

## 启动容器

`API_UPSTREAM_URL` 是容器运行时的后端地址，不会被打包进前端资源，默认值为 `https://kuaigeyun.com`。使用外部环境变量覆盖时不要添加末尾 `/`，以确保 Nginx 转发时保留 `/api/...` 原始路径。

```bash
docker run --rm \
  -e API_UPSTREAM_URL=http://staging-backend:8200 \
  -p 8080:80 \
  riveredge-frontend:staging
```

生产环境示例：

```bash
docker run -d --name riveredge-frontend \
  --restart unless-stopped \
  -e API_UPSTREAM_URL=http://backend:8200 \
  -p 80:80 \
  riveredge-frontend:production
```

## 开发环境（Docker Compose）

```bash
cd docker
docker compose -f docker-compose.dev.yml up -d --build
```

开发环境后端默认仍为 `https://kuaigeyun.com`；如需覆盖，通过 `API_UPSTREAM_URL` 传入，注意不要添加末尾 `/`。默认映射宿主机 `8080` 端口，可用 `FRONTEND_PORT` 覆盖：

```bash
cd docker
API_UPSTREAM_URL=https://kuaigeyun.com FRONTEND_PORT=8081 docker compose -f docker-compose.dev.yml up -d --build
```

访问地址：`http://localhost:8080`。Compose 会以 `DEPLOY_ENV=development` 构建镜像，并使用 `docker/nginx/development.conf.template`（静态资源 `no-store`，便于开发联调）。
