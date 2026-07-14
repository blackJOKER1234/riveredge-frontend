# 业务通知规则配置 (business-notification-rules)

## 说明
业务通知规则配置面板，支持多模块、多渠道的通知策略设置。

## 核心文件
- NotificationRulesPanel.tsx: 规则配置面板
- coreNotificationRules.ts: 核心规则逻辑
- notificationAppModules.ts: 应用模块定义
- notificationChannelRefs.ts: 通知渠道引用
- notificationRecipientConstants.ts: 接收人常量

## 开发要点
- 规则条件支持 AND/OR 组合
- 通知渠道（站内信/邮件/企微等）可扩展
- 接收人支持角色/部门/用户三种维度
