# 通用导入组件 (uni-import)

## 模块说明

统一数据导入组件，支持 Excel 导入、模板下载、错误处理。

## 目录结构

```
components/uni-import/
├── index.tsx      # 主组件
├── components/    # 子组件
├── types.ts       # 类型定义
└── utils.ts       # 工具函数
```

## 核心功能

- **文件上传**：支持 xlsx/csv 格式
- **模板下载**：导入模板下载
- **数据预览**：导入前预览数据
- **错误处理**：错误行标记与修复
- **进度显示**：导入进度条

## 使用方式

```tsx
import { UniImport } from '@/components/uni-import';

<UniImport
  templateUrl="/templates/import.xlsx"
  onImport={handleImport}
  validateSchema={schema}
/>
```
