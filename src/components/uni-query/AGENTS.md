# uni-query

## 说明
查询过滤组件，提供高级筛选与快速筛选功能，是 uni-table 的数据过滤配套组件。

## 核心文件
- AdvancedFilters.tsx: 高级筛选面板
- FilterCondition.tsx: 单条筛选条件组件
- FilterGroupItem.tsx: 筛选条件组（AND/OR 组合）
- FilterPreview.tsx: 已选条件预览标签
- QuickFilters.tsx: 快速筛选栏

## 开发要点
- 条件表达式结构需与后端查询协议一致
- 支持字段类型动态推断（文本/数字/日期/参照）
- 筛选条件变化需同步更新 URL 参数
