# THEME TOKENS KEY MAPPING

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

**状态：** 历史迁移记录（来自旧 SCADA 设计系统）。本目录当前未被 `src/` 业务代码直接引用；活跃的组件级主题 token 在 `src/theme/components-token.ts`，接入配置在 `src/config/antdTheme.ts`。

## OVERVIEW

This document records the mapping from Chinese key names to English key names in the theme token files (`Dark.tokens.ts`, `Light.tokens.ts`). The rename was done to improve code readability and maintainability across the project.

## TailwindCSS → Ant Design Token 转化

当代码中涉及 TailwindCSS 颜色变量（如 `text-[#ADADAD]`、`bg-[#F3F5F7]`、`border-[#D9D9D9]` 等）时，参照 [`color-mapping.md`](./color-mapping.md) 中的颜色映射表转化为对应的 Ant Design Token，并通过 `useTheme()` Hook 使用。

注意：该转化示例适用于本子项目的 `useTheme()` token；当前 riveredge 主项目请以 `src/theme/components-token.ts` 与 `src/config/themeTokens.ts` 为准，不要直接引入本子项目 token。

转化方式：
```tsx
import { useTheme } from "@/core";

const token = useTheme();

// 替换前
<span className="text-[#ADADAD]">提示文字</span>

// 替换后
<span style={{ color: token.colorTipsText }}>提示文字</span>
```

详细映射表请查阅 [`color-mapping.md`](./color-mapping.md)。

## OBJECT KEY MAPPINGS

### Sub-object keys (nested structure)

| Chinese (old) | English (new) | Description |
|---|---|---|
| `转换色` | `scale` | Color conversion scale (primary → tint/shade variations) |
| `透明度` | `mix` | Color mixing/toning values (percentage mixes of primary colors) |

### `other` section (surface/background colors)

| Chinese (old) | English (new) | Description |
|---|---|---|
| `白色-主题时不变色` | `white` | Pure white (unchanged across themes) |
| `页面底色` | `pageBg` | Page background color |
| `板块底色` | `panelBg` | Panel/section background color |
| `表格表头` | `tableHeaderBg` | Table header background color |
| `通用标签` | `tagBg` | Generic tag background color |
| `深蓝灰底` | `darkGrayBg` | Dark gray/blue background |
| `弹窗底色` | `modalBg` | Modal dialog background color |
| `上传顶部底色` | `uploadHeaderBg` | Upload area header background |
| `上传底色` | `uploadBg` | Upload area background |
| `禁用按钮变色` | `disabledBtn` | Disabled button color |
| `气泡弹窗` | `tooltipBg` | Tooltip/popup background |

### Blue scale — `blue.scale`

| Chinese (old) | English (new) |
|---|---|
| `blue0` | `blue0` (unchanged) |
| `blue1（+60%黑）` | `blue1` |
| `blue2（+16%黑）` | `blue2` |
| `blue3（主）` | `blue3` |
| `blue4（+16%白）` | `blue4` |
| `blue5（40%主）` | `blue5` |
| `blue6（32%主）` | `blue6` |
| `blue7（12%主）` | `blue7` |
| `blue8（8%主）` | `blue8` |
| `blue9（4%主）` | `blue9` |

### Blue mix — `blue.mix`

| Chinese (old) | English (new) |
|---|---|
| `40%blue3（主）` | `blue3Mix40` |
| `8%blue3（主）` | `blue3Mix8` |
| `6%blue3（主）` | `blue3Mix6` |
| `4%blue3（主）` | `blue3Mix4` |

### Red scale — `red.scale`

| Chinese (old) | English (new) |
|---|---|
| `red1（+60%黑）` | `red1` |
| `red2（主+16%黑）` | `red2` |
| `red3（主）` | `red3` |
| `red4（主+16%白）` | `red4` |
| `red5（40%主）` | `red5` |
| `red6（32%主）` | `red6` |
| `red7（12%主）` | `red7` |
| `red8（8%主）` | `red8` |
| `red9（4%主）` | `red9` |

### Red mix — `red.mix`

| Chinese (old) | English (new) |
|---|---|
| `40%red3（主）` | `red3Mix40` |
| `8%red3（主）` | `red3Mix8` |
| `6%red3（主）` | `red3Mix6` |
| `4%red3（主）` | `red3Mix4` |

### Green scale — `green.scale`

| Chinese (old) | English (new) |
|---|---|
| `green1（+60%黑）` | `green1` |
| `green2（+16%黑）` | `green2` |
| `green3（主）` | `green3` |
| `green4（+16%白）` | `green4` |
| `green5（40%主）` | `green5` |
| `green6（32%主）` | `green6` |
| `green7（12%主）` | `green7` |
| `green8（8%主）` | `green8` |
| `green9（4%主）` | `green9` |

### Green mix — `green.mix`

| Chinese (old) | English (new) |
|---|---|
| `8%green3` | `green3Mix8` |

### Orange scale — `orange.scale`

| Chinese (old) | English (new) |
|---|---|
| `orange1（+60%黑）` | `orange1` |
| `orange2（+16%黑）` | `orange2` |
| `orange3（主）` | `orange3` |
| `orange4（+16%白）` | `orange4` |
| `orange5（40%主）` | `orange5` |
| `orange6（32%主）` | `orange6` |
| `orange7（12%主）` | `orange7` |
| `orange8（8%主）` | `orange8` |
| `orange9（4%主）` | `orange9` |

### Orange mix — `orange.mix`

| Chinese (old) | English (new) |
|---|---|
| `8%orange3` | `orange3Mix8` |

### Cyan scale — `Cyan.scale`

| Chinese (old) | English (new) |
|---|---|
| `Cyan3（主）` | `cyan3` |
| `Cyan8（8%主）` | `cyan8` |

### Cyan mix — `Cyan.mix`

| Chinese (old) | English (new) |
|---|---|
| `8%Cyan3` | `cyan3Mix8` |

### Unchanged sections

The following sections already use English keys and were NOT modified:

- `black` — opacity tokens (e.g., `"black 2%"`, `"black 100%"`)
- `gray` — grayscale tokens (e.g., `"gray 0%"`, `"gray 100%"`)

## CODE ACCESS PATTERN CHANGES

### Before (Chinese keys - bracket notation required)

```ts
import darkTokens from "./Dark.tokens.ts";

// Sub-object access
const blueScale = darkTokens.blue.转换色;
const blueMix = darkTokens.blue.透明度;

// Value access (bracket notation required for Chinese chars)
const primary = darkTokens.blue.转换色["blue3（主）"];
const pageBg = darkTokens.other.页面底色;
const tableHeaderBg = darkTokens.other.表格表头;
```

### After (English keys - dot notation preferred)

```ts
import darkTokens from "./Dark.tokens.ts";

// Sub-object access
const blueScale = darkTokens.blue.scale;
const blueMix = darkTokens.blue.mix;

// Value access (dot notation)
const primary = darkTokens.blue.scale.blue3;
const pageBg = darkTokens.other.pageBg;
const tableHeaderBg = darkTokens.other.tableHeaderBg;
```

## FILES MODIFIED

上述中文 key → 英文 key 的改动发生在旧 SCADA 仓库，本仓库只保留了迁移结果与映射说明。修改 token 时以当前目录实际文件为准，同时检查 `src/theme/components-token.ts` 是否需要同步。
