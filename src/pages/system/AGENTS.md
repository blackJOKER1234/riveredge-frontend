# 系统管理 (System)

## 模块说明

系统管理模块，包含租户管理、用户管理、权限配置、系统参数等核心功能。

## 子模块清单

| 子模块 | 说明 |
|--------|------|
| `users/` | 用户管理 |
| `roles/` | 角色管理 |
| `roles-permissions/` | 角色权限配置 |
| `departments/` | 部门管理 |
| `positions/` | 岗位管理 |
| `permissions/` | 权限点管理 |
| `site-settings/` | 站点设置 |
| `system-parameters/` | 系统参数 |
| `menus/` | 菜单配置 |
| `tenant/` | 租户管理 |
| `applications/` | 应用管理 |
| `application-connections/` | 应用连接 |
| `apis/` | API管理 |
| `approval-processes/` | 审批流程 |
| `dashboard/` | 系统仪表盘 |
| `data-dictionaries/` | 数据字典 |
| `custom-fields/` | 自定义字段 |
| `data-sources/` | 数据源配置 |
| `datasets/` | 数据集管理 |
| `equipment/` | 设备管理 |
| `equipment-faults/` | 设备故障 |
| `maintenance-plans/` | 保养计划 |
| `molds/` | 模具管理 |
| `data-backups/` | 数据备份 |
| `login-logs/` | 登录日志 |
| `operation-logs/` | 操作日志 |
| `online-users/` | 在线用户 |
| `messages/` | 消息管理 |
| `print-templates/` | 打印模板 |
| `print-devices/` | 打印设备 |
| `onboarding-wizard/` | 初始化向导 |
| `integration-configs/` | 集成配置 |
| `data-quality/` | 数据质量 |
| `code-rules/` | 编码规则 |
| `invitation-codes/` | 邀请码 |
| `languages/` | 语言配置 |
| `usage-analysis/` | 使用分析 |
| `plugin-manager/` | 插件管理 |
| `report-templates/` | 报表模板 |
| `config-center/` | 配置中心 |
| `working-hours-configs/` | 工时配置 |

## 技术要点

- **权限体系**：基于角色的权限控制 (RBAC)
- **租户隔离**：多租户数据隔离
- **审计日志**：操作日志记录

## 开发规范

- 系统管理页面在 `pages/system/` 下按功能域分目录
- 对应 API 服务在 `services/` 目录下
- 使用 `uni-table`、`uni-query` 等通用组件
