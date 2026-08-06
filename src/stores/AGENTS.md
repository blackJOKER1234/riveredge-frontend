# 状态管理 (stores)

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

Zustand 状态管理目录，包含全局状态、页面状态、主题状态等。

## 目录结构

```
stores/
├── index.ts                      # 导出入口
├── configStore.ts                # 配置状态
├── globalStore.ts                # 全局状态
├── listPageRefreshStore.ts       # 列表页刷新状态
├── savedSearchOrderStorage.ts    # 搜索排序存储
├── savedSearchVersionStore.ts    # 搜索版本存储
├── tabsStorage.ts                # 标签页状态
├── themeStore.ts                 # 主题状态
└── userPreferenceStore.ts        # 用户偏好设置
```

## 核心 Store

| Store | 说明 |
|-------|------|
| globalStore | 全局状态（租户信息、用户信息） |
| themeStore | 主题配置（颜色、字体、布局） |
| userPreferenceStore | 用户偏好（列配置、筛选条件） |
| tabsStorage | 标签页状态（多标签页管理） |

## 使用方式

```tsx
import { useGlobalStore } from '../stores';

const { tenant, user } = useGlobalStore();
```

## 约定

- 只放跨页面共享状态；页面局部状态优先 `useState` / React Query。
- 导出统一走 `stores/index.ts`，页面侧优先从入口导入。
