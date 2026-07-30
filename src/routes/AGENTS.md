# 路由配置 (routes)

## 模块说明

项目路由配置模块，定义页面路由、权限守卫、懒加载等。

## 目录结构

```
routes/
├── index.tsx                  # 导出入口
├── AppRoutes.tsx              # 应用路由配置
├── SystemRoutes.tsx           # 系统管理路由
└── systemRoutePrefetch.ts     # 系统路由预加载
```

## 路由规则

- **懒加载**：页面组件按需加载
- **权限控制**：基于用户角色的路由守卫
- **多租户**：租户隔离的路由前缀

## 路由配置示例

```tsx
// SystemRoutes.tsx
export const systemRoutes: RouteObject[] = [
  {
    path: '/system/users',
    component: lazy(() => import('@/pages/system/users')),
    meta: { permission: 'system:user:view' }
  }
];
```

## 权限守卫

- **登录验证**：未登录重定向到登录页
- **权限校验**：基于菜单权限的访问控制
- **租户校验**：跨租户访问拦截
