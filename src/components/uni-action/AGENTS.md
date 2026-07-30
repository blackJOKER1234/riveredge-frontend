# 通用动作组件 (uni-action)

## 模块说明

统一动作组件，处理按钮级别的增删改查操作。

## 目录结构

```
components/uni-action/
├── index.tsx      # 主组件
├── components/    # 子组件
└── types.ts       # 类型定义
```

## 核心功能

- **按钮渲染**：根据权限渲染操作按钮
- **操作确认**：危险操作二次确认
- **加载状态**：操作中的 loading 状态

## 使用方式

```tsx
import { UniAction } from '@/components/uni-action';

<UniAction
  actions={['create', 'edit', 'delete']}
  record={record}
  onAction={handleAction}
/>
```
