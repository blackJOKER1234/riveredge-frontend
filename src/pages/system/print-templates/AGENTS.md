# 打印管理 (print-templates)

## 模块说明

打印模板设计与管理，支持自定义单据、报表打印格式。

## 目录结构

```
pages/system/print-templates/
├── list/           # 模板列表
├── design/         # 模板设计器
└── card-view.tsx   # 卡片视图
```

## 核心功能

- **模板设计器**：可视化打印模板编辑
- **变量绑定**：数据字段与打印位置绑定
- **条码二维码**：支持条码、二维码打印
- **预览打印**：实时预览打印效果

## 模板类型

- 销售单打印
- 采购单打印
- 入库单打印
- 出库单打印
- 自定义报表

## API

- `GET /print-templates` - 获取模板列表
- `POST /print-templates` - 创建模板
- `PUT /print-templates/:id` - 更新模板
- `POST /print-templates/:id/print` - 执行打印
