# RiverEdge Frontend

## 项目概览
RiverEdge 前端单体仓库，基于 React + TypeScript + Ant Design 的企业级管理平台。
包含多个业务子应用（kuaizhizao、kuaicaiwu、kuaiai、kuaiplm、kuaireport、kuaiiot、haoligo、master-data）以及共享的核心基础设施。

## 技术栈
- **框架**: React 18+， TypeScript
- **UI 库**: Ant Design 5.x (ProComponents)
- **状态管理**: Zustand (stores/)
- **路由**: React Router v6
- **国际化**: 自建 i18n 方案 (locales/)，支持 zh-CN/en-US/ja-JP/vi-VN/zh-Hant
- **构建**: Vite
- **HTTP 客户端**: Axios (services/)
- **CSS**: Less / CSS Modules

## 代码规范
- TypeScript 严格模式，优先使用 interface 而非 type
- 组件采用函数式组件 + Hooks
- 文件名使用 camelCase，组件文件使用 PascalCase
- 国际化文本统一通过 locales/ 管理，禁止硬编码
- API 调用统一封装在 services/ 中，禁止直接在组件中调用 axios
- 路由配置统一在 routes/ 中管理

## 目录结构

```
src/
├── apps/           # 业务子应用（每个子应用独立目录）
│   ├── kuaizhizao  # 快制造
│   ├── kuaicaiwu   # 快财务
│   ├── kuaiai      # 快AI
│   ├── kuaiplm     # 快PLM
│   ├── kuaireport  # 快报表
│   ├── kuaiiot     # 快IoT
│   ├── haoligo     # 好立购
│   └── master-data # 主数据
├── assets/         # 静态资源（字体、社交图标）
├── components/     # 全局共享组件
├── config/         # 全局配置（编码规则、权限模块、打印模板等）
├── constants/      # 全局常量
├── core/           # 核心基础设施
├── hooks/          # 全局共享 Hooks
├── layouts/        # 布局组件
├── locales/        # 国际化语言包
├── pages/          # 全局页面（登录、锁屏、系统设置等）
├── routes/         # 路由配置
├── services/       # API 服务层
├── stores/         # 全局状态管理
├── styles/         # 全局样式
├── theme/          # 主题配置（HMI 主题等）
├── types/          # 全局类型定义
└── utils/          # 工具函数
```

## Agent 工作指南
1. **新功能开发**: 先在对应的子应用或 components 目录下工作，共享逻辑提取到 utils/ 或 hooks/
2. **API 调用**: 优先在 services/ 中查找现有 API，没有则添加
3. **国际化**: 所有用户可见文本必须通过 locales/，先在 zh-CN.ts 添加翻译 key，再补充其他语言
4. **样式**: 使用 Less 变量和主题 token，避免硬编码颜色值
5. **类型定义**: 全局类型放在 types/，模块内部类型就近定义
6. **路由**: 新页面先在 routes/ 注册，子应用路由在各自 manifests 中配置
7. **状态管理**: 优先使用 Zustand stores，避免 prop drilling
8. **权限**: 通过 permission.ts 或 useResourcePermissions hook 控制

## 回复语言
必须中文回复

## Team 与 Agent 调用
- 复杂任务应拆分为子任务并行处理
- 探索型任务优先通过子 Agent 处理
- 使用 spawn_agent 工具分配独立模块的任务

## Agent 调用规则
- 优先使用 haiku 或 deepseek-v4-flash 模型进行工具调用
- 探索型任务与子 agent 优先使用 haiku 或 deepseek-v4-flash 模型
