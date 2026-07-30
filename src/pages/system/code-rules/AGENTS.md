# 编码规则 (code-rules)

## 模块说明

统一编码规则管理，支持流水号、日期、前缀等编码规则配置。

## 目录结构

```
pages/system/code-rules/
└── list/       # 规则列表
```

## 核心功能

- **规则配置**：编码组成规则配置
- **规则预览**：预览生成的编码
- **规则测试**：测试编码生成
- **使用绑定**：绑定到业务对象

## 编码组成

| 组成 | 说明 |
|------|------|
| prefix | 前缀固定值 |
| date | 日期占位符 |
| sequence | 流水号 |
| random | 随机字符 |
| field | 字段值 |

## 示例

```
编码规则: ORD-{YYYYMMDD}-{SEQ:6}
生成结果: ORD-20250730-000001
```

## API

- `GET /code-rules` - 获取规则列表
- `POST /code-rules` - 创建规则
- `PUT /code-rules/:id` - 更新规则
- `POST /code-rules/:id/generate` - 生成编码
