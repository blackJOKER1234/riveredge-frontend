# 快制造 (kuaizhizao)

## 模块说明

生产制造管理模块，包含设备管理、工单管理、生产报工等功能。

## 目录结构

```
apps/kuaizhizao/
├── components/    # 制造专用组件
├── constants/     # 常量定义
├── hooks/         # 专用Hooks
├── layouts/       # 布局组件
├── pages/         # 页面组件
├── services/      # API服务
├── styles/        # 样式文件
└── utils/         # 工具函数
```

## 技术要点

- **后端前缀**：`/api/v1/apps/kuaizhizao`
- **设备管理**：设备台账、点检、保养、报修
- **工单管理**：生产工单、报工、完工

## 业务域

- 设备管理 (equipment-management)
- 生产工单 (production-orders)
- 工艺路线 (process-routes)
- 工序管理 (workstations)
