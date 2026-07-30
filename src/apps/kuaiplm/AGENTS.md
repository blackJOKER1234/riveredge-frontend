# 快PLM (kuaiplm)

## 模块说明

产品生命周期管理模块，包含产品结构、物料清单(BOM)、工艺路线管理。

## 目录结构

```
apps/kuaiplm/
├── components/    # PLM专用组件
├── constants/     # 常量定义
├── hooks/         # 专用Hooks
├── layouts/       # 布局组件
├── pages/         # 页面组件
├── services/      # API服务
├── styles/        # 样式文件
└── utils/         # 工具函数
```

## 技术要点

- **后端前缀**：`/api/v1/apps/kuaiplm`
- **BOM管理**：多层级物料清单，支持替代料
- **版本控制**：产品及BOM支持多版本管理

## 业务域

- 产品管理 (products)
- 物料清单 (bom)
- 工艺路线 (process-routes)
- 工程变更 (engineering-changes)
