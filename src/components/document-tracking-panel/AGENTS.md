# 单据跟踪面板 (document-tracking-panel)

## 说明
单据跟踪面板，含流程图展示节点关系和流转状态。

## 核心文件
- DocumentTraceFlowGraph.tsx: 流程图
- RelationLayout.tsx: 关系布局
- RelationNodeChip.tsx: 节点 Chip
- TraceLinkedDocumentBrief.tsx: 关联单据摘要
- index.tsx: 面板主入口

## 开发要点
- 流程图使用 SVG 或 Canvas 渲染
- 节点状态颜色与全局主题一致
- 支持缩放和平移操作
