# 通用详情组件 (uni-detail)

## 模块说明

统一详情页组件，展示单条记录的完整信息。

## 目录结构

```
components/uni-detail/
├── index.tsx      # 主组件
├── components/    # 子组件
└── types.ts       # 类型定义
```

## 核心功能

- **信息分组**：按业务域分组展示
- **字段渲染**：支持多种字段类型渲染
- **关联信息**：展示关联对象信息

## 使用方式

```tsx
import { UniDetail } from '@/components/uni-detail';

<UniDetail
  schema={detailSchema}
  data={record}
/>
```
