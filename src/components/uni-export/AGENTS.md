# uni-export

## 说明
导出组件，支持数据导出为 Excel/CSV/PDF 等格式。

## 核心文件
- UniExportMenuButton.tsx: 导出菜单按钮
- index.ts: 组件导出入口
- index.tsx: 导出主组件
- uni-export-sheet-host.tsx: 导出 Sheet 管理

## 开发要点
- 导出格式与列配置联动
- 大数据量导出走异步任务，显示导出进度
- 导出模板可自定义列顺序与格式
