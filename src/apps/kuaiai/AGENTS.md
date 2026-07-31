# 快AI (kuaiai)

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

AI 能力集成应用，当前包含知识库、AI 建议与聊天能力。

## 目录结构

```
apps/kuaiai/
├── index.tsx           # 应用入口
├── manifest.json       # 应用清单
├── components/         # ai-suggestions / material-health 组件
├── hooks/              # useKuaiaiEntryAvailable
├── pages/              # knowledge
└── services/           # ai-suggestions / chat / knowledge
```

## 技术要点

- 后端前缀：`/apps/kuaiai`（知识库、建议、训练接口）。
- AI 聊天：`services/chat.ts` 拼接 DeepSeek 兼容补全地址，需注意密钥/请求头处理。
- 知识库：支持训练数据与 `export.jsonl` 导出。

## 业务域

- 知识库（knowledge）
- AI 建议（ai-suggestions）
- 物料健康（material-health）
- 聊天（chat）
