import React from 'react';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

export interface SystemSettingsPanelProps {
  panelRef: React.RefObject<HTMLDivElement | null> | React.MutableRefObject<HTMLDivElement | null>;
  mounted: boolean;
  exiting: boolean;
  gridColumns: number | string;
  panelWidth: number;
  groups: Array<{
    key: string;
    name: React.ReactNode;
    groupSpan: number | string;
    itemCols: number;
    items: Array<{ key?: React.Key; path?: string; name?: React.ReactNode }>;
  }>;
  showTenantMeta: boolean;
  planLabel?: string | null;
  expiresLabel?: string | null;
  t: (key: string, options?: any) => any;
  onAnimationEnd: React.AnimationEventHandler<HTMLDivElement>;
  onClose: () => void;
  onNavigate: (path?: string) => void;
  getIcon: (path?: string) => React.ReactNode;
}

export const SystemSettingsPanel: React.FC<SystemSettingsPanelProps> = ({
  panelRef,
  mounted,
  exiting,
  gridColumns,
  panelWidth,
  groups,
  showTenantMeta,
  planLabel,
  expiresLabel,
  t,
  onAnimationEnd,
  onClose,
  onNavigate,
  getIcon,
}) => {
  if (!mounted) return null;

  return (
    <div
      ref={panelRef as React.RefObject<HTMLDivElement>}
      className={`riveredge-system-settings-panel${exiting ? ' riveredge-system-settings-panel--exiting' : ''}`}
      style={
        {
          '--riveredge-system-panel-columns': gridColumns,
          '--riveredge-system-panel-width': `${panelWidth}px`,
        } as React.CSSProperties
      }
      role="dialog"
      aria-modal="false"
      aria-label={t('menu.system')}
      onAnimationEnd={onAnimationEnd}
    >
      <div className="riveredge-system-settings-panel-header">
        <span className="riveredge-system-settings-panel-title">{t('menu.system')}</span>
        <div className="riveredge-system-settings-panel-header-actions">
          {showTenantMeta && (
            <div className="riveredge-system-settings-panel-meta">
              {planLabel && (
                <span className="riveredge-system-settings-panel-meta-item">
                  {t('ui.systemSettingsPanel.versionLabel')}：{planLabel}
                </span>
              )}
              <span className="riveredge-system-settings-panel-meta-item">
                {t('ui.systemSettingsPanel.expiresLabel')}：{expiresLabel}
              </span>
            </div>
          )}
          <Button
            type="text"
            size="small"
            className="riveredge-system-settings-panel-close"
            onClick={onClose}
            title={t('common.close')}
            aria-label={t('common.close')}
            icon={<CloseOutlined />}
          />
        </div>
      </div>
      <div className="riveredge-system-settings-panel-body">
        {groups.map((group) => {
          return (
            <section
              key={group.key}
              className="riveredge-system-settings-group-wrap"
              style={{ gridColumn: `span ${group.groupSpan}` }}
            >
              <div className="riveredge-system-settings-group-title">{group.name as React.ReactNode}</div>
              <div className="riveredge-system-settings-group">
                <div
                  className="riveredge-system-settings-grid"
                  style={{ gridTemplateColumns: `repeat(${group.itemCols}, minmax(0, 1fr))` }}
                >
                  {group.items.map((child) => {
                    return (
                      <button
                        key={String(child.key || child.path)}
                        type="button"
                        className="riveredge-system-settings-item"
                        onClick={() => onNavigate(child.path)}
                        title={typeof child.name === 'string' ? child.name : undefined}
                      >
                        <span
                          className="riveredge-system-settings-item-icon"
                        >
                          {getIcon(child.path)}
                        </span>
                        <span className="riveredge-system-settings-item-label">{child.name as React.ReactNode}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default SystemSettingsPanel;
