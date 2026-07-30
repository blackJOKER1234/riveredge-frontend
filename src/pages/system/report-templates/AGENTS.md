# 报表模板 (report-templates)

## 模块说明

报表模板设计与管理，支持自定义报表结构、数据绑定。

## 目录结构

```
pages/system/report-templates/
├── index.tsx       # 主页面
└── design/         # 模板设计器
```

## 核心功能

- **模板设计**：可视化报表设计
- **数据绑定**：绑定数据集字段
- **样式配置**：表头、边框、背景
- **打印配置**：分页、纸张设置

## 技术要点

- **拖拽布局**：组件拖拽布局
- **公式计算**：支持简单公式
- **条件格式**：单元格条件样式

## API

- `GET /report-templates` - 获取模板列表
- `POST /report-templates` - 创建模板
- `PUT /report-templates/:id` - 更新模板
- `POST /report-templates/:id/render` - 渲染报表
