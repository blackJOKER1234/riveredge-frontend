# 角色权限管理 (roles-permissions)

## 模块说明

系统角色与权限配置模块，支持角色的创建、权限分配、权限继承等。

## 目录结构

```
pages/system/roles-permissions/
├── index.tsx                # 主页面
├── components/              # 子组件
└── roles-permissions.less   # 样式
```

## 核心功能

- **角色管理**：创建、编辑、删除角色
- **权限配置**：可视化权限树配置
- **权限继承**：子角色继承父角色权限
- **批量授权**：批量用户授权

## 技术要点

- **权限树**：基于菜单的权限树展示
- **权限粒度**：页面级、操作级、数据级权限
- **权限缓存**：权限数据本地缓存

## API

- `GET /roles` - 获取角色列表
- `POST /roles` - 创建角色
- `PUT /roles/:id` - 更新角色
- `GET /roles/:id/permissions` - 获取角色权限
- `PUT /roles/:id/permissions` - 更新角色权限
