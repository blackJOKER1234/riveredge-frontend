# 安全图片组件 (secure-image)

## 说明
带鉴权的图片加载组件，自动附加认证 token。

## 核心文件
- index.tsx: 组件实现

## 开发要点
- 在 img URL 或请求头中注入 token
- 加载失败显示占位图
- 支持图片预览（集成 Ant Design Image）
