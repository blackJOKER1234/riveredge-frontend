# uni-import

## 说明
导入组件，支持 Excel 数据导入及预览、映射功能。

## 核心文件
- UniImportToolbarButton.tsx: 导入工具栏按钮
- apply-import-mapping.ts: 导入字段映射
- build-import-cell-data.ts: 单元格数据构建
- build-import-template-file-name.ts: 导入模板文件名生成
- import-preview-utils.ts: 导入预览工具

## 开发要点
- 支持导入模板下载与自定义映射
- 导入前预览数据校验与错误提示
- 大数据拆分导入，支持进度显示
