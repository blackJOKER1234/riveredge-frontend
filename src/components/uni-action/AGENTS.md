# uni-action

## 说明
操作按钮/行操作组件体系，统一管理页面操作按钮和表格行内操作。

## 核心文件
- Group.tsx: 操作按钮组渲染
- RowActionButton.tsx: 表格行操作按钮
- actionCatalog.ts: 操作按钮配置目录
- actionText.ts: 操作按钮文本管理
- collect.ts: 操作权限收集

## 开发要点
- 按钮显隐/禁用状态与权限体系联动
- 操作按钮支持分割线、分组等 UI 格式
- 行操作与表格行数据绑定
