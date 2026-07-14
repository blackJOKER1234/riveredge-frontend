# 触控终端组件 (touch-terminal)

## 说明
触控优化的终端/控制台组件，用于生产现场操作。

## 核心文件
- index.ts: 入口导出
- touchButton.ts: 触控按钮
- touchCard.ts: 触控卡片
- touchChip.tsx: 触控标签
- touchInput.ts: 触控输入框

## 开发要点
- 增大触控区域，适配手指操作
- 减少 hover 依赖，优先 click/touch 事件
- 字体和间距适配移动/工控屏
