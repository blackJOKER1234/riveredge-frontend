# 系统仪表盘 (dashboard)

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

系统管理仪表盘，展示系统整体运行状态、关键指标、快捷入口。

## 目录结构

```
pages/system/dashboard/
├── index.tsx                      # 主页面
├── DashboardKpiPanel.tsx          # KPI 面板
├── DashboardKpiRichCard.tsx       # KPI 卡片
├── DashboardCalendarWeatherClock.tsx # 日历天气时钟
├── DashboardOperationCardsPanel.tsx # 操作卡片面板
├── DashboardWelcomeBar.tsx        # 欢迎栏
├── DashboardSectionCard.tsx       # 区块卡片
├── DashboardUsageTipsCarousel.tsx # 使用提示轮播
├── MobileWorkplace.tsx            # 移动端工作台
├── WorkplaceToolkit.tsx           # 工作台工具箱
├── ToolkitComponents.tsx          # 工具箱组件
├── WipOperationCardView.tsx       # 在制品操作卡片视图
├── dashboardCardSurface.ts        # 卡片表面样式工具
├── dashboardTopBarTheme.ts        # 顶栏主题
├── analysis/                      # 经营分析（BusinessBoardPage 等）
└── analysis.tsx                   # 分析入口
```

## 核心功能

- **KPI 展示**：用户数、订单数、活跃度等
- **快捷入口**：常用功能快速访问
- **实时数据**：今日新增、本周趋势
- **系统状态**：系统健康状态

## 技术要点

- **数据聚合**：多个 API 数据聚合展示
- **缓存策略**：仪表盘数据缓存
- **刷新机制**：自动刷新 + 手动刷新
