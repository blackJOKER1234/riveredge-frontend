import React from 'react';
import { Breadcrumb, Divider } from 'antd';
import type { NavigateFunction } from 'react-router-dom';
import { HeaderQuickEntryPopover } from '../../components/quick-entry';
import type { LayoutBreadcrumbItem } from '../utils/layoutBreadcrumb';

export interface LayoutHeaderContentProps {
  isMobileOrTablet: boolean;
  isLightModeLightBg: boolean;
  breadcrumbRef: React.RefObject<HTMLDivElement | null>;
  breadcrumbVisible: boolean;
  breadcrumbItems: LayoutBreadcrumbItem[];
  navigate: NavigateFunction;
}

/** 顶栏中部：快捷入口 + 面包屑 */
export const LayoutHeaderContent: React.FC<LayoutHeaderContentProps> = ({
  isMobileOrTablet,
  isLightModeLightBg,
  breadcrumbRef,
  breadcrumbVisible,
  breadcrumbItems,
  navigate,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 12 }}>
      {/* 分割线 - 仅在 PC 端显示 */}
      {/* {!isMobileOrTablet && (
        <Divider
          orientation="vertical"
          style={{
            height: '20px',
            margin: '4px 0 0 2px',
            borderColor: isLightModeLightBg ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.25)',
            alignSelf: 'center',
            verticalAlign: 'middle',
          }}
        />
      )} */}
      {!isMobileOrTablet && (
        <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: -8 }}>
          <HeaderQuickEntryPopover isLightModeLightBg={isLightModeLightBg} />
        </span>
      )}
      <div ref={breadcrumbRef as React.RefObject<HTMLDivElement>} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Breadcrumb
          style={{
            display: breadcrumbVisible ? 'flex' : 'none',
            alignItems: 'center',
            maxHeight: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
          items={breadcrumbItems.map((item, index) => ({
            title: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, lineHeight: '1.5', verticalAlign: 'middle' }}>
                {index === breadcrumbItems.length - 1 || index === 0 ? (
                  <span
                    className={index === breadcrumbItems.length - 1 ? 'riveredge-breadcrumb-active' : undefined}
                    style={{
                      color: index === 0 ? 'var(--ant-colorTextSecondary)' : 'var(--ant-colorText)',
                      fontWeight: 400,
                      lineHeight: '1.5',
                      verticalAlign: 'middle',
                    }}
                  >
                    {item.title}
                  </span>
                ) : (
                  <a
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                      }
                    }}
                    style={{ cursor: 'pointer', lineHeight: '1.5', verticalAlign: 'middle' }}
                  >
                    {item.title}
                  </a>
                )}
              </span>
            ),
            menu: item.menu,
          }))}
        />
      </div>
    </div>
  );
};

export default LayoutHeaderContent;
