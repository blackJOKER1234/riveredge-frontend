# 部门管理 (departments)

## 模块说明

组织架构管理模块，支持树形部门结构、部门配置。

## 目录结构

```
pages/system/departments/
├── list/           # 部门列表（树形）
├── components/     # 部门组件
└── schemas/        # Schema定义
```

## 核心功能

- **部门树**：树形结构展示
- **部门增删改**：部门 CRUD 操作
- **部门主管**：设置部门负责人
- **部门合并**：部门合并调整

## 技术要点

- **树形结构**：递归部门树渲染
- **拖拽排序**：部门顺序拖拽调整
- **数据联动**：部门变更联动人员调整

## API

- `GET /departments` - 获取部门树
- `POST /departments` - 创建部门
- `PUT /departments/:id` - 更新部门
- `DELETE /departments/:id` - 删除部门
