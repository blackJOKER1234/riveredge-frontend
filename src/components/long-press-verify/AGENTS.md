# 长按验证组件 (long-press-verify)

## 说明
长按按钮触发的验证组件，防止误操作，类似"长按确认"交互。

## 核心文件
- index.tsx: 组件实现

## 开发要点
- 使用 onPointerDown/onPointerUp + setTimeout 实现
- 视觉反馈（进度条或颜色渐变）指示长按进度
- 支持配置长按时长和回调
