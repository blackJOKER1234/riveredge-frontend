# DWG 图纸预览 (dwg-preview)

## 说明
DWG 图纸在线预览组件，支持图纸渲染和基础交互。

## 核心文件
- DwgPreviewPane.tsx: 预览面板
- DwgSvgViewer.tsx: SVG 渲染器

## 开发要点
- DWG 转换依赖后端或 WebAssembly 方案
- 支持缩放/平移/图层切换
- 大图纸做分片加载或缩略图优先
