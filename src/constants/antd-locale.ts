import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import zhTW from 'antd/locale/zh_TW';
import jaJP from 'antd/locale/ja_JP';
import viVN from 'antd/locale/vi_VN';

// Ant Design 语言包映射（按 i18n 语言代码）
export const ANT_LOCALE_MAP: Record<string, typeof zhCN> = {
  'zh-CN': zhCN,
  'zh': zhCN,
  'zh-Hant': zhTW,
  'en-US': enUS,
  'en': enUS,
  'ja-JP': jaJP,
  'ja': jaJP,
  'vi-VN': viVN,
  'vi': viVN,
};
