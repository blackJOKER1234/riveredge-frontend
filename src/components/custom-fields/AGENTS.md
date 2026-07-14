# 自定义字段配置 (custom-fields)

## 说明
自定义字段配置组件集合，支持关联属性、对象、表格模型字段选择。

## 核心文件
- AssociatedAttributeField.tsx: 关联属性字段
- AssociatedDisplayModeSegmented.tsx: 展示模式分段器
- AssociatedObjectField.tsx: 关联对象字段
- AssociatedObjectSelect.tsx: 关联对象选择器
- AssociatedTableModelFieldSelect.tsx: 表格模型字段选择器

## 开发要点
- 字段配置数据结构与后端约定一致
- 关联关系变更时联动清空子字段
- 支持按对象类型动态过滤可选字段
