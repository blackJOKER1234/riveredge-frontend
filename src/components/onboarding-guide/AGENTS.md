# 新手引导 (onboarding-guide)

## 说明
新手引导教程，引导用户逐步了解系统功能和操作流程。

## 核心文件
- OnboardingWizardEntry.tsx: 向导入口
- Tooltip.tsx: 引导提示气泡
- index.tsx: 主组件
- registry.ts: 步骤注册
- store.ts: 状态管理

## 开发要点
- 步骤配置集中管理，支持按角色/页面筛选
- 使用 Zustand store 记录引导进度
- 支持跳过/重播
