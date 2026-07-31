# 工具函数 (utils)

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

项目级通用工具函数集合，包含格式化、认证、权限、文件、打印、错误处理等工具。

## 目录结构

```
utils/ 按能力平铺，常用文件包括：
├── auth.ts                    # Token / 租户 / 用户信息
├── format.ts                  # 格式化工具
├── permission.ts / permissionResource.ts / permissionContract.ts
├── navigation.ts / navigationMenuPaths.ts
├── errorHandler.ts / errorRecovery.ts / enhancedErrorHandler.tsx
├── fileDownload.ts / compressImageForUpload.ts
├── printResponseHelpers.ts / printTemplate*.ts
├── menuTranslation.ts / systemDictionaryI18n.ts 等 i18n 辅助
└── ...
```

## 核心工具

| 工具 | 说明 |
|------|------|
| auth | 登录态、Token、租户信息管理 |
| format | 日期、金额、文件大小格式化 |
| permission | 资源/字段权限判断 |
| navigation | 页面跳转与路径解析 |
| errorHandler / errorRecovery | 错误提示、网络恢复、请求重试 |
| fileDownload | 文件下载与压缩上传 |

## 约定

- API 请求封装在 `services/api.ts`，不要在本目录重复实现请求层。
- 页面专用逻辑优先就近放页面目录，跨页面共享再放这里。
