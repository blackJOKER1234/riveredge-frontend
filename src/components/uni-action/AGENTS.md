# 通用动作组件 (uni-action)

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

行级动作列相关工具与组件集合，统一处理动作分组、权限过滤、溢出菜单、文案与目录。

## 目录结构

```
uni-action/
├── index.tsx                    # 导出入口（UniAction.Group）
├── Group.tsx                    # 动作分组组件
├── RowActionButton.tsx          # 行操作按钮
├── actionCatalog.ts             # 动作目录/排序/文案
├── actionText.ts                # 动作类型与视觉 profile
├── collect.ts                   # 动作收集
├── filterByPermission.ts        # 资源权限过滤
├── normalize.tsx                # 动作树归一化
├── operationColumn.ts           # 操作列识别
├── overflow.tsx                 # 溢出菜单策略
├── prepareRowActionButton.tsx   # 行按钮预处理
├── renderCell.tsx               # 操作单元格渲染
└── types.ts                     # 类型定义
```

## 核心功能

- 动作分组：`UniAction.Group` 统一组织行级操作。
- 权限过滤：`filterActionsByResourcePermission` 按资源权限过滤。
- 溢出策略：直接展示数量限制与溢出下拉（`renderRowActionsOverflow`）。
- 动作目录：统一维护动作标签、排序与视觉 profile。

## 使用方式

```tsx
import { UniAction } from '@/components/uni-action';

<UniAction.Group actions={actions} record={record} onAction={handleAction} />
```

## 约定

- 行操作按钮统一走本目录工具，不要在页面里手写按钮列表。
- 新动作类型先登记到 `actionCatalog.ts` / `actionText.ts`。
