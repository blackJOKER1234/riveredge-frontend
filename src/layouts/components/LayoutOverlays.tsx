import React from 'react';
import TechStackModal from '../../components/tech-stack-modal';
import ThemeEditor from '../../components/theme-editor';
import AiAssistant from '../../components/ai-assistant';
import IterationFloatButton from '../../components/iteration-float-button';
import { ShortcutHelpModal } from './ShortcutHelpModal';
import { SystemSettingsPanel } from './SystemSettingsPanel';

const TenantBootstrapModal = React.lazy(() => import('../../components/tenant-bootstrap-modal'));

export interface LayoutOverlaysProps {
  techStackModalOpen: boolean;
  setTechStackModalOpen: (open: boolean) => void;
  themeEditorOpen: boolean;
  setThemeEditorOpen: (open: boolean) => void;
  aiAssistantMounted: boolean;
  aiAssistantOpen: boolean;
  setAiAssistantOpen: (open: boolean) => void;
  shortcutHelpOpen: boolean;
  setShortcutHelpOpen: (open: boolean) => void;
  isDarkMode: boolean;
  t: (key: string, options?: any) => any;
  // system settings panel
  systemSettingsPanelMounted: boolean;
  systemSettingsPanelExiting: boolean;
  systemSettingsPanelRef: React.RefObject<HTMLDivElement | null>;
  systemSettingsPanelGridColumns: number | string;
  systemSettingsPanelWidth: number;
  systemSettingsGroups: any[];
  showSystemSettingsTenantMeta: boolean;
  systemSettingsPlanLabel?: string | null;
  systemSettingsExpiresLabel?: string | null;
  handleSystemSettingsPanelAnimationEnd: React.AnimationEventHandler<HTMLDivElement>;
  closeSystemSettingsPanelAnimated: () => void;
  handleSystemSettingsNavigate: (path?: string) => void;
  getSystemPanelIcon: (path?: string) => React.ReactNode;
}

/** BasicLayout 底部浮层/弹层集合 */
export const LayoutOverlays: React.FC<LayoutOverlaysProps> = ({
  techStackModalOpen,
  setTechStackModalOpen,
  themeEditorOpen,
  setThemeEditorOpen,
  aiAssistantMounted,
  aiAssistantOpen,
  setAiAssistantOpen,
  shortcutHelpOpen,
  setShortcutHelpOpen,
  isDarkMode,
  t,
  systemSettingsPanelMounted,
  systemSettingsPanelExiting,
  systemSettingsPanelRef,
  systemSettingsPanelGridColumns,
  systemSettingsPanelWidth,
  systemSettingsGroups,
  showSystemSettingsTenantMeta,
  systemSettingsPlanLabel,
  systemSettingsExpiresLabel,
  handleSystemSettingsPanelAnimationEnd,
  closeSystemSettingsPanelAnimated,
  handleSystemSettingsNavigate,
  getSystemPanelIcon,
}) => {
  return (
    <>
      {systemSettingsPanelMounted && (
        <SystemSettingsPanel
          panelRef={systemSettingsPanelRef}
          mounted={systemSettingsPanelMounted}
          exiting={systemSettingsPanelExiting}
          gridColumns={systemSettingsPanelGridColumns}
          panelWidth={systemSettingsPanelWidth}
          groups={systemSettingsGroups}
          showTenantMeta={showSystemSettingsTenantMeta}
          planLabel={systemSettingsPlanLabel}
          expiresLabel={systemSettingsExpiresLabel}
          t={t}
          onAnimationEnd={handleSystemSettingsPanelAnimationEnd}
          onClose={closeSystemSettingsPanelAnimated}
          onNavigate={handleSystemSettingsNavigate}
          getIcon={getSystemPanelIcon}
        />
      )}

      {/* 技术栈信息弹窗 */}
      <TechStackModal
        open={techStackModalOpen}
        onCancel={() => setTechStackModalOpen(false)}
      />

      {/* 主题编辑面板 */}
      <ThemeEditor
        open={themeEditorOpen}
        onClose={() => setThemeEditorOpen(false)}
        onThemeUpdate={(_themeConfig) => {
          // 主题更新回调（可选）
        }}
      />

      {/* AI 助手：挂载后保持实例，避免路由切换重复检测 DeepSeek 状态 */}
      {aiAssistantMounted && (
        <AiAssistant
          open={aiAssistantOpen}
          onClose={() => setAiAssistantOpen(false)}
        />
      )}

      {/* 新手引导 */}
      {/* <OnboardingGuide /> */}

      {/* 键盘快捷键帮助 */}
      <ShortcutHelpModal
        open={shortcutHelpOpen}
        onCancel={() => setShortcutHelpOpen(false)}
        isDarkMode={isDarkMode}
        t={t}
      />

      {/* 新组织首次登录：应用 + 必备系统初始项引导 */}
      <React.Suspense fallback={null}>
        <TenantBootstrapModal />
      </React.Suspense>

      {/* 右下角悬浮按钮：迭代提示与意见反馈 */}
      <IterationFloatButton />
    </>
  );
};

export default LayoutOverlays;
