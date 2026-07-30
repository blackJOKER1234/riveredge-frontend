# 数据源配置 (data-sources)

## 模块说明

外部数据源配置模块，支持连接 MySQL、PostgreSQL、API 等数据源。

## 目录结构

```
pages/system/data-sources/
├── list/           # 数据源列表
├── card-view.tsx   # 卡片视图
└── connectors.tsx  # 连接器配置
```

## 核心功能

- **数据源类型**：MySQL、PostgreSQL、SQL Server、API 等
- **连接测试**：连接参数验证
- **数据预览**：预览源数据
- **同步配置**：增量/全量同步设置

## 数据源类型

| 类型 | 说明 |
|------|------|
| MySQL | 关系型数据库 |
| PostgreSQL | 关系型数据库 |
| SQL Server | 微软数据库 |
| API | REST API 数据源 |
| File | CSV/Excel 文件 |

## API

- `GET /data-sources` - 获取数据源列表
- `POST /data-sources` - 创建数据源
- `POST /data-sources/:id/test` - 测试连接
- `GET /data-sources/:id/preview` - 预览数据
