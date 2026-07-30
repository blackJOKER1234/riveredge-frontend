# PROJECT KNOWLEDGE BASE

**Generated:** 2026-06-10
**Commit:** 08d90ce9
**Branch:** feature/workflow-editor

## OVERVIEW

Ant Design 6 component overrides for `@redcoast/scada-ant-design`. Wraps antd components (button, tag, tabs, breadcrumb, empty, config-provider) with custom theme tokens. Provides factory-based style generation, CSS-in-JS helpers, and global style overrides.

## STRUCTURE

```
src/antd/
├── component/           # Overridden components
│   ├── breadcrumb/     # Breadcrumb with theme token colors
│   ├── button/         # Button, ButtonRC — themed action buttons
│   ├── config-provider/# ThemeConfigProvider — merges design tokens into antd theme
│   ├── editor/         # ConditionBuilder, AutoComplete2 — condition rule builder + slash-triggered autocomplete
│   ├── empty/          # Empty state with custom webp illustrations
│   ├── fold/           # Fold, FoldTable — collapsible sections
│   ├── icon/           # SvgIcon — SVG icon wrapper
│   ├── tabs/           # TabLabel only (no Tabs wrapper — folder name mismatch)
│   └── tag/            # Tag — status/color tags with theme tokens
├── factory/            # Style factory (antd-style re-export)
│   └── style.ts        # createStyles re-export with RedcoastToken augmentation
├── hook/               # CSS-in-JS helper
│   └── use-style.ts    # Wraps antd-style createStyles with project token types
├── style/              # Global CSS overrides
│   ├── index.css       # Component-level overrides
│   ├── reset.css       # Ant Design reset overrides
│   └── scheduleTimepicker.css  # Schedule timepicker overrides
├── index.ts            # Barrel: component + factory + hook, side-effect style import
└── AGENTS.md           # This file
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Override an antd component | `component/<name>/` | Follow ButtonRC pattern |
| Add component | `component/<name>/` | Create `index.tsx` + optional style.ts |
| Modify theme injection | `component/config-provider/` | ConfigProvider wraps antd + antd-style |
| CSS-in-JS | `hook/use-style.ts` | Wraps antd-style createStyles |
| Re-export createStyles | `factory/style.ts` | RedcoastToken augmentation |
| Global CSS | `style/` | Imported as side effect by `index.ts` |

## EXPORTS

| Symbol | Source | Type |
|--------|--------|------|
| `Button`, `ButtonRC` | `component/button` | Named re-export |
| `ConfigProvider` | `component/config-provider` | Default re-export |
| `Empty`, `ShowEmpty` | `component/empty` | Default + named re-export |
| `Fold`, `FoldTable` | `component/fold` | Named re-export |
| `TabLabel` | `component/tabs` | Named re-export |
| `Tag` | `component/tag` | Default re-export |
| `Breadcrumb`, `BreadcrumbItemType` | `component/breadcrumb` | Wildcard re-export |
| `SvgIcon` | `component/icon` | Named re-export |
| `AutoComplete2` | `component/editor` | Default re-export |
| `ConditionBuilder` | `component/editor` | Default re-export |
| `createStyles` | `factory/style` | Named re-export |
| `useStyle` | `hook/use-style` | Default re-export |

## CONVENTIONS

- Each component override in its own subdirectory under `component/`
- CSS-in-JS via `antd-style` `createStyles` (from `hook/use-style.ts`)
- Theme tokens flow through `ThemeConfigProvider` → antd `ConfigProvider` theme prop
- Global CSS imported as side effect in `index.ts` (not tree-shakeable)
- Types augmented via `declare module "antd-style"` in `factory/style.ts`

## OVERRIDE PATTERN

```
component/<name>/
├── index.tsx    # Wrapped component (antd props + theme tokens)
└── style.ts     # (optional) Custom styles
```

## ANTI-PATTERNS

- Do NOT modify antd source directly — always wrap/override
- Do NOT bypass ThemeConfigProvider for component-level theming
- Do NOT add per-component global CSS — use CSS-in-JS
- Do NOT import from outside the antd subsystem boundary
- Do NOT duplicate token values from `core/theme/token.ts`
- Do NOT add side-effect CSS imports to component-level barrel files — keep in `index.ts`
