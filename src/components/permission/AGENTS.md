# 权限组件 (permission)

## 说明
金额脱敏显示和权限守卫组件，控制敏感数据展示和操作权限。

## 核心文件
- AmountDisplay.tsx: 金额脱敏显示
- PermissionGuard.tsx: 权限守卫
- index.ts: 入口导出

## 开发要点
- AmountDisplay 根据权限状态自动切换明文/脱敏
- PermissionGuard 包裹需要鉴权的 UI 区域
- 权限逻辑与 stores/permission 配合使用
