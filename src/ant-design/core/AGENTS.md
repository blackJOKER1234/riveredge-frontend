# 设计系统核心 (ant-design/core)

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

设计系统核心子项目（主题 token、ThemeProvider、`useTheme`、类型与基础样式），从旧 SCADA 设计系统迁移而来。当前 `src/` 业务代码未发现直接引用；实际使用的组件级主题 token 已迁移到 `src/theme/components-token.ts`。

## 目录结构

```
ant-design/core/
├── index.ts                  # 导出入口 + 副作用 CSS 导入
├── component/theme-provider/ # ThemeProvider + context
├── dts/type/                 # token.ts / theme-lib.ts 类型
├── hook/use-theme.ts         # useTheme
├── style/                    # base.css / scrollbar.css
└── theme/                    # token.ts / Dark.tokens.ts / Light.tokens.ts / theme-lib.ts / color-mapping.md
```

## 导出

| 符号 | 说明 |
|------|------|
| `ThemeProvider` / `context` | 主题 Provider 与上下文 |
| `useTheme` | 读取当前主题 token |
| `token` | 默认 token 值 |
| `darkTheme` / `lightTheme` / `themeLib` | 主题库 |
| 类型定义 | 经 `dts` 链式导出 |

## 约定

- Token 类型与 `theme/*.tokens.ts` 需同步修改，不能只改一边。
- 颜色映射参考 `theme/color-mapping.md`。
- 若重新接入业务，先确认与 `src/theme/components-token.ts` 的类型/结构兼容，避免两套 token 冲突。
- 副作用 CSS 导入只放在 `index.ts`，子目录不新增全局样式副作用。
