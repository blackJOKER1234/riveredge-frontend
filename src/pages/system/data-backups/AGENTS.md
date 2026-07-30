# 数据备份 (data-backups)

## 模块说明

系统数据备份管理，支持手动备份、自动备份、备份恢复。

## 目录结构

```
pages/system/data-backups/
├── index.tsx       # 主页面
└── card-view.tsx   # 卡片视图
```

## 核心功能

- **备份列表**：查看所有备份记录
- **手动备份**：触发即时备份
- **自动备份**：配置定时备份策略
- **备份恢复**：从备份恢复数据
- **备份下载**：下载备份文件

## 技术要点

- **增量备份**：只备份变更数据
- **压缩存储**：备份文件压缩
- **保留策略**：自动清理过期备份

## API

- `GET /data-backups` - 获取备份列表
- `POST /data-backups` - 创建备份
- `POST /data-backups/:id/restore` - 恢复备份
- `DELETE /data-backups/:id` - 删除备份
