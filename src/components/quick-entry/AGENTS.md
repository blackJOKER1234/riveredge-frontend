# 快捷入口组件 (quick-entry)

## 说明
页面头部快捷入口弹窗，展示常用功能的图标网格。

## 核心文件
- HeaderQuickEntryPopover.tsx: 头部弹窗
- QuickEntryGrid.tsx: 快捷入口网格
- QuickEntryIcon.tsx: 单个图标
- convertMenuTreeToTreeData.ts: 菜单树转换
- index.ts: 入口导出

## 开发要点
- 从菜单树数据动态生成入口列表
- 支持用户自定义固定入口
- 弹窗使用 Ant Design Popover
