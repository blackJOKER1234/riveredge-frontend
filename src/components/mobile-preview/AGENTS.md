# 移动端预览 (mobile-preview)

## 说明
在 PC 端以手机设备框预览移动端页面，支持二维码扫码预览。

## 核心文件
- MobileDevicePreview.tsx: 设备框预览容器
- MobileQRCode.tsx: 二维码生成
- index.ts: 入口导出

## 开发要点
- iframe 嵌入预览页面，设备框使用 CSS 模拟手机外形
- QRCode 指向预览 URL，供手机扫码
- 支持横竖屏切换
