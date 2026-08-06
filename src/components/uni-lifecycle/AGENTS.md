# 通用生命周期组件 (uni-lifecycle)

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

通用生命周期进度圈，与业务解耦，供销售订单、采购订单、工单等复用。展示主生命周期进度 + 可选的子生命周期（subPercent/subLabel 或 subStages 全链路）。

## 目录结构

```
uni-lifecycle/
├── index.tsx                    # 主组件
├── UniLifecycleStepper.tsx      # 步骤/全链路展示
├── UniLifecycleStepper.less     # 样式
└── types.ts                     # LifecycleResult / SubStage 类型
```

## 核心功能

- 进度圆环：主生命周期进度展示。
- 全链路子阶段：`expandSubStages` 展开 Steps 列表。
- Tooltip：hover 展示状态类/流转类元信息。

## 使用方式

```tsx
import UniLifecycle from '@/components/uni-lifecycle';

<UniLifecycle
  result={lifecycleResult}
  showLabel
  expandSubStages
/>
```

## 约定

- 生命周期文案统一走 `utils/globalLifecycleI18n` 的 `translateLifecycleResult`。
- 新增生命周期阶段时同步 `types.ts` 与 `UniLifecycleStepper.tsx`。
