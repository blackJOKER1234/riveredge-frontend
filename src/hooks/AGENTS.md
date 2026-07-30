# 自定义 Hooks (hooks)

## 模块说明

项目自定义 Hooks 集合，提供可复用的业务逻辑封装。

## 目录结构

```
hooks/
├── useAppShellReady.ts       # App Shell 加载完成
├── useAuditRequired.ts       # 审计需求检测
├── useCustomFields.ts        # 自定义字段
├── useCustomFieldsForList.tsx # 列表自定义字段
├── useNavigationMenuTreeQuery.ts # 导航菜单树
├── usePagePermissionResource.ts # 页面权限资源
├── usePageResourcePermissions.ts # 页面资源权限
├── useProTableSearch.ts      # ProTable 搜索
├── useRecordFormDraft.ts     # 表单草稿
├── useResourcePermissions.ts # 资源权限
├── useSubmitShortcut.ts      # 提交快捷键
├── useTouchScreen.ts         # 触屏检测
├── useUnifiedMenuData.ts     # 统一菜单数据
├── useUserFieldMasks.ts      # 用户字段掩码
├── useWebSocket.ts           # WebSocket 连接
└── ...
```

## 常用 Hooks

| Hook | 说明 |
|------|------|
| useWebSocket | WebSocket 连接管理 |
| useCustomFields | 获取业务对象自定义字段 |
| useProTableSearch | ProTable 搜索状态管理 |
| usePageResourcePermissions | 页面资源权限控制 |
| useFormDraft | 表单草稿自动保存 |
