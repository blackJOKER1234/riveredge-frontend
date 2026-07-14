# 可复制代码块 (copyable-code)

## 说明
带复制按钮的代码块组件，支持一键复制内容和语法高亮。

## 核心文件
- index.tsx: 代码块主组件
- copyable-code.module.css: 样式模块

## 开发要点
- 使用 navigator.clipboard API 复制
- 复制后显示短暂反馈提示（2s）
- 语法高亮可选 highlight.js 或 Prism
