# 审批流程 (approval-processes)

## 模块说明

可视化审批流程设计器，支持审批节点的配置与流程实例管理。

## 目录结构

```
pages/system/approval-processes/
├── list/           # 流程列表
├── designer/       # 流程设计器
└── instances/      # 流程实例
```

## 核心功能

- **流程设计器**：拖拽式流程节点配置
- **审批节点**：审批人、审批方式、条件分支
- **流程实例**：流程发起、审批、跟踪
- **会签/或签**：支持多人会签或任一人审批

## 节点类型

| 节点类型 | 说明 |
|----------|------|
| 开始节点 | 流程发起 |
| 审批节点 | 人工审批 |
| 条件节点 | 分支条件判断 |
| 自动节点 | 系统自动执行 |
| 结束节点 | 流程结束 |

## API

- `GET /approval-processes` - 获取流程列表
- `POST /approval-processes` - 创建流程
- `PUT /approval-processes/:id` - 更新流程
- `POST /approval-instances` - 发起流程
