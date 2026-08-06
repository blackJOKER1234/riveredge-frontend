# Ant Design 组件覆盖 (ant-design/antd)

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

Ant Design 组件覆盖子项目，从旧 SCADA 设计系统迁移而来。当前 `src/` 业务代码未发现直接引用，属于可参考、可恢复的遗留实现。

## 目录结构

```
ant-design/antd/
├── index.ts              # 导出入口
├── component/            # 覆盖组件
│   ├── breadcrumb/       # Breadcrumb
│   ├── button/           # Button / ButtonRC
│   ├── completeness-bar/ # 完整性进度条
│   ├── config-provider/  # ThemeConfigProvider
│   ├── empty/            # Empty / ShowEmpty
│   └── icon/             # SvgIcon
├── factory/              # style.ts（antd-style createStyles 工厂）
├── hook/                 # use-style.ts（CSS-in-JS 辅助）
└── style/                # GlobalStyle / index.css / reset.css / scheduleTimepicker.css
```

## 已知问题

- `component/index.ts` 仍导出 `./tabs`、`./tag`、`./fold`、`./editor`、`./tooltip`、`./timeline`、`./step`，但对应目录已不存在，直接引用该入口会编译失败。
- 当前项目实际使用的组件级主题 token 已迁移到 `src/theme/components-token.ts` 与 `src/config/antdTheme.ts`。

## 约定

- 覆盖 antd 组件时遵循 wrapper 模式，不修改 antd 源码。
- 若需重新启用本子项目，先修复 `component/index.ts` 的悬空导出并补齐缺失目录。
- 全局 CSS 副作用导入保持在 `index.ts` / `style/index.ts`，子组件不额外导入。
