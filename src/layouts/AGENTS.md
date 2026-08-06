# layouts — Agent 指南

## 全局 Agent 规范

以下规范对本目录及其子目录的所有 Agent 强制生效，优先级高于本文件其余内容。

### 回复语言与交互规范

1. 语言要求：全程使用简体中文回复；除代码片段、专有名词、引用原文外，默认不使用英文输出。
2. 需求回显（绝对强制，不得跳过）：每次用户输入后，首先输出需求回显区块，然后才能执行任何工具或读取任何文件。回显需按主题分类整理为清晰要点，并追加“我已了解规则”。
3. 输入纠错：能确定的输入问题自动修正；语义模糊、逻辑冲突、缺少关键信息或可能导致严重后果时，禁止猜测，必须向用户反问确认。
4. 询问机制：
   - 必须询问：语义模糊、逻辑冲突、重大技术决策（如框架选型、架构方案）。
   - 禁止询问：版本号、依赖库等可从项目文件自主获取的信息；明显可推断的同音字错误。

### 网页搜索

- `web_search` 失效时，改用 `ddg-search` MCP 进行搜索。

### Team 与 Agent 调用

- 探索型任务优先通过子 Agent 处理。
- 工具调用优先使用 haiku 模型；探索型任务与子 Agent 优先使用 haiku 或 `deepseek-v4-flash` 模型。

本目录为应用壳层布局（ProLayout）。对外入口仅 `BasicLayout` 默认导出；拆分子模块时**保持行为不变**，优先做结构整理而非逻辑改写。

## 目录结构

```
src/layouts/
├── BasicLayout.tsx              # 主编排：状态、effect、ProLayout 装配
├── AGENTS.md
├── components/                  # 布局专用 UI 块
│   ├── AuthGuard.tsx
│   ├── LayoutStyles.tsx
│   ├── NotificationDropdown.tsx
│   ├── UserAvatarDropdown.tsx
│   ├── SidebarFooter.tsx
│   ├── SystemSettingsPanel.tsx
│   └── ShortcutHelpModal.tsx
├── config/                      # 静态配置 / 映射
│   ├── menuConfig.ts
│   ├── menuBadges.ts
│   ├── menuIconAliasMap.ts
│   ├── systemSettingsPanel.ts
│   └── userMenu.tsx
├── hooks/
│   ├── useLayoutThemeTokens.ts
│   ├── useSiteLogo.tsx
│   ├── useUserAvatar.ts
│   ├── useHeaderMessages.ts
│   ├── useSystemSettingsPanelController.tsx
│   ├── useLayoutKeyboardShortcuts.ts
│   ├── useLayoutDomChromeEffects.ts
│   ├── useDocumentTitleSync.ts
│   └── useMenuInvalidationOnAuthChange.ts
└── utils/
    ├── safeTranslation.ts
    ├── menuIcons.ts
    ├── colorUtils.ts
    ├── siteLogoCache.ts
    ├── convertMenuTree.ts       # MenuTree → MenuDataItem
    ├── systemSettingsGroups.ts  # 开始菜单分组/宽度/套餐文案
    └── layoutBreadcrumb.ts      # 面包屑 + selectedKeys
```

## 职责边界

| 位置 | 负责 | 不负责 |
|------|------|--------|
| `BasicLayout.tsx` | 全局布局状态、菜单树转换、面包屑、actionsRender 编排、effect、系统设置数据 memo/callback | 大块自洽 JSX 实现细节 |
| `components/*` | 通过 props 接收数据后渲染 | 自行拉全局 store 业务（AuthGuard 除外） |
| `config/*` | 纯配置/映射数据 | React 状态 |
| `utils/*` | 纯函数 / 轻量 hook | UI |

**刻意留在主文件（耦合深，勿强拆）：**

