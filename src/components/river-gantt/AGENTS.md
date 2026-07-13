# 甘特图组件 (river-gantt)

## 说明
自定义甘特图，用于项目计划和排程的时间轴展示。

## 核心文件
- GanttBar.tsx: 甘特条
- GanttGridColumn.tsx: 网格列
- GanttLinksLayer.tsx: 依赖连线层
- GanttScaleHeader.tsx: 时间刻度头部
- RiverGantt.tsx: 主组件

## 开发要点
- 使用 Canvas 或 SVG 绘制时间轴
- 支持拖拽调整任务起止时间
- 连线表示任务间依赖关系
