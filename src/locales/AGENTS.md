# 国际化 (locales)

## 模块说明

多语言资源管理，支持中英文等多语言切换。

## 目录结构

```
locales/
├── zh-CN/      # 中文资源
├── en-US/      # 英文资源
├── i18n.ts     # i18n 配置
└── ...
```

## 核心功能

- **语言切换**：运行时语言切换
- **自动检测**：浏览器语言自动检测
- **动态加载**：语言包按需加载
- **复数规则**：不同语言的复数规则

## 使用方式

```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<span>{t('common.save')}</span>
```

## 配置

- 默认语言：`zh-CN`
- 备选语言：`en-US`
- 语言切换存储在用户偏好设置中
