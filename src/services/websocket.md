# WebSocket 服务 (websocket)

## 模块说明

实时通信服务封装，支持消息推送、在线状态通知。

## 目录结构

```
services/websocket.ts    # WebSocket 封装
```

## 核心功能

- **连接管理**：自动重连、心跳检测
- **消息推送**：实时消息接收
- **状态通知**：在线状态变更通知
- **消息订阅**：按频道订阅消息

## 使用方式

```tsx
import { useWebSocket } from '@/services/websocket';

const { connect, subscribe, send } = useWebSocket();

// 订阅消息
subscribe('notification', handleNotification);

// 发送消息
send('message', { content: 'hello' });
```

## 消息类型

| 类型 | 说明 |
|------|------|
| notification | 系统通知 |
| message | 站内消息 |
| online_status | 在线状态变更 |
| refresh | 数据刷新通知 |
