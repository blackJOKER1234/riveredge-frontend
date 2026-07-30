# 集成配置 (integration-configs)

## 模块说明

第三方系统集成配置，支持企业微信、钉钉、飞书、SAP 等系统对接。

## 目录结构

```
pages/system/integration-configs/
├── list/               # 配置列表
├── card-view.tsx       # 卡片视图
└── ConnectionWizard.tsx # 连接向导
```

## 核心功能

- **应用集成**：第三方应用授权对接
- **单点登录**：SSO 单点登录配置
- **消息推送**：消息同步到第三方
- **数据同步**：与第三方系统数据同步

## 集成类型

| 类型 | 说明 |
|------|------|
| dingtalk | 钉钉集成 |
| wecom | 企业微信集成 |
| feishu | 飞书集成 |
| sap | SAP ERP 集成 |
| u8 | 用友 U8 集成 |
| kingdee | 金蝶集成 |

## API

- `GET /integration-configs` - 获取配置列表
- `POST /integration-configs` - 创建配置
- `POST /integration-configs/:id/auth` - 获取授权
- `POST /integration-configs/:id/sync` - 执行同步
