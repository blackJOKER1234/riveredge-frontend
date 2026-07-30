# 登录认证 (login)

## 模块说明

用户登录认证模块，支持账号密码登录、短信登录、扫码登录等。

## 目录结构

```
pages/login/
└── index.tsx    # 登录页面
```

## 登录方式

| 方式 | 说明 |
|------|------|
| 账号密码 | 用户名+密码登录 |
| 短信登录 | 手机号+验证码登录 |
| 扫码登录 | 企业微信/钉钉扫码 |
| SSO登录 | 单点登录跳转 |

## 技术要点

- **Token 管理**：JWT Token 存储与刷新
- **记住登录**：Remember Me 功能
- **安全校验**：登录失败次数限制
- **多因素认证**：短信/邮件验证码

## API

- `POST /auth/login` - 用户登录
- `POST /auth/logout` - 用户登出
- `POST /auth/refresh` - 刷新 Token
- `GET /auth/captcha` - 获取验证码
