# 数据字典 (data-dictionaries)

## 模块说明

系统数据字典管理，定义标准化编码规则与枚举值。

## 目录结构

```
pages/system/data-dictionaries/
├── list/           # 字典列表
├── components/     # 字典组件
└── schemas/        # Schema定义
```

## 核心功能

- **字典分类**：按业务域分类管理
- **字典项管理**：增删改查字典项
- **级联关系**：字典项间级联依赖
- **数据导入**：批量导入字典数据

## 技术要点

- **编码规则**：前缀+流水号规则
- **缓存机制**：字典数据本地缓存
- **多语言**：字典值多语言支持

## API

- `GET /data-dictionaries` - 获取字典列表
- `POST /data-dictionaries` - 创建字典
- `PUT /data-dictionaries/:id` - 更新字典
- `GET /data-dictionary-items` - 获取字典项
