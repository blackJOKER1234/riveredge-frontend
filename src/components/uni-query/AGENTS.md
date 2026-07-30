# 通用查询组件 (uni-query)

## 模块说明

统一查询组件，提供高级筛选、快速筛选、筛选预览等功能。

## 目录结构

```
components/uni-query/
├── index.tsx          # 主组件
├── AdvancedFilters.tsx    # 高级筛选
├── QuickFilters.tsx       # 快速筛选
├── FilterCondition.tsx    # 筛选条件
├── FilterGroupItem.tsx    # 筛选组项
├── FilterPreview.tsx      # 筛选预览
├── filterUtils.ts         # 筛选工具函数
└── types.ts               # 类型定义
```

## 核心功能

- **高级筛选**：多条件组合查询
- **快速筛选**：常用筛选快捷入口
- **筛选预览**：显示当前筛选条件
- **条件组合**：支持 AND/OR 逻辑组合

## 使用方式

```tsx
import { UniQuery } from '@/components/uni-query';

// 在列表页面中使用
<UniQuery
  schema={querySchema}
  onSearch={handleSearch}
  onReset={handleReset}
/>
```

## Props

| 属性 | 类型 | 说明 |
|------|------|------|
| schema | QuerySchema | 查询schema |
| onSearch | (values) => void | 搜索回调 |
| onReset | () => void | 重置回调 |
