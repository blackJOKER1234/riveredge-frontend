# 自定义 Hooks (hooks)

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

项目级自定义 Hooks，封装可复用的业务逻辑。

## 目录结构

```
hooks/ 下按能力拆分，主要包括：
├── useAppShellReady.ts
├── useCustomFields.ts / useCustomFieldsForList.tsx
├── useNavigationMenuTreeQuery.ts
├── usePagePermissionResource.ts / usePageResourcePermissions.ts / useResourcePermissions.ts
├── useProTableSearch.ts
├── useRecordFormDraft.ts
├── useSubmitShortcut.ts / useNewShortcut.ts
├── useTouchScreen.ts
├── useUnifiedMenuData.ts
├── useUserFieldMasks.ts
├── useWebSocket.ts
└── ...（详见目录实际文件）
```

## 常用 Hooks

| Hook | 说明 |
|------|------|
| useWebSocket | WebSocket 连接管理 |
| useCustomFields | 获取业务对象自定义字段 |
| useProTableSearch | ProTable 搜索状态管理 |
| usePageResourcePermissions | 页面资源权限控制 |
| useRecordFormDraft | 表单草稿自动保存 |

## 约定

- 业务应用专用 Hook 放 `apps/*/hooks/`，布局专用 Hook 放 `layouts/hooks/`。
- 新 Hook 先检查是否已有同类实现，避免重复封装。
