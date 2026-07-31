import React from 'react';
import { Modal, Typography, Space } from 'antd';
import { CODE_FONT_FAMILY } from '../../constants/fonts';

export interface ShortcutHelpModalProps {
  open: boolean;
  onCancel: () => void;
  isDarkMode: boolean;
  t: (key: string, options?: any) => any;
}

export const ShortcutHelpModal: React.FC<ShortcutHelpModalProps> = ({
  open,
  onCancel,
  isDarkMode,
  t,
}) => {
  return (
    <Modal
      title={t('common.shortcutHelpTitle')}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={420}
      centered
    >
      <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
        {t('common.shortcutHelpIntro')}
      </Typography.Paragraph>
      {[
        { keys: '/', desc: t('common.shortcutSearch') },
        { keys: 'Ctrl + K', desc: t('common.shortcutSearch') },
        { keys: 'Alt + N', desc: t('common.shortcutNew') },
        { keys: 'Ctrl + S', desc: t('common.shortcutSubmit') },
        { keys: '?', desc: t('common.shortcutHelp') },
      ].map(({ keys, desc }) => {
          const keyParts = keys.split(/\s*\+\s*/).map((s: string) => s.trim());
          const keyStyle: React.CSSProperties = {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5px 10px',
            borderRadius: 6,
            background: 'var(--river-divider-color)',
            border: '1px solid var(--river-border-color)',
            boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.08)',
            fontSize: 12,
            fontFamily: CODE_FONT_FAMILY,
            fontWeight: 500,
            color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.65)',
          };
          return (
            <div key={keys} style={{ padding: '6px 0' }}>
              <Space align="center">
                <Space size={4}>
                  {keyParts.map((part, i) => (
                    <kbd key={i} style={keyStyle}>
                      {part}
                    </kbd>
                  ))}
                </Space>
                <span>{desc}</span>
              </Space>
            </div>
          );
        })}
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {t('common.shortcutHelpHint')}
      </Typography.Text>
    </Modal>
  );
};

export default ShortcutHelpModal;
