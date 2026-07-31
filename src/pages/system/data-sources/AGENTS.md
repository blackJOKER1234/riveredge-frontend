# 数据源配置 (data-sources)

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

外部数据源配置模块，支持连接 MySQL、PostgreSQL、API 等数据源。

## 目录结构

```
pages/system/data-sources/
├── list/           # 数据源列表
├── card-view.tsx   # 卡片视图
└── connectors.tsx  # 连接器配置
```

## 核心功能

- **数据源类型**：MySQL、PostgreSQL、SQL Server、API 等
- **连接测试**：连接参数验证
- **数据预览**：预览源数据
- **同步配置**：增量/全量同步设置

## 数据源类型

| 类型 | 说明 |
|------|------|
| MySQL | 关系型数据库 |
| PostgreSQL | 关系型数据库 |
| SQL Server | 微软数据库 |
| API | REST API 数据源 |
| File | CSV/Excel 文件 |

## API

- `GET /data-sources` - 获取数据源列表
- `POST /data-sources` - 创建数据源
- `POST /data-sources/:id/test` - 测试连接
- `GET /data-sources/:id/preview` - 预览数据
