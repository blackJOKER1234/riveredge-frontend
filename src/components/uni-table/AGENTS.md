# 通用表格组件 (uni-table)

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

统一数据表格组件，基于 ProTable 封装，提供列表展示、堆叠主列、滚动策略等能力。

## 目录结构

```
uni-table/
├── index.tsx                  # 入口（重新导出公共 API）
├── UniTable.tsx               # 主组件
├── types.ts                   # UniTableProps 类型
├── columnPolicy.ts            # 列顺序 / 列宽 / 表头策略
├── importConfig.ts            # 从 columns 生成导入配置
├── toolbarUtils.tsx           # 工具栏 key 处理与列重置按钮
├── rowClickSelection.ts       # 行点击勾选忽略逻辑
├── useProTableSearch.ts       # ProTable 搜索 ref 管理
├── uniTableStyles.ts          # 内联样式常量
├── UniTableViews.tsx          # 非表格视图与手机卡片视图
├── stackedPrimaryColumn.tsx   # 堆叠主列
└── uniTableScrollPolicy.ts    # 表格滚动策略
```

## 核心功能

- 数据展示：分页列表、排序、筛选。
- 堆叠主列：移动端/紧凑场景主列堆叠展示。
- 滚动策略：根据容器尺寸计算表格滚动高度。

## 使用方式

```tsx
import { UniTable } from '@/components/uni-table';

<UniTable
  columns={columns}
  request={loadData}
  rowKey="id"
  search={false}
  toolBarRender={toolBarRender}
/>
```

## 约定

- 表格滚动高度统一使用 `uniTableScrollPolicy`，避免页面各自硬编码。
- 主列堆叠复用 `stackedPrimaryColumn`，不在页面重复实现。
