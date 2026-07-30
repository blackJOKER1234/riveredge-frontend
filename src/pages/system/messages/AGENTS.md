# 消息中心 (messages)

## 模块说明

系统消息管理，包含消息模板、消息配置、消息发送记录。

## 目录结构

```
pages/system/messages/
├── config/     # 消息配置
└── template/   # 消息模板
```

## 核心功能

- **消息模板**：邮件、短信、应用内消息模板
- **变量替换**：模板变量配置
- **发送记录**：消息发送历史查询
- **订阅管理**：用户消息订阅配置

## 消息渠道

| 渠道 | 说明 |
|------|------|
| in-app | 应用内通知 |
| email | 邮件通知 |
| sms | 短信通知 |
| webhook | Webhook 回调 |

## API

- `GET /message-templates` - 获取消息模板
- `POST /message-templates` - 创建模板
- `POST /messages/send` - 发送消息
- `GET /messages` - 获取消息列表
