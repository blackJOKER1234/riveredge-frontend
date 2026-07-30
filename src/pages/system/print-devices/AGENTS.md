# 打印设备 (print-devices)

## 模块说明

打印机设备配置与管理，支持标签打印机、票据打印机。

## 目录结构

```
pages/system/print-devices/
├── list/           # 设备列表
└── card-view.tsx   # 卡片视图
```

## 核心功能

- **设备添加**：网络打印机、USB 打印机
- **设备配置**：纸张规格、打印浓度
- **打印测试**：测试页打印
- **驱动管理**：打印机驱动配置

## 设备类型

| 类型 | 说明 |
|------|------|
| label | 标签打印机 |
| receipt | 票据打印机 |
| laser | 激光打印机 |
| inkjet | 喷墨打印机 |

## API

- `GET /print-devices` - 获取设备列表
- `POST /print-devices` - 添加设备
- `PUT /print-devices/:id` - 更新设备
- `POST /print-devices/:id/test` - 测试打印
