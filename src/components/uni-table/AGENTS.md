# 通用表格组件 (uni-table)

## 模块说明

统一数据表格组件，基于 ProTable 封装，提供列表展示、数据筛选、批量操作等功能。

## 目录结构

```
components/uni-table/
├── index.tsx                  # 主组件
├── stackedPrimaryColumn.tsx   # 堆叠主列
└── uniTableScrollPolicy.ts    # 滚动策略
```

## 核心功能

- **数据展示**：分页列表、排序、筛选
- **批量操作**：多选、批量删除、批量审批
- **列配置**：可配置列显示、列宽、冻结
- **导出功能**：Excel 导出支持

## 使用方式

```tsx
import { UniTable } from '@/components/uni-table';

<UniTable
  columns={columns}
  request={loadData}
  rowKey="id"
  search={false}
  toolBarRender={toolBarRender}
/>
```

## Props

| 属性 | 类型 | 说明 |
|------|------|------|
| columns | ProColumns[] | 列配置 |
| request | (params) => Promise | 数据请求 |
| rowKey | string | 行唯一标识 |
| toolBarRender | () => ReactNode | 工具栏渲染 |
