# 主题配置 (theme)

## 模块说明

系统主题配置模块，包含主题变量、颜色配置、字体配置等。

## 目录结构

```
theme/
├── index.ts        # 主题入口
├── variables.ts    # CSS 变量定义
└── ...
```

## 核心功能

- **主题变量**：CSS 变量统一管理
- **颜色系统**：主色、辅色、功能色
- **暗色模式**：深色主题支持
- **主题切换**：运行时主题切换

## CSS 变量

```css
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #ff4d4f;
  --font-size-base: 14px;
  --border-radius-base: 4px;
}
```

## 使用方式

```tsx
import { useTheme } from '@/theme';

// 在组件中使用
const { theme, toggleTheme } = useTheme();
```
