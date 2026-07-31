# 快财务 (kuaicaiwu)

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

财务核算应用，覆盖成本、财务单据、总账与管理分析。

## 目录结构

```
apps/kuaicaiwu/
├── index.tsx           # 应用入口
├── manifest.json       # 应用清单
├── components/         # 财务专用组件
├── constants/          # 单据动作注册等常量
├── pages/              # cost-management / finance-management / gl / management-analysis / management-dashboard
├── services/           # cost / finance / gl / management-report / statistics
├── types/              # finance 等领域类型
└── utils/              # 生命周期、UI 标签、行操作工具
```

## 技术要点

- 后端前缀：`/apps/kuaicaiwu`。
- 金额处理：涉及金额的工具/类型需保持单位与精度约定，避免浮点问题。
- 生命周期：应收、应付、成本等单据各有生命周期工具与 UI 标签。

## 业务域

- 成本管理（cost-management）
- 财务管理（finance-management）
- 总账（gl）
- 管理分析/仪表盘（management-analysis / management-dashboard）
