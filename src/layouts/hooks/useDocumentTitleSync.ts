import { useEffect, useState } from 'react';
import type { MenuDataItem } from '@ant-design/pro-components';
import { findMenuTitleWithTranslation } from '../../utils/menuTranslation';
import { resolveCustomPageTitle } from '../../utils/customPageTitle';
import { useConfigStore } from '../../stores/configStore';

export function useDocumentTitleSync(options: {
  pathname: string;
  search: string;
  breadcrumbMenuData: MenuDataItem[];
  t: (key: string, options?: any) => any;
  siteName: string;
  currentUser: any;
}) {
  const { pathname, search, breadcrumbMenuData, t, siteName, currentUser } = options;
  const [customPageLabel, setCustomPageLabel] = useState<string | undefined>();

  /**
   * 根据当前路径设置文档标题（浏览器标签页标题）
   */
  useEffect(() => {
    // 排除登录页等特殊页面
    if (pathname.startsWith('/login') || pathname.startsWith('/infra/login')) {
      return;
    }

    // 获取当前页面的标题（使用 breadcrumbMenuData，保留完整层级结构）
    const pageTitle = findMenuTitleWithTranslation(pathname, breadcrumbMenuData, t);

    // 站点名称统一从 configStore 获取
    const currentSiteName = useConfigStore.getState().getConfig('site_name', 'RiverEdge SaaS') as string;

    const customTitle = resolveCustomPageTitle(pathname, search);
    if (customTitle) {
      document.title = `${customTitle} - ${currentSiteName}`;
      return;
    }

    // 设置文档标题，使用站点名称作为后缀
    if (pageTitle && pageTitle !== t('common.unnamedPage')) {
      document.title = `${pageTitle} - ${currentSiteName}`;
    } else {
      document.title = `${currentSiteName} - ${t('common.docTitleSuffix')}`;
    }
  }, [pathname, search, breadcrumbMenuData, t, siteName, currentUser]);

  /** 路由切换时从缓存恢复详情页单号（标签栏已写入 customPageTitles） */
  useEffect(() => {
    setCustomPageLabel(resolveCustomPageTitle(pathname, search));
  }, [pathname, search]);

  /**
   * 页面加载后通过 riveredge:update-tab-title 推送的单号/名称，同步更新浏览器标签标题
   */
  useEffect(() => {
    const handleUpdateTabTitle = (event: Event) => {
      const { key, path, title } = (event as CustomEvent<{ key?: string; path?: string; title: string }>).detail ?? {};
      if (!title) return;
      const currentKey = pathname + search;
      const matches =
        (key && key === currentKey) ||
        (path && path === pathname) ||
        (path && currentKey.split('?')[0] === path);
      if (!matches) return;
      setCustomPageLabel(title);
      const currentSiteName = useConfigStore.getState().getConfig('site_name', 'RiverEdge SaaS') as string;
      document.title = `${title} - ${currentSiteName}`;
    };
    window.addEventListener('riveredge:update-tab-title', handleUpdateTabTitle);
    return () => window.removeEventListener('riveredge:update-tab-title', handleUpdateTabTitle);
  }, [pathname, search]);

  return { customPageLabel, setCustomPageLabel };
}
