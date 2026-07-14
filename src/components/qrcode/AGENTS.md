# 二维码生成/扫码 (qrcode)

## 说明
二维码生成与扫码组件，用于移动端扫码场景。

## 核心文件
- QRCodeGenerator.tsx: 二维码生成
- QRCodeScanner.tsx: 扫码功能
- index.ts: 入口导出

## 开发要点
- 生成使用 qrcode 或类似库
- 扫码基于浏览器摄像头 API + jsQR 解码
- 生成支持自定义尺寸和颜色
