/**
 * RiverEdge SaaS 多组织框架 - 统一标签栏组件
 *
 * 提供多标签页管理功能，支持标签的添加、切换、关闭等操作
 */

import type { CSSProperties } from 'react';
import { RouteTransition } from '../route-transition';
import { TabContent } from './TabContent';
import { TabHeader } from './TabHeader';
import { uniTabsStyles } from './styles';
import { useTabScroll } from './useTabScroll';
import { useUniTabsState } from './useUniTabsState';
import type { UniTabsProps } from './types';

/**
 * 统一标签栏组件
 */
export default function UniTabs({ menuConfig, children, isFullscreen = false, onToggleFullscreen }: UniTabsProps) {
  const state = useUniTabsState({ menuConfig });
  const { tabsNavRef, canScrollLeft, canScrollRight, scrollTabs } = useTabScroll(state.tabs);

  // 如果没有标签，直接渲染子组件
  if (state.tabs.length === 0) {
    return (
      <RouteTransition>
        {children}
      </RouteTransition>
    );
  }

  return (
    <>
      <style>{uniTabsStyles({
        tabsBgColor: state.tabsBgColor,
        tabsTextColor: state.tabsTextColor,
        tabRadius: state.tabRadius,
        tabCornerDiameter: state.tabCornerDiameter,
        isFullscreen,
        token: state.token,
      })}</style>
      <div
        className="uni-tabs-wrapper"
        style={{
          '--header-height': isFullscreen ? '0px' : '56px',
          // tabs header 40px + content margin-top 16px = 56px effective vertical occupancy
          '--tabs-height': '56px',
          '--content-margin': '16px',
        } as CSSProperties}
      >
        <TabHeader
          tabs={state.tabs}
          activeKey={state.activeKey}
          tenantHomePath={state.tenantHomePath}
          menuConfig={menuConfig}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
          tabsNavRef={tabsNavRef}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          onTabChange={state.handleTabChange}
          onTabClose={state.handleTabClose}
          onScroll={scrollTabs}
          getTabContextMenu={state.getTabContextMenu}
        />
        <TabContent
          activeKey={state.activeKey}
          refreshKey={state.refreshKey}
          createTabKeys={state.createTabKeys}
          isHMIPage={state.isHMIPage}
          isDashboardScrollPage={state.isDashboardScrollPage}
          isBusinessBoardAnalysisPage={state.isBusinessBoardAnalysisPage}
          isFlushDashboardOuter={state.isFlushDashboardOuter}
        >
          {children}
        </TabContent>
      </div>
    </>
  );
}
