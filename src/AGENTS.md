# 共享核心模块 (src/)

## 模块说明
src/ 是项目的共享核心层，包含所有子应用共用的基础设施、组件、工具和配置。

## 子目录职责

### components/
全局共享的 UI 组件库。按功能拆分独立子目录，每个子目录包含组件源码、类型定义和样式。
- **通用组件**: common/、dictionary-label/、dictionary-select/ 等
- **业务组件**: uni-* 系列（uni-table、uni-detail、uni-query 等）
- **特色组件**: EnhancedHelpSystem、kanban-board、touch-keyboard、virtual-list 等
- **AI 相关**: ai-assistant/、go-live-assistant/

编写规范：
- 每个组件独立目录，入口文件 index.tsx
- 使用 CSS Modules 或 styled-components 管理样式
- 导出命名组件和默认组件
- 复杂组件需附带类型定义

### config/
全局配置项，不包含业务逻辑。
- 编码规则页面映射、权限模块定义、打印模板 schema、i18n 配置、dayjs 配置

### hooks/
全局共享的 React Hooks。
- 不允许引入子应用特定的逻辑
- 与业务相关的 hooks（如 useDocumentCapabilities）保持通用性

### services/
API 服务层，封装所有后端接口调用。
- 基于 Axios，统一错误处理和鉴权
- 每个领域一个文件（user.ts、menu.ts、permission.ts 等）
- 新增 API 前先在此查找是否已有封装

### stores/
全局状态管理（Zustand）。
- themeStore、configStore、globalStore 等全局状态
- 业务状态优先放在子应用内部

### utils/
纯工具函数，无副作用。
- 严禁引入 React 或组件代码
- 按功能拆分文件，避免大文件
- generated/ 目录下为自动生成代码，不要手动编辑

### locales/
国际化语言包。
- zh-CN.ts / en-US.ts / ja-JP.ts / vi-VN.ts / zh-Hant.ts
- login 独立包（xxx.login.ts）
- generated/ 下为自动生成，勿手动编辑
- 新增 key 时在所有语言文件中同步添加

### routes/
应用路由配置。
- AppRoutes.tsx: 主应用路由
- SystemRoutes.tsx: 系统设置路由

### layouts/
布局组件。
- BasicLayout.tsx: 主布局（包含侧边栏、顶栏、内容区）

### pages/
全局页面（非子应用页面）。
- 登录、锁屏、404、系统设置、个性化设置、初始化向导等

### theme/
主题系统。
- hmi/ 目录下为 HMI（人机界面）主题配置

### types/
全局 TypeScript 类型定义。

### styles/
全局样式文件（Less/CSS）。

## 开发约束
1. 共享模块不应依赖任何子应用（apps/）的代码
2. 组件库保持通用性，业务特定逻辑通过 props 或 slots 注入
3. API 层统一异常处理，错误信息通过 locales 管理
4. 状态管理保持扁平化，避免深层嵌套
