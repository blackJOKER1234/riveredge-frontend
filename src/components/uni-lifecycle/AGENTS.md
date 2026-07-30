# 通用生命周期组件 (uni-lifecycle)

## 模块说明

统一生命周期管理组件，处理记录的创建、编辑、删除等状态。

## 目录结构

```
components/uni-lifecycle/
├── index.tsx          # 主组件
├── components/        # 子组件
├── hooks/             # 生命周期Hooks
└── types.ts           # 类型定义
```

## 核心功能

- **状态管理**：记录的生命周期状态
- **版本控制**：历史版本记录
- **变更追踪**：字段变更历史

## 使用方式

```tsx
import { UniLifecycle } from '@/components/uni-lifecycle';

<UniLifecycle
  status={record.status}
  history={record.history}
  onStatusChange={handleStatusChange}
/>
```
