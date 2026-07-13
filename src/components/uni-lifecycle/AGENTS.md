# uni-lifecycle

## 说明
生命周期组件，以步骤条展示单据/实体的状态流转。

## 核心文件
- UniLifecycleStepper.less: 步骤条样式
- UniLifecycleStepper.tsx: 步骤条组件
- index.tsx: 组件入口
- types.ts: 生命周期状态类型定义

## 开发要点
- 步骤条支持横向/纵向布局
- 状态变更需同步更新相关审批/操作按钮
- 自定义节点颜色与图标映射
