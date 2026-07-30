# 主数据管理 (master-data)

## 模块说明

企业主数据管理模块，包含物料、客户、供应商等基础数据管理。

## 目录结构

```
apps/master-data/
├── components/    # 主数据专用组件
├── constants/     # 常量定义
├── hooks/         # 专用Hooks
├── layouts/       # 布局组件
├── pages/         # 页面组件
├── services/      # API服务
├── styles/        # 样式文件
└── utils/         # 工具函数
```

## 技术要点

- **后端前缀**：`/api/v1/apps/master-data`
- **数据字典**：标准化编码规则
- **数据质量**：唯一性校验、格式校验

## 业务域

- 物料管理 (materials)
- 客户管理 (customers)
- 供应商管理 (suppliers)
- 数据字典 (data-dictionary)
