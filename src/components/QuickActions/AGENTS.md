# 快捷操作组件 (QuickActions)

## 说明
常用操作快捷入口，支持自定义配置和拖拽排序。

## 核心文件
- index.tsx: 快捷操作面板

## 开发要点
- 操作项权限通过 useResourcePermissions 控制
- 支持用户自定义排序（持久化存储）
- 操作响应延迟控制在 100ms 内
