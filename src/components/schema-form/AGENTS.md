# Schema 驱动的表单 (schema-form)

## 说明
通过 JSON Schema 配置自动渲染表单。

## 核心文件
- SchemaFormRenderer.tsx: schema 渲染器
- form-schemas.ts: 表单 schema 定义
- index.ts: 入口导出

## 开发要点
- schema 定义参考 JSON Schema 规范
- 支持自定义字段组件注册
- 支持条件显隐和联动校验
