# 文件预览 (file-preview)

## 说明
支持多格式文件在线预览的组件，覆盖图片/PDF/Office 等。

## 核心文件
- DocumentPreviewPane.tsx: 文档预览面板
- index.tsx: 预览组件入口

## 开发要点
- 按文件类型分发到不同渲染引擎
- Office 文件预览依赖后端转换服务
- 预览加载过程展示骨架屏
