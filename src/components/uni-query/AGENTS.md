# 通用查询组件 (uni-query)

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

ProTable 查询条件插件：接管 ProTable 搜索栏，支持保存/分享搜索条件、快速筛选、高级筛选与拖拽排序。

## 目录结构

```
uni-query/
├── index.tsx                # 主组件
├── AdvancedFilters.tsx      # 高级筛选
├── QuickFilters.tsx         # 快速筛选
├── FilterCondition.tsx      # 筛选条件项
├── FilterGroupItem.tsx      # 筛选组项
├── SortableFilterCondition.tsx # 可拖拽条件项
├── FilterPreview.tsx        # 筛选预览
├── filterUtils.ts           # 条件转换（convertFiltersToApiParams）
└── types.ts                 # FilterGroup / FilterConfigData
```

## 核心功能

- 搜索条件保存/版本管理：`savedSearch` 服务 + 版本 Store。
- 快速筛选与高级筛选：多条件组合查询。
- 拖拽排序：条件项/保存项拖拽排序。
- 条件转换：筛选条件转 API 参数。

## 使用方式

```tsx
import UniQuery from '@/components/uni-query';
```

## 约定

- 查询条件与 API 参数的转换集中在 `filterUtils.ts`。
- 搜索保存依赖 `services/savedSearch.ts` 与 `stores/savedSearchVersionStore.ts`，不要在页面重复实现。
