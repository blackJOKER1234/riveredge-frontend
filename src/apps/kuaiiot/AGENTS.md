# 快IoT (kuaiiot)

## 模块说明

物联网模块，连接设备、采集数据、实时监控。

## 目录结构

```
apps/kuaiiot/
├── components/    # IoT专用组件
├── constants/     # 常量定义
├── hooks/         # 专用Hooks
├── layouts/       # 布局组件
├── pages/         # 页面组件
├── services/      # API服务
├── styles/        # 样式文件
└── utils/         # 工具函数
```

## 技术要点

- **后端前缀**：`/api/v1/apps/kuaiiot`
- **实时数据**：WebSocket 推送
- **设备协议**：支持 MQTT、HTTP 等协议

## 业务域

- 设备接入 (device-connection)
- 数据采集 (data-collection)
- 实时监控 (real-time-monitoring)
- 告警管理 (alerts)
