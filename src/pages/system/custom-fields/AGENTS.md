# 自定义字段 (custom-fields)

## 模块说明

业务对象自定义字段配置，支持动态扩展字段。

## 目录结构

```
pages/system/custom-fields/
└── list/       # 字段列表
```

## 核心功能

- **字段类型**：文本、数字、日期、选择、关联等
- **字段验证**：必填、唯一、正则校验
- **字段权限**：字段级别的可见/可编辑控制
- **字段布局**：表单中的字段位置

## 支持的字段类型

| 类型 | 说明 |
|------|------|
| text | 单行文本 |
| textarea | 多行文本 |
| number | 数字 |
| date | 日期 |
| datetime | 日期时间 |
| select | 下拉选择 |
| multiselect | 多选 |
| radio | 单选 |
| checkbox | 多选 |
| file | 文件上传 |
| image | 图片上传 |
| user | 用户选择 |
| department | 部门选择 |

## API

- `GET /custom-fields` - 获取字段列表
- `POST /custom-fields` - 创建字段
- `PUT /custom-fields/:id` - 更新字段
- `DELETE /custom-fields/:id` - 删除字段
