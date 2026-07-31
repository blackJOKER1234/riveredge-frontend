# 快报表 (kuaireport)

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

报表与仪表盘应用，提供报表/大屏设计、查看与分享。

## 目录结构

```
apps/kuaireport/
├── index.tsx           # 应用入口
├── manifest.json       # 应用清单
├── components/         # designer / widgets
├── pages/              # Report* / Dashboard* / EfficiencyCenterDashboard
├── services/           # kuaireport.ts（/apps/kuaireport API）
├── types/              # dashboard.ts / report.ts
└── utils/              # publishLifecycle
```

## 技术要点

- 后端前缀：`/apps/kuaireport`。
- 分享能力：报表/仪表盘支持 token 分享，分享页在主路由中全屏渲染（`/apps/kuaireport/.../shared`）。
- 设计器：报表设计器与仪表盘设计器位于 `components/designer` 与 `pages/*Designer.tsx`。

## 业务域

- 报表中心/设计/查看/分享（Report*）
- 仪表盘中心/设计/查看/分享（Dashboard*）
- 效率中心（EfficiencyCenterDashboard）
