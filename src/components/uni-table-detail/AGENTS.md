# uni-table-detail

## 说明
表格行详情展开组件，支持点击行展开子详情面板。

## 核心文件
- UniTableDetail.tsx: 详情展开面板实现
- index.less: 展开动画与样式
- index.ts: 组件导出入口

## 开发要点
- 展开/收起动画需平滑，性能考虑大数据场景
- 与 uni-table 的行展开事件联动
- 支持渲染任意自定义详情内容
