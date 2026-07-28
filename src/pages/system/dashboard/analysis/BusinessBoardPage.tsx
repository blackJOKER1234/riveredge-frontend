import React, { useState, useEffect, useRef } from 'react';
import { Button, Tooltip, theme } from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../../../stores/themeStore';
import { SYSTEM_VIEWPORT_OFFSETS, getViewportHeightExpr } from '../../../../components/layout-templates/constants';
import { useConfigStore } from '../../../../stores/configStore';
import { formatDateTime } from '../../../../utils/format';

const EMBED_URL = 'https://lfp.redcoast.info/';

const clockFont =
  '"JetBrains Mono", "SF Mono", "Cascadia Code", Consolas, "Liberation Mono", ui-monospace, monospace';

const BusinessBoardPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(formatDateTime(new Date(), 'YYYY-MM-DD HH:mm:ss'));
  const containerRef = useRef<HTMLDivElement>(null);

  const siteName = (useConfigStore((state) => state.configs['site_name']) as string) || 'RiverEdge SaaS';

  useEffect(() => {
    document.title = siteName;
  }, [siteName]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(formatDateTime(new Date(), 'YYYY-MM-DD HH:mm:ss')), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const themeStyle = useThemeStore((s) => s.resolved.themeStyle);

  return (
    <div
      ref={containerRef}
      style={{
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen
          ? '100vh'
          : getViewportHeightExpr(SYSTEM_VIEWPORT_OFFSETS.BUSINESS_BOARD_PX, {
              compensateHeaderInFullscreen: true,
            }),
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 1000 : 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: themeStyle === 'plain'
          ? `linear-gradient(180deg, #0a1628 0%, #060e20 100%)`
          : `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0, 136, 255, 0.22), transparent 85%),
            radial-gradient(circle at 50% 50%, rgba(0, 136, 255, 0.05), transparent 70%),
            linear-gradient(180deg, #0a1628 0%, #060e20 100%)
          `,
        backgroundColor: '#0a1628',
        boxSizing: 'border-box',
        borderRadius: isFullscreen ? 0 : token.borderRadiusLG || token.borderRadius,
      }}
    >
      {/* 细网格背景装饰 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 208, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 208, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: 'center',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          opacity: 0.8,
        }}
      />

      {/* 顶部标题栏 */}
      {/* <header
        style={{
          position: 'relative',
          zIndex: 10,
          flexShrink: 0,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: `1px solid rgba(0, 208, 255, 0.15)`,
          background: 'linear-gradient(180deg, rgba(0, 136, 255, 0.06), transparent)',
        }}
      >
        <div />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <time
            dateTime={currentTime}
            style={{
              color: '#ffffff',
              fontSize: 18,
              fontWeight: 600,
              fontFamily: '"Varela Round", "Arial Rounded MT Bold", "Microsoft YaHei", sans-serif',
              letterSpacing: 1.5,
              whiteSpace: 'nowrap',
            }}
          >
            {currentTime}
          </time>
          <Tooltip
            title={
              isFullscreen
                ? t('dashboard.businessBoard.exitFullscreen')
                : t('dashboard.businessBoard.fullscreen')
            }
          >
            <Button
              type="text"
              icon={
                isFullscreen ? (
                  <FullscreenExitOutlined style={{ fontSize: 18 }} />
                ) : (
                  <FullscreenOutlined style={{ fontSize: 18 }} />
                )
              }
              onClick={toggleFullscreen}
              style={{ color: '#ffffff' }}
              aria-label={
                isFullscreen
                  ? t('dashboard.businessBoard.exitFullscreen')
                  : t('dashboard.businessBoard.fullscreen')
              }
            />
          </Tooltip>
        </div>
      </header> */}

      {/* 中间主区域：嵌入式 iframe */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <iframe
          src={EMBED_URL}
          title="Embedded Dashboard"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          allow="fullscreen"
        />
      </div>

      {/* 底部信息条 */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
          height: 22,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid rgba(0, 208, 255, 0.12)`,
          background: 'linear-gradient(180deg, transparent, rgba(0, 229, 255, 0.05))',
          fontSize: 10,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: 0.5,
          fontFamily: clockFont,
        }}
      >
        <span>EMBEDDED · EXTERNAL</span>
        <span>{currentTime}</span>
      </div>
    </div>
  );
};

export default BusinessBoardPage;
