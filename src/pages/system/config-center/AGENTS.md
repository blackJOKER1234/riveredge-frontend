# 配置文件 (config-center)

## 模块说明

系统配置中心，统一管理系统各类配置项。

## 目录结构

```
pages/system/config-center/
├── index.tsx               # 主页面
├── configTree.ts           # 配置树
├── AuditSettingsPanel.tsx  # 审计设置面板
├── TenantInitDataPanel.tsx # 租户初始数据面板
└── WorkOrderScoreProfilesPanel.tsx # 工单评分配置面板
```

## 核心功能

- **配置分组**：树形结构组织配置
- **配置编辑**：在线编辑配置值
- **配置校验**：配置值合法性校验
- **配置历史**：配置变更历史

## 配置分类

| 分类 | 说明 |
|------|------|
| 系统配置 | 系统级参数 |
| 业务配置 | 业务规则参数 |
| 审计配置 | 审计日志开关 |
| 租户配置 | 租户初始化数据 |
