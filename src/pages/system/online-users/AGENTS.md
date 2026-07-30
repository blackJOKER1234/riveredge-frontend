# 在线用户 (online-users)

## 模块说明

实时查看当前在线用户，支持强制下线、会话管理。

## 目录结构

```
pages/system/online-users/
├── index.tsx       # 主页面
└── card-view.tsx   # 卡片视图
```

## 核心功能

- **在线列表**：实时在线用户列表
- **用户详情**：查看在线用户信息
- **强制下线**：踢出指定用户
- **会话管理**：查看用户会话详情

## 技术要点

- **实时更新**：WebSocket 推送在线状态
- **设备信息**：记录登录设备、IP
- **会话时长**：在线时长统计

## API

- `GET /online-users` - 获取在线用户
- `POST /online-users/:id/force-logout` - 强制下线
- `GET /online-users/:id/sessions` - 获取用户会话
