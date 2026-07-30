/**
 * Ant Design 组件级主题 Token 覆盖
 *
 * 从 ant-design 子项目抽取并剥离 redcoastToken 依赖，
 * 与 themeStore.resolved.token 对齐。
 */

import type { ThemeConfig } from 'antd'

export interface BuildComponentTokenInput {
  colorPrimary: string
  isDark: boolean
}

export function buildComponentTokens(
  t: BuildComponentTokenInput
): NonNullable<ThemeConfig['components']> {
  const isDark = t.isDark

  return {
    Checkbox: {},
    Upload: {
      marginXS: 0,
    },
    Alert: {},
    Form: {
      labelRequiredMarkColor: '#ff4d4f',
    },
    Popconfirm: {
      fontWeightStrong: 400,
    },
    Layout: {
      footerPadding: '12px 0',
    },
    Message: {
      contentPadding: '9px 12px',
    },
    Menu: {
      itemSelectedBg: 'rgba(9,88,217,0.04)',
      itemSelectedColor: t.colorPrimary,
      itemColor: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.88)',
      itemHoverBg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
      iconSize: 20,
      itemHeight: 44,
      controlHeightLG: 200,
      horizontalItemHoverBg: isDark ? 'rgba(255,255,255,0.04)' : '#f5f9fe',
      collapsedIconSize: 20,
      iconMarginInlineEnd: 8,
      horizontalLineHeight: '44px',
      colorSplit: '#ffffff',
      subMenuItemBg: '#ffffff',
      controlItemBgHover: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    },
    Tabs: {
      colorBorderSecondary: isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.20)',
      horizontalItemPadding: '3px 28px 13px 28px',
      horizontalItemGutter: 12,
      itemColor: isDark ? 'rgba(255,255,255,0.48)' : 'rgba(0,0,0,0.48)',
      inkBarColor: t.colorPrimary,
    },
    Table: {
      headerColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
      headerSplitColor: 'transparent',
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      colorText: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.88)',
      selectionColumnWidth: '20px',
      fontWeightStrong: 400,
      rowSelectedBg: isDark ? 'rgba(255,255,255,0.04)' : '#f5f9fe',
      rowHoverBg: isDark ? 'rgba(255,255,255,0.04)' : '#f5f9fe',
      rowSelectedHoverBg: isDark ? 'rgba(255,255,255,0.04)' : '#f5f9fe',
      cellPaddingInline: 8,
      headerSortActiveBg: 'none',
      cellPaddingBlock: 14,
    },
    Popover: {
      padding: 8,
    },
    Select: {
      optionHeight: 36,
      optionPadding: '8px',
      fontWeightStrong: 400,
      paddingXXS: 9,
    },
    DatePicker: {
      paddingInline: 20,
      cellHeight: 24,
      cellWidth: 24,
    },
    QRCode: {},
    Drawer: {
      colorBgMask: '',
    },
    Modal: {
      marginXS: 20,
    },
    InputNumber: {
      paddingInline: 20,
    },
    Pagination: {
      itemSize: 36,
    },
  }
}
