# 报表设计器 (report-designer)

## 说明
拖拽式报表设计器，支持在画布上自由编排报表组件。

## 核心文件
- Canvas.tsx: 设计画布
- DraggableComponent.tsx: 可拖拽组件包装
- DraggableItem.tsx: 拖拽项
- components/: 子组件目录
- index.tsx: 入口

## 开发要点
- 基于 @dnd-kit 实现拖拽布局
- 报表配置输出 JSON schema 供渲染引擎使用
- 支持组件属性面板实时编辑
