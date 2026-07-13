# uni-pull-query

## 说明
下拉查询组件，从表格行下拉触发的快速查询面板。

## 核心文件
- UniPullQueryFilterBar.tsx: 下拉查询筛选栏
- UniPullQueryModal.tsx: 下拉查询弹窗
- index.ts: 组件入口
- types.ts: 类型定义
- useUniPullQuery.ts: 下拉查询业务 Hook

## 开发要点
- 查询结果以浮层面板展示，不离开当前页面
- 数据源与当前表格上下文关联
- 支持快速选择填入主表字段
