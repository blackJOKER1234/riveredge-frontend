# PROJECT KNOWLEDGE BASE

**Generated:** 2026-06-10
**Commit:** 08d90ce9
**Branch:** feature/workflow-editor

## OVERVIEW

Design system core for `@redcoast/scada-ant-design`. Theme tokens (Dark/Light), ThemeProvider + context, `useTheme` hook, TypeScript type definitions, and base CSS styles. Consumed by `antd/` component overrides and SCADA application code.

## STRUCTURE

```
src/core/
├── component/           # ThemeProvider + React context
│   └── theme-provider/ # Props: theme string + themeLib Record; wraps children with token context
├── dts/                # TypeScript type definitions
│   └── type/
│       ├── token.ts    # commonComponentTokens, CustomToken, color token type hierarchy
│       └── theme-lib.ts # ThemeLib — theme token shape exported from theme library
├── hook/               # useTheme hook
│   └── use-theme.ts    # useContext wrapper around context from theme-provider
├── style/              # Global CSS
│   ├── base.css        # Base reset styles
│   └── scrollbar.css   # Custom scrollbar styles
├── theme/              # Token definitions + theme library
│   ├── token.ts        # Default token values (commonComponentTokens shape)
│   ├── Dark.tokens.ts  # Dark theme token overrides
│   ├── Light.tokens.ts # Light theme token overrides
│   ├── theme-lib.ts    # Theme library (darkTheme, lightTheme exports), theme merging logic
│   └── color-mapping.md # Tailwind → design token color translation guide
├── index.ts            # Barrel: re-exports + side-effect CSS imports
└── AGENTS.md           # This file (root) + theme/ subdirectory (reference doc)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Modify theme tokens | `theme/Dark.tokens.ts` or `theme/Light.tokens.ts` | Maps TailwindCSS colors → design tokens |
| Add new token type | `dts/type/token.ts` | commonComponentTokens interface |
| Change ThemeProvider | `component/theme-provider/` | Creates React context, sets scrollbar CSS var |
| Use theme in components | `hook/use-theme.ts` | Returns commonComponentTokens from context |
| Update theme library | `theme/theme-lib.ts` | Exports darkTheme, lightTheme, themeLib |
| View color mapping | `theme/color-mapping.md` | TailwindCSS → Ant Design Token reference |
| Add base styles | `style/` | CSS imported as side effect by index.ts |

## EXPORTS

| Symbol | Source | Type |
|--------|--------|------|
| `ThemeProvider` | `component/theme-provider` | Default export |
| `context` | `component/theme-provider` | Named export (React context) |
| `useTheme` | `hook/use-theme` | Default export |
| `token` | `theme/token` | Default export (default values) |
| `darkTheme`, `lightTheme`, `themeLib` | `theme/theme-lib` | Named exports |
| All type definitions | `dts/type/token`, `dts/type/theme-lib` | Re-exported via barrel chain: core → dts → type |

## CONVENTIONS

- Theme tokens defined in `theme/*.tokens.ts` with Chinese docs, English identifiers
- Color tokens accessed via `useTheme()` hook in components
- Scrollbar background synced from `black["black 10%"]` token via useEffect in ThemeProvider
- Token types tightly coupled to token shapes — update both `dts/type/token.ts` and theme files together
- Side-effect CSS imports in `index.ts` ensure global styles always loaded
- `theme/AGENTS.md` is a reference doc for Chinese→English key renaming history

## ANTI-PATTERNS

- Do NOT use TailwindCSS color literals (`text-[#ADADAD]`) — always use `useTheme()` tokens
- Do NOT bypass ThemeProvider — component must be wrapped to access theme context
- Do NOT import theme tokens from `theme/Dark.tokens.ts` directly — use `theme/theme-lib.ts` exports
- Do NOT add side-effect CSS imports in sub-barrels — keep in `core/index.ts`
- Do NOT modify `theme/AGENTS.md` unless token keys are renamed again
