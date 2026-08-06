/**
 * RiverEdge SaaS - UniTabs 内容区
 */

import type { ReactNode } from 'react';
import { RouteTransition } from '../route-transition';
import { TabRouteCache } from './TabRouteCache';

interface TabContentProps {
  children: ReactNode;
  activeKey: string;
  refreshKey: number;
  createTabKeys: string[];
  isHMIPage: boolean;
  isDashboardScrollPage: boolean;
  isBusinessBoardAnalysisPage: boolean;
  isFlushDashboardOuter: boolean;
}

export function TabContent({
  children,
  activeKey,
  refreshKey,
  createTabKeys,
  isHMIPage,
  isDashboardScrollPage,
  isBusinessBoardAnalysisPage,
  isFlushDashboardOuter,
}: TabContentProps) {
  const renderRouteContent = (content: ReactNode) =>
    createTabKeys.length > 0 ? (
      <TabRouteCache
        activeKey={activeKey}
        createTabKeys={createTabKeys}
        refreshToken={refreshKey}
      >
        {content}
      </TabRouteCache>
    ) : (
      <RouteTransition>{content}</RouteTransition>
    );

  return (
        <div
          className={`uni-tabs-content${isDashboardScrollPage ? ' uni-tabs-content-dashboard' : ''}${isBusinessBoardAnalysisPage ? ' uni-tabs-content-business-board' : ''}`}
          key={`content-refresh-${refreshKey}`}
        >
          {isHMIPage ? (
            <div className="uni-tabs-content-hmi-container">
              <div className="uni-tabs-content-hmi-inner">
                {renderRouteContent(children)}
              </div>
            </div>
          ) : isBusinessBoardAnalysisPage ? (
            <div className="uni-tabs-content-board-outer">
              <div className="uni-tabs-content-board-inner">
                {renderRouteContent(children)}
              </div>
            </div>
          ) : (
            <div
              className={`uni-tabs-content-page-outer${isFlushDashboardOuter ? ' uni-tabs-content-page-outer--flush' : ''}`}
            >
              <div className="uni-tabs-content-page-inner">
                {renderRouteContent(children)}
              </div>
            </div>
          )}
        </div>
  );
}
