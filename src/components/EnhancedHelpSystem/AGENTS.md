# 增强帮助系统 (EnhancedHelpSystem)

## 说明
提供上下文相关的增强帮助面板，支持富文本展示和交互引导。

## 核心文件
- index.tsx: 主组件入口

## 开发要点
- 帮助内容通过 locales 管理，禁止硬编码
- 支持按模块注册帮助条目
- 善用 React Portal 渲染浮层
