import { useEffect } from 'react';
import type { RefObject } from 'react';

export function useLayoutDomChromeEffects(options: {
  breadcrumbRef: RefObject<HTMLElement | null>;
  pathname: string;
  setBreadcrumbVisible: (visible: boolean) => void;
  currentUserId?: number;
  currentTenantId?: number;
  isDarkMode: boolean;
  isLightModeLightBg: boolean;
}) {
  const {
    breadcrumbRef,
    pathname,
    setBreadcrumbVisible,
    currentUserId,
    currentTenantId,
    isDarkMode,
    isLightModeLightBg,
  } = options;

  /**
   * 检测面包屑是否换行，如果换行则隐藏
   */
  useEffect(() => {
    const checkBreadcrumbWrap = () => {
      if (!breadcrumbRef.current) {
        setBreadcrumbVisible(true);
        return;
      }

      const breadcrumbElement = breadcrumbRef.current;
      const olElement = breadcrumbElement.querySelector('ol') || breadcrumbElement.querySelector('ul');
      if (!olElement) {
        setBreadcrumbVisible(true);
        return;
      }

      // 检测第一个和最后一个元素是否在同一行
      const firstItem = olElement.querySelector('.ant-breadcrumb-item:first-child');
      const lastItem = olElement.querySelector('.ant-breadcrumb-item:last-child');
      if (firstItem && lastItem) {
        const firstRect = firstItem.getBoundingClientRect();
        const lastRect = lastItem.getBoundingClientRect();
        // 如果最后一个元素在第一个元素下方（允许5px误差），说明换行了
        const isWrapped = lastRect.top > firstRect.top + 5;
        setBreadcrumbVisible(!isWrapped);
      } else {
        setBreadcrumbVisible(true);
      }
    };

    // 延迟检测，确保 DOM 已完全渲染
    const timer = setTimeout(checkBreadcrumbWrap, 100);

    let resizeThrottle: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      if (resizeThrottle) return;
      resizeThrottle = setTimeout(() => {
        resizeThrottle = undefined;
        checkBreadcrumbWrap();
      }, 120);
    };
    window.addEventListener('resize', onResize, { passive: true });

    let moRaf = 0;
    const observer = new MutationObserver(() => {
      if (moRaf) return;
      moRaf = window.requestAnimationFrame(() => {
        moRaf = 0;
        checkBreadcrumbWrap();
      });
    });
    if (breadcrumbRef.current) {
      observer.observe(breadcrumbRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    }

    return () => {
      clearTimeout(timer);
      if (resizeThrottle) clearTimeout(resizeThrottle);
      window.removeEventListener('resize', onResize);
      if (moRaf) cancelAnimationFrame(moRaf);
      observer.disconnect();
    };
  }, [pathname, breadcrumbRef, setBreadcrumbVisible]);

  /**
   * 为分组标题动态添加自定义 className
   * 因为 ProLayout 不会将 className 传递给 type: 'group' 的项
   */
  useEffect(() => {
    const addGroupTitleClassName = () => {
      // 查找所有分组标题元素
      const groupTitles = document.querySelectorAll('.ant-menu-item-group-title');
      groupTitles.forEach((title) => {
        // 检查是否已经添加了 className
        if (!title.classList.contains('riveredge-menu-group-title')) {
          title.classList.add('riveredge-menu-group-title');
        }
      });
    };

    // 初始添加
    addGroupTitleClassName();

    // 使用 MutationObserver 监听 DOM 变化，确保新增的分组标题也能添加 className（合并到 rAF，避免菜单动画/重排时连发同步回调）
    let groupMoRaf = 0;
    const observer = new MutationObserver(() => {
      if (groupMoRaf) return;
      groupMoRaf = window.requestAnimationFrame(() => {
        groupMoRaf = 0;
        addGroupTitleClassName();
      });
    });

    // 观察菜单容器
    const menuContainer = document.querySelector('.ant-pro-sider-menu');
    if (menuContainer) {
      observer.observe(menuContainer, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      if (groupMoRaf) cancelAnimationFrame(groupMoRaf);
      observer.disconnect();
    };
  }, [currentUserId, currentTenantId]); // 用户/租户切换时重建；避免无关字段刷新导致反复挂载 Observer

  /**
   * 动态设置 LOGO 后标题文字颜色（H1元素）- 确保在浅色模式深色背景时与深色模式文字颜色一致
   */
  useEffect(() => {
    const updateLogoTitleColor = () => {
      // 计算应该使用的文字颜色
      const logoTitleColor = isDarkMode
        ? '#ffffff'
        : (isLightModeLightBg ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)');

      // 直接查找 h1 元素（LOGO 后的标题文字）
      const h1Selectors = [
        '.ant-pro-global-header-logo h1',
        '.ant-pro-global-header-logo a h1',
        '.ant-pro-layout-header .ant-pro-global-header-logo h1',
        '.ant-pro-layout-header .ant-pro-global-header-logo a h1',
        '.ant-layout-header .ant-pro-global-header-logo h1',
        '.ant-layout-header .ant-pro-global-header-logo a h1',
      ];

      h1Selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (element instanceof HTMLElement) {
            element.style.setProperty('color', logoTitleColor, 'important');
          }
        });
      });
    };

    // 初始设置
    updateLogoTitleColor();

    // 使用 MutationObserver 监听 DOM 变化，确保新增的元素也能应用颜色（rAF 合并，避免顶栏频繁 attribute 变动时同步重查 DOM）
    let logoMoRaf = 0;
    const observer = new MutationObserver(() => {
      if (logoMoRaf) return;
      logoMoRaf = window.requestAnimationFrame(() => {
        logoMoRaf = 0;
        updateLogoTitleColor();
      });
    });

    // 观察顶栏容器
    const headerContainer = document.querySelector('.ant-pro-layout-header, .ant-layout-header');
    if (headerContainer) {
      observer.observe(headerContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
    }

    return () => {
      if (logoMoRaf) cancelAnimationFrame(logoMoRaf);
      observer.disconnect();
    };
  }, [isDarkMode, isLightModeLightBg]); // 当主题或背景色变化时重新设置
}
