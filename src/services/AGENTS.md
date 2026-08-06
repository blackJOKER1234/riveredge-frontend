# API 服务层 (services)

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

统一 API 服务层，所有后端接口调用均通过 `api.ts` 封装。

## 目录结构

`services/` 按业务域平铺，包括 `auth.ts`、`user.ts`、`tenant.ts`、`role.ts`、`menu.ts`、`application.ts`、`approvalProcess.ts`、`message.ts`、`printTemplate.ts`、`dataDictionary.ts`、`websocket.ts` 等，另有 `websocket.md` 记录连接协议说明。

## 核心封装 (`api.ts`)

- `API_BASE_URL = '/api/v1'`
- `apiRequest`：Fetch 封装，自动拼接前缀、序列化查询参数（数组重复 key）、注入 Token/租户头、识别公开接口。
- `api` 便捷对象：`get` / `post` / `put` / `delete` / `patch`。
- 通用类型：`ApiResponse<T>`、`PageResponse<T>`。

## API 模式

```typescript
import { api } from './api';

export const userService = {
  list: (params: UserQuery) => api.get<PageResponse<User>>('/users', { params }),
  detail: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: UserForm) => api.post<User>('/users', data),
  update: (id: string, data: UserForm) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete<void>(`/users/${id}`),
};
```

## 统一处理

- 错误处理：网络错误、HTTP 错误、业务错误统一转换为可展示信息（`formatApiErrorDetail`）。
- 认证：Token 自动注入；Token 刷新后自动重试。
- 租户：`X-Tenant-ID` 自动注入。
- 请求统计：活动时间更新与挂起请求计数。
- 重试机制：临时性失败自动重试。

## 约定

- 每个服务文件导出对应业务域的 `xxxService` 或方法，命名与后端资源路径保持一致。
- 响应类型使用 `ApiResponse`/`PageResponse` 或明确的数据类型，减少 `any`。
