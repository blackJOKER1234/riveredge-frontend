import { useCallback, useEffect, useRef, useState } from 'react';
import type { TabItem } from './types';

export function useTabScroll(tabs: TabItem[]) {
  const tabsNavRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /**
   * 检查是否可以滚动
   */
  const checkScrollability = useCallback(() => {
    if (!tabsNavRef.current) return;

    // Ant Design Tabs 的滚动容器是 .ant-tabs-nav-wrap，而不是 .ant-tabs-nav-list
    const navWrapElement = tabsNavRef.current.querySelector('.ant-tabs-nav-wrap') as HTMLElement;
    if (!navWrapElement) return;

    const { scrollLeft, scrollWidth, clientWidth } = navWrapElement;

    // 允许1px的误差，避免浮点数精度问题
    // 可以向左滚动：当前滚动位置大于0
    const canScrollLeftValue = scrollLeft > 1;

    // 可以向右滚动：内容宽度大于容器宽度，且当前滚动位置未到达最右边
    // 当标签占满时，scrollWidth <= clientWidth，此时 canScrollRight 为 false
    const canScrollRightValue = scrollWidth > clientWidth + 1 && (scrollLeft + clientWidth) < scrollWidth - 1;

    setCanScrollLeft(canScrollLeftValue);
    setCanScrollRight(canScrollRightValue);
  }, []);

  /**
   * 滚动标签栏
   */
  const scrollTabs = useCallback((direction: 'left' | 'right') => {
    if (!tabsNavRef.current) return;

    // Ant Design Tabs 的滚动容器是 .ant-tabs-nav-wrap
    const navWrapElement = tabsNavRef.current.querySelector('.ant-tabs-nav-wrap') as HTMLElement;
    if (!navWrapElement) return;

    const scrollAmount = 200; // 每次滚动200px
    const newScrollLeft = direction === 'left'
      ? navWrapElement.scrollLeft - scrollAmount
      : navWrapElement.scrollLeft + scrollAmount;

    navWrapElement.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });

    // 滚动后重新检查状态
    setTimeout(() => {
      checkScrollability();
    }, 100);
  }, [checkScrollability]);

  /**
   * 监听标签变化和窗口大小变化，检查滚动状态
   */
  useEffect(() => {
    // 使用多个延迟检查，确保DOM完全渲染后再检查
    checkScrollability();
    const timer1 = setTimeout(checkScrollability, 50);
    const timer2 = setTimeout(checkScrollability, 100);
    const timer3 = setTimeout(checkScrollability, 200);

    const handleResize = () => {
      checkScrollability();
    };

    window.addEventListener('resize', handleResize);

    // 监听滚动事件 - 使用 .ant-tabs-nav-wrap 作为滚动容器
    const navWrapElement = tabsNavRef.current?.querySelector('.ant-tabs-nav-wrap') as HTMLElement;
    if (navWrapElement) {
      navWrapElement.addEventListener('scroll', checkScrollability);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('resize', handleResize);
      if (navWrapElement) {
        navWrapElement.removeEventListener('scroll', checkScrollability);
      }
    };
  }, [tabs, checkScrollability]);

  return { tabsNavRef, canScrollLeft, canScrollRight, scrollTabs };
}
