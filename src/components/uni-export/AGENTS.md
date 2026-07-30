# 通用导出组件 (uni-export)

## 模块说明

统一数据导出组件，支持 Excel 导出、批量导出、自定义导出。

## 目录结构

```
components/uni-export/
├── index.tsx      # 主组件
├── components/    # 子组件
└── types.ts       # 类型定义
```

## 核心功能

- **Excel 导出**：支持大数据量分页导出
- **字段映射**：导出字段自定义
- **格式配置**：表头、列宽、格式配置

## 使用方式

```tsx
import { UniExport } from '@/components/uni-export';

<UniExport
  columns={columns}
  request={loadData}
  fileName="导出数据"
/>
```
