# 系统仪表盘 (dashboard)

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
└── DashboardSectionCard.tsx       # 区块卡片
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
