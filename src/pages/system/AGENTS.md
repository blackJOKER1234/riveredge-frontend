# 系统管理 (System)

## 全局 Agent 规范

以下规范对本目录及其子目录的所有 Agent 强制生效，优先级高于本文件其余内容。

### 回复语言与交互规范

1. 语言要求：全程使用简体中文回复；除代码片段、专有名词、引用原文外，默认不使用英文输出。
2. 需求回显（绝对强制，不得跳过）：每次用户输入后，首先输出需求回显区块，然后才能执行任何工具或读取任何文件。回显需按主题分类整理为清晰要点，并追加“我已了解规则”。
3. 输入纠错：能确定的输入问题自动修正；语义模糊、逻辑冲突、缺少关键信息或可能导致严重后果时，禁止猜测，必须向用户反问确认。
4. 询问机制：
   - 必须询问：语义模糊、逻辑冲突、重大技术决策（如框架选型、架构方案）。
   - 禁止询问：版本号、依赖库等可从项目文件自主获取的信息；明显可推断的同音字错误。

### 网页搜索

- `web_search` 失效时，改用 `ddg-search` MCP 进行搜索。

### Team 与 Agent 调用

- 探索型任务优先通过子 Agent 处理。
- 工具调用优先使用 haiku 模型；探索型任务与子 Agent 优先使用 haiku 或 `deepseek-v4-flash` 模型。

## 模块说明

系统管理模块，包含组织账号、租户应用、权限、数据字典、日志运维、打印报表与业务流程等核心功能。

## 子模块清单

| 子模块 | 说明 |
|--------|------|
| `users/` | 用户管理 |
| `roles/` | 角色管理 |
| `roles-permissions/` | 角色权限配置 |
| `departments/` | 部门管理 |
| `positions/` | 岗位管理 |
| `permissions/` | 权限点管理 |
| `applications/` | 应用管理 |
| `application-connections/` | 应用连接 |
| `apis/` | API 管理 |
| `site-settings/` | 站点设置 |
| `system-parameters/` | 系统参数 |
| `menus/` | 菜单配置 |
| `languages/` | 语言配置 |
| `integration-configs/` | 集成配置 |
| `approval-processes/` | 审批流程 |
| `dashboard/` | 系统仪表盘 |
| `default-home/` | 默认首页 |
| `data-dictionaries/` | 数据字典 |
| `custom-fields/` | 自定义字段 |
| `data-sources/` | 数据源配置 |
| `datasets/` | 数据集管理 |
| `data-quality/` | 数据质量 |
| `code-rules/` | 编码规则 |
| `config-center/` | 配置中心 |
| `invitation-codes/` | 邀请码 |
| `role-scenarios/` | 角色场景 |
| `equipment/` | 设备管理 |
| `equipment-faults/` | 设备故障 |
| `maintenance-plans/` | 保养计划 |
| `molds/` | 模具管理 |
| `data-backups/` | 数据备份 |
| `login-logs/` | 登录日志 |
| `operation-logs/` | 操作日志 |
| `online-users/` | 在线用户 |
| `messages/` | 消息管理 |
| `operation-guide/` | 操作引导 |
| `usage-analysis/` | 使用分析 |
| `launch-progress/` | 上线进度 |
| `onboarding-wizard/` | 初始化向导 |
| `print-templates/` | 打印模板 |
| `print-devices/` | 打印设备 |
| `report-templates/` | 报表模板 |
| `plugin-manager/` | 插件管理 |
| `working-hours-configs/` | 工时配置 |
| `files/` | 文件管理 |
| `inngest/` | Inngest 任务管理 |

## 技术要点

- 权限体系：基于角色的权限控制（RBAC）。
- 租户隔离：多租户数据隔离。
- 审计日志：操作日志记录。

## 开发规范

- 系统管理页面在 `pages/system/` 下按功能域分目录。
- 页面目录常规结构：`index.tsx`（主页面）、`list/`、`components/`、`schemas/`。
- 对应 API 服务在 `services/` 目录下。
- 使用 `uni-table`、`uni-query` 等通用组件。
- 大型配置页面（如 `site-settings`、`onboarding-wizard`）拆分面板组件，避免继续膨胀主文件。
