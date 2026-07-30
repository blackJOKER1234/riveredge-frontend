# RiverEdge Frontend

## 项目概述

多租户 SaaS 工业平台前端（React 18 + TypeScript + Vite），支持多个业务应用模块。

## 技术栈

- React 18.3.1 + TypeScript
- Vite 构建工具
- Ant Design 组件库
- React Router v6 路由
- Zustand 状态管理
- React Query 数据请求
- i18next 国际化

## 开发规范

### 代码风格

- 使用 ESLint + Prettier 格式化
- 组件文件使用 `.tsx`，工具函数使用 `.ts`
- 组件采用函数式组件 + Hooks
- 样式优先使用 CSS Modules 或 Ant Design token

### 目录结构

```
src/
├── apps/          # 业务应用模块（haoligo, kuaizhizao 等）
├── components/    # 通用组件库（uni-* 系列）
├── core/          # 核心模块
├── hooks/         # 自定义 Hooks
├── pages/         # 页面组件
│   ├── system/    # 系统管理页面（49个功能模块）
│   └── login/     # 认证页面
├── services/      # API 服务层
├── stores/        # Zustand 状态
├── routes/        # 路由配置
├── theme/         # 主题配置
├── utils/         # 工具函数
├── locales/       # 国际化资源
└── types/         # TypeScript 类型定义
```

### 常用命令

```bash
# 安装依赖
yarn install

# 开发模式
yarn dev

# 生产构建
yarn build

# 类型检查
yarn type-check

# ESLint 检查
yarn lint
```

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

## API 层

- 服务层位于 `src/services/`
- 每个业务域对应一个服务文件（如 `user.ts`, `tenant.ts`）
- 使用统一 API 客户端封装
- 后端 API 前缀：`/api/v1/`

## 注意事项

- 公共组件在 `components/` 下，业务组件在对应 `apps/*/components/` 下
- 系统管理页面在 `pages/system/` 下，按功能域分目录
- 移动端适配在 `components/touch-*` 系列组件中
- 打印功能在 `components/print/` 下实现
