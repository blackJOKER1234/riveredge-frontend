# 打印组件 (print)

## 说明
提供页面/报表打印功能，支持打印区域选择和样式定制。

## 核心文件
- index.tsx: 打印实现
- index.ts: 工具函数导出

## 开发要点
- 使用 window.print() + 临时 iframe 实现
- 打印样式通过 @media print 注入
- 支持指定打印区域和隐藏无关元素
