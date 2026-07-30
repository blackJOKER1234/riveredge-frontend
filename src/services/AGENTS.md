# API 服务层 (services)

## 模块说明

统一 API 服务层，封装所有后端接口调用。

## 目录结构

```
services/
├── api.ts           # API 基础配置
├── apiManagement.ts # API 管理
├── auth.ts          # 认证相关
├── user.ts          # 用户管理
├── tenant.ts        # 租户管理
├── role.ts          # 角色管理
├── department.ts    # 部门管理
├── file.ts          # 文件上传下载
├── websocket.ts     # WebSocket 连接
└── ...              # 其他业务 API
```

## API 模式

```typescript
// 每个服务文件导出对应域的 API 方法
export const userService = {
  list: (params: UserQuery) => api.get('/users', { params }),
  detail: (id: string) => api.get(`/users/${id}`),
  create: (data: UserForm) => api.post('/users', data),
  update: (id: string, data: UserForm) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};
```

## 统一处理

- **错误处理**：统一错误提示与日志
- **请求拦截**：Token 自动注入
- **响应拦截**：数据解包与异常处理
- **重试机制**：失败请求自动重试
