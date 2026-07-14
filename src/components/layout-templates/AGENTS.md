# 布局模板 (layout-templates)

## 说明
提供计算结果、画布、对比视图、仪表盘等通用布局模板。

## 核心文件
- CalculationResultTemplate.tsx: 计算结果布局
- CanvasPageTemplate.tsx: 画布页面布局
- CompareViewTemplate.tsx: 对比视图布局
- DashboardTemplate.tsx: 仪表盘布局
- DetailDrawerActions.tsx: 详情抽屉操作栏

## 开发要点
- 模板统一接收 slots 式 children 进行内容注入
- 保持布局响应式，适配不同屏幕尺寸
- 各模板遵循 Ant Design Pro 布局规范
