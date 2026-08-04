import React from 'react'
import type { MenuDataItem } from '@ant-design/pro-components'
import UniTabs from '../../components/uni-tabs'
import { RouteTransition } from '../../components/route-transition'

export interface LayoutPageBodyProps {
  isMobileOrTablet: boolean
  filteredMenuData: MenuDataItem[]
  isFullscreen: boolean
  onToggleFullscreen: () => void
  children: React.ReactNode
}

/** ProLayout 内容区：移动端路由过渡 / 桌面 UniTabs */
export const LayoutPageBody: React.FC<LayoutPageBodyProps> = ({
  isMobileOrTablet,
  filteredMenuData,
  isFullscreen,
  onToggleFullscreen,
  children,
}) => {
  if (isMobileOrTablet) {
    return (
      <div className="box-border flex flex-col flex-auto h-full min-h-0 overflow-x-hidden overflow-y-auto">
        <div className="flex flex-col flex-auto">
          <RouteTransition>{children}</RouteTransition>
        </div>
      </div>
    )
  }

  return (
    <UniTabs
      menuConfig={filteredMenuData}
      isFullscreen={isFullscreen}
      onToggleFullscreen={onToggleFullscreen}
    >
      <div className="flex min-h-0 flex-auto flex-col overflow-clip p-4 bg-(--ant-colorBgContainer)">
        <div className="uni-page-body-inner flex max-h-full h-full min-h-0 flex-1 flex-col overflow-clip p-4 rounded-(--ant-borderRadius) bg-(--ant-colorBgLayout)">
          {children}
        </div>
      </div>
    </UniTabs>
  )
}

export default LayoutPageBody
