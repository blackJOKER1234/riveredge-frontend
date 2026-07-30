# 通用看板组件 (uni-dashboard)

## 模块说明

统一仪表盘组件，提供 KPI 卡片、图表、快捷入口等。

## 目录结构

```
components/uni-dashboard/
├── index.tsx          # 主组件
├── components/        # 子组件
├── hooks/             # 仪表盘专用Hooks
└── types.ts           # 类型定义
```

## 核心功能

- **KPI 卡片**：关键指标展示
- **图表集成**：折线图、柱状图、饼图
- **快捷入口**：常用功能快捷访问
- **自定义布局**：拖拽式布局配置

## 使用方式

```tsx
import { UniDashboard } from '@/components/uni-dashboard';

<UniDashboard
  widgets={dashboardWidgets}
  layout={dashboardLayout}
/>
```
