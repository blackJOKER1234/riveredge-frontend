# 业务子应用 (src/apps/)

## 模块说明
apps/ 下每个子目录对应一个独立业务子应用，遵循微前端架构。
子应用可拥有自己的 components、pages、services、hooks、utils、constants、types、schemas 等目录结构。

## 子应用列表

| 目录 | 名称 | 描述 |
|------|------|------|
| kuaizhizao | 快制造 | 制造执行管理 |
| kuaicaiwu | 快财务 | 财务管理 |
| kuaiai | 快AI | AI 相关功能 |
| kuaiplm | 快PLM | 产品生命周期管理 |
| kuaireport | 快报表 | 报表系统 |
| kuaiiot | 快IoT | 物联网 |
| haoligo | 好立购 | 采购商城 |
| master-data | 主数据 | 主数据管理 |

## 共同结构规范
每个子应用应包含以下结构（按需）：
- `index.tsx`: 子应用入口，导出路由和菜单配置
- `manifest.json`: 子应用清单（名称、版本、依赖等）
- `components/`: 子应用专用组件
- `pages/`: 子应用页面
- `services/`: 子应用 API 服务
- `hooks/`: 子应用专用 Hooks
- `utils/`: 子应用工具函数
- `types/`: 子应用类型定义
- `constants/`: 子应用常量
- `schemas/`: 子应用数据 schema

## 开发约束
1. 子应用之间禁止互相依赖，共享逻辑放到 src/ 下的共享模块
2. 每个子应用有独立的 manifest.json，定义自己的路由前缀和权限
3. 子应用样式使用 CSS Modules 避免冲突
4. 子应用通过 index.tsx 暴露给主应用加载
5. 国际化 key 建议以子应用名称为前缀
