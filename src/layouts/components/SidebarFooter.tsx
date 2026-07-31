import React from 'react';
import { Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined } from '@ant-design/icons';

export interface SidebarFooterProps {
  collapsed?: boolean;
  startMenuTheme: any;
  siderFooterToken: any;
  siderTextColor: string;
  isDarkSiderFooter: boolean;
  systemSettingsTriggerRef: React.Ref<any>;
  systemSettingsPanelMounted: boolean;
  systemSettingsPanelExiting: boolean;
  closeSystemSettingsPanelAnimated: () => void;
  openSystemSettingsPanel: () => void;
  onToggleCollapsed: (collapsed: boolean) => void;
  t: (key: string, options?: any) => any;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  collapsed,
  startMenuTheme,
  siderFooterToken,
  siderTextColor,
  isDarkSiderFooter,
  systemSettingsTriggerRef,
  systemSettingsPanelMounted,
  systemSettingsPanelExiting,
  closeSystemSettingsPanelAnimated,
  openSystemSettingsPanel,
  onToggleCollapsed,
  t,
}) => {
  const dividerColor = isDarkSiderFooter
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(0, 0, 0, 0.12)';
  const settingsBtnBg = startMenuTheme.settingsBtnBg;
  const settingsBtnBorder = startMenuTheme.settingsBtnBorder;
  const settingsAccentColor = startMenuTheme.settingsBtnColor;
  const collapseBtnBg = String(siderFooterToken.colorFillSecondary);
  const collapseBtnBorder = String(siderFooterToken.colorSplit);
  const collapseChromeColor = siderTextColor;

  return (
    <div
      style={{
        padding: '8px',
        borderTop: `1px solid ${dividerColor}`,
      }}
    >
      <div
        className="riveredge-footer-btns"
        style={{
          display: 'flex',
          gap: 8,
          flexDirection: collapsed ? 'column' : 'row',
        }}
      >
        <div style={{ flex: 3 }}>
          <Button
            ref={systemSettingsTriggerRef}
            className="riveredge-footer-settings-btn"
            type="default"
            icon={<SettingOutlined style={{ color: settingsAccentColor }} />}
            onClick={() => {
              if (systemSettingsPanelExiting) return;
              if (systemSettingsPanelMounted) {
                closeSystemSettingsPanelAnimated();
              } else {
                openSystemSettingsPanel();
              }
            }}
            style={{
              color: settingsAccentColor,
              backgroundColor: settingsBtnBg,
              border: `1px solid ${settingsBtnBorder}`,
              minHeight: 34,
            }}
            title={t('ui.sidebar.systemSettings')}
            aria-expanded={!!systemSettingsPanelMounted && !systemSettingsPanelExiting}
            aria-label={t('ui.sidebar.systemSettings')}
          >
            {!collapsed ? t('ui.sidebar.systemSettingsShort') : null}
          </Button>
        </div>
        <div style={{ flex: 1 }}>
          <Button
            className="riveredge-footer-collapse-btn"
            type="default"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined style={{ color: collapseChromeColor }} />
              ) : (
                <MenuFoldOutlined style={{ color: collapseChromeColor }} />
              )
            }
            onClick={() => onToggleCollapsed(!collapsed)}
            style={{
              color: collapseChromeColor,
              backgroundColor: collapseBtnBg,
              border: `1px solid ${collapseBtnBorder}`,
              minHeight: 34,
            }}
            title={collapsed ? t('ui.sidebar.expand') : t('ui.sidebar.collapse')}
          />
        </div>
      </div>
    </div>

  );
};

export default SidebarFooter;
