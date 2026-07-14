# uni-audit

## 说明
审批组件，提供审批流程预览、审批操作、审批状态展示。

## 核心文件
- ApprovalFlowPreview.tsx: 审批流程预览图
- AuditPhaseBadge.tsx: 审批阶段标签
- DetailAuditPhaseRow.tsx: 详情页审批阶段行
- UniAuditAdvancedActionModal.tsx: 高级审批操作弹窗
- UniAuditModal.tsx: 审批操作弹窗

## 开发要点
- 审批流程状态与 uni-lifecycle 生命周期联动
- 支持加签、转审、会签等高级审批操作
- 审批意见动态表单渲染
