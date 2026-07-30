# 好力GO (haoligo)

## 模块说明

专用应用模块，用于好力GO设备/模具/巡查的 Web 实现。

## 目录结构

```
apps/haoligo/
├── components/    # 好力GO专用组件
├── constants/     # 常量定义
├── hooks/         # 专用Hooks
├── layouts/       # 布局组件
├── pages/         # 页面组件
├── services/      # API服务
├── styles/        # 样式文件
└── utils/         # 工具函数
```

## 技术要点

- **后端前缀**：`/api/v1/apps/haoligo`
- **路由规则**：在 `pages/` 下按功能域分目录
- **组件复用**：不复用快制造 `kuaizhizao/pages/equipment-management`

## 开发规范

- 设备管理相关组件放在 `components/` 下
- 模具管理页面放在 `pages/` 对应子目录
- 巡查功能相关组件独立维护
