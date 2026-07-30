# 状态管理 (stores)

## 模块说明

Zustand 状态管理模块，包含全局状态、页面状态、主题状态等。

## 目录结构

```
stores/
├── index.ts                      # 导出入口
├── configStore.ts                # 配置状态
├── globalStore.ts                # 全局状态
├── listPageRefreshStore.ts       # 列表页刷新状态
├── savedSearchOrderStorage.ts    # 搜索排序存储
├── savedSearchVersionStore.ts    # 搜索版本存储
├── tabsStorage.ts                # 标签页状态
├── themeStore.ts                 # 主题状态
└── userPreferenceStore.ts        # 用户偏好设置
```

## 核心 Store

| Store | 说明 |
|-------|------|
| globalStore | 全局状态（租户信息、用户信息） |
| themeStore | 主题配置（颜色、字体、布局） |
| userPreferenceStore | 用户偏好（列配置、筛选条件） |
| tabsStorage | 标签页状态（多标签页管理） |

## 使用方式

```tsx
import { useGlobalStore } from '@/stores';

// 在组件中使用
const { tenant, user } = useGlobalStore();
```
