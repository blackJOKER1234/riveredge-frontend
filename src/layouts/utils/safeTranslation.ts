import { useTranslation } from 'react-i18next';

// 安全的翻译 hook，避免多语言初始化失败导致应用崩溃
export const useSafeTranslation = () => {
  try {
    return useTranslation();
  } catch (error) {
    console.warn('i18n initialization failed:', error);
    // 返回最小可用翻译函数，保证页面可渲染
    return {
      t: (key: string, options?: any) => {
        // 如果是中文 key，直接返回
        if (key.includes('zh-CN') || key.includes('中文')) return key;
        // 其他情况返回英文版本或原始 key
        return key;
      },
      i18n: {
        language: 'zh-CN',
        changeLanguage: () => Promise.resolve(),
      }
    };
  }
};