- 菜单过滤与 skeleton、`menuItemRender` / `subMenuItemRender` / `headerContentRender` / `menuExtraRender`
- 全屏与 ProLayout 装配 props（`collapsed` / `siderWidth` / `menuRender` 三联）
- 系统设置面板开关状态与 navigate（分组数据已在 `utils/systemSettingsGroups.ts`，图标名解析在 config，JSX 在 `SystemSettingsPanel`）

**已抽出的纯函数/hook（优先复用，勿复制回主文件）：**

- `utils/convertMenuTree.ts`、`utils/layoutBreadcrumb.ts`、`utils/systemSettingsGroups.ts`
- `hooks/useLayoutThemeTokens.ts`、`useSiteLogo`、`useUserAvatar`、`useHeaderMessages`
- `hooks/useSystemSettingsPanelController.tsx`、`useLayoutKeyboardShortcuts`、`useLayoutDomChromeEffects`
- `hooks/useDocumentTitleSync`、`useMenuInvalidationOnAuthChange`

## 对外契约

- **唯一路由入口**：`src/routes/index.tsx` 默认 import `BasicLayout`。
- **不要改** `BasicLayout` 默认导出路径/名称，除非同步改路由。
- 内部符号（`getMenuIcon`、`getMenuConfig`、`MENU_BADGE_*`、`useSafeTranslation` 等）当前仅本目录使用；移动时用相对路径，项目无 `@/` 别名习惯。
- 应用级鉴权另有 `src/components/auth-guard.tsx`（App Shell）。本目录 `components/AuthGuard.tsx` 是历史布局守卫，改动前先确认是否仍被引用。

## 修改约定

1. **纯结构重构优先**：拆文件时不改业务逻辑、CSS 字面量、hook 依赖数组。
2. **样式**：布局壳样式集中在 `LayoutStyles.tsx`；动态 token/主题色通过 props 传入，勿在子组件再算一套主题。
3. **菜单图标**：新增系统/应用菜单图标时改 `utils/menuIcons.ts`（路径映射优先于名称映射）。
4. **菜单角标**：单据 path → badge key 改 `config/menuBadges.ts`，需与后端 `menu-badge-counts` 一致。
5. **系统菜单硬编码**：平台级菜单树改 `config/menuConfig.ts`；应用菜单仍走统一菜单数据源（DB/manifest）。
6. **import 风格**：相对路径（`./utils/...`、`../stores`），与仓库现有风格一致。
7. **注释掉的代码**：默认原样保留，不借机删除。

## 常见改动入口

| 需求 | 改哪里 |
|------|--------|
| 顶栏消息下拉 UI | `components/NotificationDropdown.tsx` |
| 顶栏头像/用户菜单 UI | `components/UserAvatarDropdown.tsx` |
| 侧栏底部按钮 | `components/SidebarFooter.tsx` |
| 系统设置浮层外观/结构 | `components/SystemSettingsPanel.tsx`（数据仍在 BasicLayout） |
| 布局 CSS 回归（明暗、侧栏色、全屏） | `components/LayoutStyles.tsx` + BasicLayout 传入的 theme props |
| 快捷键帮助文案/条目 | `components/ShortcutHelpModal.tsx` |
| ProLayout 装配、全屏、租户切换、面包屑 | `BasicLayout.tsx` |

## 验证建议

改完布局相关代码后建议：

1. `npx tsc --noEmit --skipLibCheck` 并过滤 `src/layouts/` 无新增错误  
2. 手动冒烟：登录 → 首页 → 侧栏折叠/系统设置浮层 → 通知与头像下拉 → 主题明暗/自定义侧栏色 → `?` 快捷键帮助 → 全屏进出  
3. 中/英文切换下菜单图标与文案无回归  

## 反模式

- 把 `menuItemRender` 等再拆一层却把半个 BasicLayout 状态透传成 20+ props  
- 在 `LayoutStyles` 外再复制一份布局选择器覆盖  
- 为 layouts 子文件引入 `@/` 别名造成与主仓风格分叉  
- 误把 `components/auth-guard` 与 `layouts/components/AuthGuard` 当成同一文件合并  
