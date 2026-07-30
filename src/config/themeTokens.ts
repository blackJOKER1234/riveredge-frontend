/**
 * Ant Design 响应式主题 Token 配置
 *
 * 根据屏幕尺寸、语言环境和主题算法，生成适配的 Ant Design ConfigProvider theme 对象。
 * 从 app.tsx 中提取，保持渲染层纯净。
 */

import type { ThemeConfig } from 'antd';
import { ENGLISH_UI_FONT_FAMILY } from '../constants/fonts';
import { FORM_LAYOUT } from '../components/layout-templates/constants';

export interface ResponsiveThemeParams {
  algorithm: ThemeConfig['algorithm'];
  token: ThemeConfig['token'];
  isSmall: boolean;
  isEnglishLocale: boolean;
}

const noFocusHalo = {
  activeShadow: 'none',
  errorActiveShadow: 'none',
  warningActiveShadow: 'none',
} as const;

/** 与 @ant-design/pro-layout 侧栏 collapsedWidth=64 一致 */
const PRO_LAYOUT_SIDER_COLLAPSED_WIDTH = 64;

export function buildResponsiveThemeConfig(params: ResponsiveThemeParams): ThemeConfig {
  const { algorithm, token, isSmall, isEnglishLocale } = params;

  return {
    algorithm,
    token: {
      ...token,
      ...(isEnglishLocale ? { fontFamily: ENGLISH_UI_FONT_FAMILY } : {}),
      controlOutlineWidth: 0,
      controlOutline: 'transparent',
      paddingContentHorizontal: isSmall ? 10 : 16,
      paddingContentVertical: isSmall ? 10 : 16,
      padding: isSmall ? 12 : 16,
      margin: isSmall ? 12 : 16,
    },
    components: {
      Menu: {
        collapsedWidth: PRO_LAYOUT_SIDER_COLLAPSED_WIDTH,
      },
      Input: noFocusHalo,
      InputNumber: noFocusHalo,
      Select: {
        activeOutlineColor: 'transparent',
      },
      DatePicker: noFocusHalo,
      Cascader: {
        activeOutlineColor: 'transparent',
      },
      TreeSelect: {
        activeOutlineColor: 'transparent',
      },
      Form: {
        itemMarginBottom: FORM_LAYOUT.ITEM_MARGIN_BOTTOM,
      },
    },
  };
}
