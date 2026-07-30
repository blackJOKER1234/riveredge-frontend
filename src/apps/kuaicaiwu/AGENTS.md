# 快财务 (kuaicaiwu)

## 模块说明

财务核算模块，包含应收应付、发票管理、成本核算等功能。

## 目录结构

```
apps/kuaicaiwu/
├── components/    # 财务专用组件
├── constants/     # 常量定义
├── hooks/         # 专用Hooks
├── layouts/       # 布局组件
├── pages/         # 页面组件
├── services/      # API服务
├── styles/        # 样式文件
└── utils/         # 工具函数
```

## 技术要点

- **后端前缀**：`/api/v1/apps/kuaicaiwu`
- **金额处理**：统一使用分作为最小单位，避免浮点精度问题
- **审批流**：财务单据需经过审批流程

## 业务域

- 应收管理 (receivables)
- 应付管理 (payables)
- 发票管理 (invoices)
- 成本核算 (costing)
