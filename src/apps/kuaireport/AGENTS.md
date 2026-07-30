# 快报表 (kuaireport)

## 模块说明

报表设计与管理模块，支持自定义报表、图表可视化、数据导出。

## 目录结构

```
apps/kuaireport/
├── components/    # 报表专用组件
├── constants/     # 常量定义
├── hooks/         # 专用Hooks
├── layouts/       # 布局组件
├── pages/         # 页面组件
├── services/      # API服务
├── styles/        # 样式文件
└── utils/         # 工具函数
```

## 技术要点

- **后端前缀**：`/api/v1/apps/kuaireport`
- **报表设计器**：拖拽式报表设计
- **图表引擎**：基于 ECharts 或类似库
- **导出支持**：Excel、PDF 等格式

## 业务域

- 报表设计 (report-designer)
- 报表模板 (templates)
- 数据集管理 (datasets)
- 图表配置 (charts)
