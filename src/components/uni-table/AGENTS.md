# uni-table

## 说明
Uni 体系核心数据表格组件，基于 Ant Design Table 封装，约定化 CRUD 表格渲染。

## 核心文件
- index.tsx: 表格主组件，统一表格渲染
- stackedPrimaryColumn.tsx: 堆叠主列渲染（多字段合并显示）
- uniTableScrollPolicy.ts: 表格滚动策略管理

## 开发要点
- 维护统一的列配置协议，与 uni-query 的筛选条件联动
- 滚动策略需考虑固定列与虚拟滚动兼容
- 操作列复用 uni-action 的行操作按钮
