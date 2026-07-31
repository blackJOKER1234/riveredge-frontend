# RiverEdge Frontend

## 全局 Agent 规范

以下规范对本目录及其子目录的所有 Agent 强制生效，优先级高于本文件其余内容。

### 回复语言与交互规范

1. 语言要求：全程使用简体中文回复；除代码片段、专有名词、引用原文外，默认不使用英文输出。
2. 需求回显（绝对强制，不得跳过）：每次用户输入后，首先输出需求回显区块，然后才能执行任何工具或读取任何文件。回显需按主题分类整理为清晰要点，并追加“我已了解规则”。
3. 输入纠错：能确定的输入问题自动修正；语义模糊、逻辑冲突、缺少关键信息或可能导致严重后果时，禁止猜测，必须向用户反问确认。
4. 询问机制：
   - 必须询问：语义模糊、逻辑冲突、重大技术决策（如框架选型、架构方案）。
   - 禁止询问：版本号、依赖库等可从项目文件自主获取的信息；明显可推断的同音字错误。

### 网页搜索

- `web_search` 失效时，改用 `ddg-search` MCP 进行搜索。

### Team 与 Agent 调用

- 探索型任务优先通过子 Agent 处理。
- 工具调用优先使用 haiku 模型；探索型任务与子 Agent 优先使用 haiku 或 `deepseek-v4-flash` 模型。

## 项目概述

多租户 SaaS 工业平台前端（React 18 + TypeScript + Vite），采用系统层与应用层隔离架构，支持多个业务应用模块。

## 技术栈

- React 18.3.1 + TypeScript（仓库同时管理 TS 6 与原生 TS 7 包）
- Vite 8 构建工具
- Ant Design 6 + ProComponents
- React Router v6 路由
- Zustand 5 状态管理
- TanStack React Query 5 数据请求
- i18next 国际化
- Tailwind CSS 4 + Less + antd-style
- Formily、Three.js、Univer 等按业务场景使用

## Agent 行为约束

- 当 8100 端口已有 dev server 运行时，禁止 Codex/Agent 自行新开 dev server（`yarn dev`、`npm run dev`、`vite`），不得自动改用 8101 等其他端口启动副本。
- 需要验证页面时复用用户已启动的 8100 服务；确需新开服务时，必须先征得用户明确同意，并在完成后清理进程。
- 禁止留下后台 Node 进程、额外端口监听或孤儿进程。

## 开发规范

### 代码风格

- 使用 ESLint + Prettier 格式化
- 组件文件使用 `.tsx`，工具函数使用 `.ts`
- 组件采用函数式组件 + Hooks
- 样式优先使用 Tailwind CSS、Ant Design token 或 Less；样式文件按目录就近维护

### 目录结构

```
src/
├── ant-design/    # 自定义 Ant Design 主题/组件覆盖
├── apps/          # 业务应用模块（haoligo, kuaizhizao 等）
├── assets/        # 静态资源
├── components/    # 通用组件库（uni-* 系列等）
├── config/        # 应用配置
├── constants/     # 全局常量
├── core/          # 核心模块
├── hooks/         # 自定义 Hooks
├── layouts/       # 布局组件（BasicLayout 等）
├── locales/       # 国际化资源
├── pages/         # 页面组件
│   ├── system/    # 系统管理页面（49 个功能模块）
│   └── login/     # 认证页面
├── routes/        # 路由配置
├── services/      # API 服务层
├── stores/        # Zustand 状态
├── styles/        # 全局样式
├── theme/         # 主题配置
├── types/         # TypeScript 类型定义
└── utils/         # 工具函数
```

### 常用命令

```bash
# 安装依赖
yarn install

# 开发模式（监听 0.0.0.0）
yarn dev

# 单体模式开发
yarn dev:monolithic

# 生产构建（构建后移动 dist）
yarn build

# 不移动 dist 的生产构建
yarn build:no-move

# 16G 内存构建
yarn build:16g

# 清理依赖
yarn clean

# 扫描行操作类型
yarn scan:row-action-kind
```

注：当前 `package.json` 未配置 `type-check` / `lint` 脚本，需要类型检查时使用 `npx tsc --noEmit --skipLibCheck`，并按文件范围过滤输出。

## 业务模块

| 模块 | 说明 |
|------|------|
| `apps/haoligo` | 好力GO应用 |
| `apps/kuaizhizao` | 快制造 |
| `apps/kuaicaiwu` | 快财务 |
| `apps/kuaiplm` | 快PLM |
| `apps/kuaireport` | 快报表 |
| `apps/kuaiai` | 快AI |
| `apps/kuaiiot` | 快IoT |
| `apps/master-data` | 主数据管理 |
| `pages/system` | 系统管理（租户、用户、角色、权限等） |

## 架构要点

- 路由采用系统层（`SystemRoutes`）与应用层（`AppRoutes`）完全隔离：系统核心功能不依赖应用加载，应用加载失败不影响系统。
- `BasicLayout` 提升到主路由层级统一管理，系统级与应用级路由共享同一个布局实例。
- 应用路由通过 `loadPlugin` 按需加载，由已安装应用列表驱动。
- 布局壳层唯一路由入口是 `src/routes/index.tsx` 默认导入的 `BasicLayout`。

## API 层

- 服务层位于 `src/services/`，每个业务域对应一个服务文件（如 `user.ts`、`tenant.ts`）。
- 统一使用 `src/services/api.ts` 的 `apiRequest`（Fetch 封装）及 `api` 便捷对象（`get/post/put/delete/patch`）。
- 后端 API 前缀：`/api/v1/`。
- 统一处理：Token/租户头注入、公开接口豁免、网络错误与服务端错误、Token 刷新重试、活动时间与挂起请求计数。

## 注意事项

- 公共组件在 `components/` 下，业务组件在对应 `apps/*/components/` 下。
- 系统管理页面在 `pages/system/` 下，按功能域分目录。
- 移动端适配在 `components/touch-*` 系列组件中。
- 打印功能在 `components/print/` 下实现。
- `@/*` 别名已在 tsconfig/vite 中配置，但多数模块习惯使用相对路径导入。
