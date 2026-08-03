/**
 * RiverEdge SaaS - UniTabs 样式
 *
 * 使用项目现有 antd-style（createStyles）方案：
 * - 样式规则全部收敛在 css 模板中，由 emotion/antd cssinjs 管理注入
 * - 运行时主题值（标签栏背景、文字色、圆角）作为 createStyles 的 props 传入
 * - antd token（colorPrimary、colorText 等）直接由 antd-style 注入
 */

import { createStyles } from '../../ant-design/antd/factory/style'

export interface UniTabsStyleVars {
  tabsBgColor: string
  tabsTextColor: string
  tabRadius: number
  tabCornerDiameter: number
  isFullscreen: boolean
}

export const useUniTabsStyles = createStyles(({ css, token }, vars: UniTabsStyleVars) => {
  const { tabsBgColor, tabsTextColor, tabRadius, tabCornerDiameter, isFullscreen } = vars
  const isWhiteText = tabsTextColor === '#ffffff'
  const textSoft = isWhiteText ? 'rgba(255, 255, 255, 0.85)' : tabsTextColor
  const textFaint = isWhiteText ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.45)'
  const accent = isWhiteText ? 'rgba(255, 255, 255, 0.85)' : token.colorPrimary
  const accentHover = isWhiteText ? 'rgba(255, 255, 255, 1)' : 'var(--ant-colorPrimaryHover)'
  const dividerSoft = isWhiteText ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.06)'
  const shadowSoft = isWhiteText ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'
  const menuColor = isWhiteText ? 'rgba(255, 255, 255, 0.85)' : token.colorText
  const menuHoverColor = isWhiteText ? '#ffffff' : token.colorText
  const menuHoverBg = isWhiteText ? 'rgba(255, 255, 255, 0.15)' : token.colorFillSecondary
  const radiusLg = `${typeof token.borderRadius === 'number' ? token.borderRadius : 8}px`
  const contentGap = isFullscreen ? '16px' : '0px'
  const headerHeightFallback = isFullscreen ? '0px' : '56px'

  return {
    wrapper: css`
      &.uni-tabs-wrapper {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: visible !important;

        /* 标签栏样式优化 - 支持自定义背景色（支持透明度） */
        .uni-tabs-header .ant-tabs {
          margin: 0 !important;
          margin-bottom: 0 !important;
          border: none !important;
          border-bottom: none !important;
          box-shadow: none !important;
          outline: none !important;
          background: ${tabsBgColor} !important;
          padding-top: 2px !important;
          padding-left: 0 !important;
        }
        /* 覆盖 Ant Design Tabs 原生下边框样式 */
        .uni-tabs-container .ant-tabs-nav {
          margin: 0 !important;
          margin-bottom: 0 !important;
          padding: 0 !important;
          padding-bottom: 0 !important;
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          height: 38px !important;
          overflow: visible !important;
        }
        .uni-tabs-container .ant-tabs-nav::before {
          display: none !important;
          border-bottom: none !important;
        }
        .uni-tabs-container .ant-tabs-nav-wrap {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          overflow-x: auto !important;
          /* 不设置 overflow-y，避免与 overflow-x: auto 冲突导致 visible 被计算为 auto */
          height: 38px !important;
          /* 移除 clip-path: none，允许 Ant Design 原生阴影显示 */
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
          box-sizing: border-box !important;
          position: relative; /* 为阴影定位提供参考 */
          /* 隐藏滚动条且不占用高度 */
          scrollbar-width: none !important; /* Firefox */
          -ms-overflow-style: none !important; /* IE/Edge */
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        /* 隐藏 Chrome/Safari/Webkit 滚动条且不占用高度 */
        .uni-tabs-container .ant-tabs-nav-wrap::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        /* 禁用 Ant Design 原生左侧阴影，使用自定义阴影适配小箭头按钮 */
        /* 注意：当 can-scroll-left 时，会通过更具体的选择器覆盖此规则显示阴影 */
        .uni-tabs-container .ant-tabs-nav-wrap::before {
          display: none !important;
          border-bottom: none !important;
        }
        .uni-tabs-container .ant-tabs-nav-list {
          border-bottom: none !important;
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
          overflow: visible !important;
          height: 38px !important;
          display: flex !important;
          align-items: flex-end !important;
          justify-content: flex-start !important;
          margin-left: 8px !important;
          margin-right: 0 !important;
          width: max-content !important;
          gap: 8px !important;
        }
        /* 覆盖所有可能的边框颜色 #F0F0F0 */
        .uni-tabs-container .ant-tabs-tab {
          margin: 0 !important;
          padding: 0 12px !important;
          border: 1px solid var(--ant-colorBorder, #d9d9d9) !important;
          border-radius: 9999px !important;
          background: transparent !important;
          box-shadow: none !important;
          position: relative;
          overflow: visible !important;
          height: 36px !important;
          line-height: 22px !important;
          display: flex !important;
          align-items: center !important;
          box-sizing: border-box !important;
        }
        .uni-tabs-container .ant-tabs-tab-btn {
          display: flex !important;
          align-items: center !important;
          line-height: 22px !important;
          padding: 0 4px !important;
          border-radius: 9999px !important;
        }
        .uni-tabs-container .ant-tabs-tab-remove {
          display: flex !important;
          align-items: center !important;
          line-height: 22px !important;
          padding: 2px !important;
          border-radius: 9999px !important;
          transition: background 0.2s ease, color 0.2s ease !important;
        }
        .uni-tabs-container .ant-tabs-tab-remove:hover {
          background: transparent !important;
        }
        .uni-tabs-container .ant-tabs-tab:not(.ant-tabs-tab-active)::after {
          display: none !important;
        }
        .uni-tabs-container .ant-tabs-tab:last-child::after {
          display: none !important;
        }
        .uni-tabs-container .ant-tabs-content-holder {
          display: none;
        }
        .uni-tabs-container .ant-tabs-ink-bar {
          display: none !important;
        }
        .uni-tabs-container .ant-tabs-tab-active {
          background: transparent !important;
          border: 1px solid var(--ant-colorPrimary, #1677ff) !important;
          border-radius: 9999px !important;
          color: var(--ant-colorPrimary, #1677ff) !important;
          padding: 0 14px !important;
          margin: 0 !important;
          position: relative;
          z-index: 2;
          box-shadow: none !important;
          overflow: visible !important;
          height: 36px !important;
          box-sizing: border-box !important;
          display: flex !important;
          align-items: center !important;
        }
        .uni-tabs-container .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: var(--ant-colorPrimary, #1677ff) !important;
          font-weight: 500 !important;
        }
        .uni-tabs-container .ant-tabs-tab-active .ant-tabs-tab-remove {
          color: var(--ant-colorPrimary, #1677ff) !important;
          transition: background 0.2s ease, color 0.2s ease !important;
        }
                /* 确保单个标签时也没有底部间距 */
        .uni-tabs-container .ant-tabs-nav:has(.ant-tabs-tab:only-child) {
          margin-bottom: 0 !important;
        }
        .uni-tabs-container .ant-tabs-nav:has(.ant-tabs-tab:only-child) .ant-tabs-tab-active {
          margin-bottom: 0px !important;
        }
        /* ==================== 标签栏文字颜色自动适配（根据背景色亮度反色处理） ==================== */
        /* 未激活标签文字颜色 - 根据标签栏背景色自动适配 */
        .uni-tabs-container .ant-tabs-tab:not(.ant-tabs-tab-active) .ant-tabs-tab-btn {
          color: ${textSoft} !important;
          font-weight: normal !important;
        }
          /* 未激活标签分隔线颜色 - 根据标签栏背景色自动适配 */
          .uni-tabs-container .ant-tabs-tab:not(.ant-tabs-tab-active)::after {
            display: none !important;
          }
        /* Chrome 式效果：激活标签文字颜色 - 激活标签使用内容区背景，文字颜色使用默认主题色 */
        .uni-tabs-container .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: var(--ant-colorPrimary, #1677ff) !important;
          font-weight: 500 !important;
        }
        /* 标签关闭按钮颜色 - 根据标签栏背景色自动适配 */
        .uni-tabs-container .ant-tabs-tab:not(.ant-tabs-tab-active) .ant-tabs-tab-remove {
          color: ${textFaint} !important;
          transition: background 0.2s ease, color 0.2s ease !important;
        }
        .uni-tabs-container .ant-tabs-tab:not(.ant-tabs-tab-active) .ant-tabs-tab-remove:hover {
          color: ${tabsTextColor} !important;
        }
        /* 移除标签切换时的过渡动画 */
        .uni-tabs-container .ant-tabs-tab {
          transition: none !important;
        }
        .uni-tabs-container .ant-tabs-ink-bar {
          transition: none !important;
        }

        /* 标签栏头部背景色 - 支持自定义背景色（支持透明度） */
        .uni-tabs-header {
          background: ${tabsBgColor} !important;
          flex-shrink: 0;
          padding-bottom: 0;
          margin-bottom: 0px; /* 移除底部间距，由内容区控制 */
          position: sticky;
          top: 56px; /* ProLayout 顶栏高度 */
          z-index: 10;
          overflow: visible !important;
          border-bottom: none !important;
        }
        /* 确保背景色生效 - 增加选择器优先级，支持深色模式 */
        div.uni-tabs-header {
          background: ${tabsBgColor} !important;
        }
        /* 标签栏容器背景色 - 支持自定义背景色（支持透明度） */
        .uni-tabs-container {
          background: ${tabsBgColor} !important;
        }
        .uni-tabs-container .ant-tabs-nav {
          background: ${tabsBgColor} !important;
        }
        .uni-tabs-container .ant-tabs-nav-wrap {
          background: ${tabsBgColor} !important;
        }
        .uni-tabs-container .ant-tabs-nav-list {
          background: ${tabsBgColor} !important;
        }
        /* 确保单个标签时也没有底部间距 */
        .uni-tabs-container .ant-tabs-nav {
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
        }
        .uni-tabs-container .ant-tabs-nav-list {
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
        }
        /* 当只有一个标签时，确保没有额外间距 */
        .uni-tabs-container .ant-tabs-nav:has(.ant-tabs-tab:only-child) {
          margin-bottom: 0 !important;
        }
        .uni-tabs-container .ant-tabs-nav:has(.ant-tabs-tab:only-child) .ant-tabs-tab-active {
          margin-bottom: 0px !important;
        }
        .uni-tabs-content {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
          background: var(--ant-colorBgLayout);
          margin-right: ${contentGap} !important;
          margin-bottom: ${contentGap} !important;
          margin-left: ${contentGap} !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          box-sizing: border-box !important;
          /* 修复滚动：使用 calc 计算确切的内容区高度（视口 - 顶栏 - 标签栏 - 间距）。
               全屏时四边等距 16px，因此垂直需扣减 32px。 */
          height: calc(100vh - var(--header-height) - 42px - ${contentGap}) !important;
          max-height: calc(100vh - var(--header-height) - 42px - ${contentGap}) !important;
          min-height: calc(
            100vh - var(--header-height, ${headerHeightFallback}) - var(--tabs-height, 56px) - 42px -
              ${contentGap}
          ) !important;
          /* 彻底隐藏滚动条且不占用空间 */
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        /* 工作台：不滚动，边距由内部 DashboardTemplate 控制避免加载抖动 */
        .uni-tabs-content.uni-tabs-content-dashboard {
          overflow: hidden !important;
          margin: 0 !important;
        }

        /* 普通业务页：占满内容区高度，避免 Safari 26 flex 子项高度坍缩 */
        .uni-tabs-content-page-outer {
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          width: 100%;
          height: 100%;
          min-height: 0;
          box-sizing: border-box;
        }
        .uni-tabs-content-page-inner {
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          width: 100%;
          height: 100%;
          min-height: 0;
        }
        /* 布局内页面根节点统一由 CSS 兜底：不逐个改业务页面，强制在 padding 内占满且不越界 */
        .uni-page-body-inner {
          display: flex;
          flex-direction: column;
          min-height: 0;
          height: 100%;
          max-height: 100%;
          overflow: hidden;
        }
        .uni-tabs-content::-webkit-scrollbar {
          display: block !important;
          width: 6px !important;
          height: 6px !important;
        }
        .uni-tabs-content-hmi-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          height: 100%;
          min-height: 0;
          width: 100%;
          box-sizing: border-box;
          padding: 0 16px;
        }
        /* HMI 内层：带圆角的框，裁剪内部 HMI，工业风边框 */
        .uni-tabs-content-hmi-inner {
          flex: 1;
          min-height: 0;
          border-radius: ${radiusLg} !important;
          overflow: hidden !important;
          isolation: isolate;
          contain: layout paint;
          border: 1px solid var(--river-border-color);
        }
        /* 内层直接子元素（HMI 根）适配圆角与宽度 */
        .uni-tabs-content-hmi-inner > * {
          border-radius: inherit;
          max-width: 100%;
          box-sizing: border-box;
        }
        .uni-tabs-content-board-outer {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          width: 100%;
          box-sizing: border-box;
          // padding: 0 16px;
        }
        .uni-tabs-content-board-inner {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          border-radius: ${radiusLg} !important;
          /* visible：避免裁切中间 WebGL 核（略超出时仍完整）；背景与看板同色，圆角外溢不明显 */
          overflow: visible !important;
          isolation: isolate;
          /* 移除边框，使看板内容与背景融为一体 */
          border: none;
        }
        .uni-tabs-content-board-inner > * {
          flex: 1;
          min-height: 0;
          max-width: 100%;
          box-sizing: border-box;
        }
        /* 确保所有元素在滚动条隐藏时不占位 */
        * {
          scrollbar-gutter: auto !important;
        }
        /* 标签栏头部包装器 - 包含滚动按钮 */
        .uni-tabs-header-wrapper {
          display: flex;
          align-items: center;
          position: relative;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          overflow: visible !important;
          overflow-x: visible !important;
          justify-content: flex-start !important;
          overflow-y: visible !important;
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
          z-index: 1;
          pointer-events: none;
        }
        /* 允许按钮和标签栏接收点击事件 */
        .uni-tabs-header-wrapper .uni-tabs-scroll-button,
        .uni-tabs-header-wrapper .uni-tabs-container {
          pointer-events: auto;
        }
        /* 滚动按钮样式 - 根据标签栏背景色自动适配颜色，统一大小和padding */
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button:not(:disabled):not(.ant-btn-disabled):not([disabled]),
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button.ant-btn:not(:disabled):not(.ant-btn-disabled):not([disabled]),
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button.ant-btn-text:not(:disabled):not(.ant-btn-disabled):not(
            [disabled]
          ),
        .uni-tabs-header-wrapper
          button.uni-tabs-scroll-button:not(:disabled):not(.ant-btn-disabled):not([disabled]),
        .uni-tabs-header-wrapper
          button.uni-tabs-scroll-button.ant-btn:not(:disabled):not(.ant-btn-disabled):not(
            [disabled]
          ),
        .uni-tabs-header-wrapper
          button.uni-tabs-scroll-button.ant-btn-text:not(:disabled):not(.ant-btn-disabled):not(
            [disabled]
          ) {
          width: 24px !important; /* 图标14px + 左右padding各5px = 24px */
          height: 40px !important; /* 总高40px */
          padding: 13px 5px !important; /* 上下13px，左右5px，图标14px居中 */
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          border: none !important;
          border-bottom: none !important;
          background: transparent !important;
          box-shadow: none !important;
          color: ${accent} !important;
          cursor: pointer !important;
          pointer-events: auto !important;
          position: relative !important;
          z-index: 2 !important;
          margin-bottom: 0 !important;
          margin-top: 0 !important;
          line-height: 1 !important;
        }
        /* 按钮图标颜色 - 根据标签栏背景色自动适配（深色背景使用浅色图标，浅色背景使用主题色） */
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button:not(:disabled):not(.ant-btn-disabled):not([disabled])
          .anticon,
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button:not(:disabled):not(.ant-btn-disabled):not([disabled])
          .ant-btn-icon,
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button:not(:disabled):not(.ant-btn-disabled):not([disabled])
          span.anticon,
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button.ant-btn:not(:disabled):not(.ant-btn-disabled):not([disabled])
          .anticon,
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button.ant-btn-text:not(:disabled):not(.ant-btn-disabled):not([disabled])
          .anticon,
        .uni-tabs-header-wrapper
          button.uni-tabs-scroll-button:not(:disabled):not(.ant-btn-disabled):not([disabled])
          .anticon,
        .uni-tabs-header-wrapper
          button.uni-tabs-scroll-button.ant-btn:not(:disabled):not(.ant-btn-disabled):not(
            [disabled]
          )
          .anticon,
        .uni-tabs-header-wrapper
          button.uni-tabs-scroll-button.ant-btn-text:not(:disabled):not(.ant-btn-disabled):not(
            [disabled]
          )
          .anticon,
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button:not(:disabled):not(.ant-btn-disabled):not([disabled])
          svg,
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button.ant-btn:not(:disabled):not(.ant-btn-disabled):not([disabled])
          svg,
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button.ant-btn-text:not(:disabled):not(.ant-btn-disabled):not([disabled])
          svg {
          color: ${accent} !important;
          fill: ${accent} !important;
        }
        /* 去掉按钮的所有伪元素和边框 */
        .uni-tabs-header-wrapper .uni-tabs-scroll-button::before,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button::after {
          display: none !important;
        }
        /* 无法点击时：浅灰色 - 覆盖所有可能的样式，统一大小和padding */
        .uni-tabs-header-wrapper .uni-tabs-scroll-button:disabled,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button.ant-btn-disabled,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button[disabled],
        .uni-tabs-header-wrapper .uni-tabs-scroll-button.ant-btn:disabled,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button.ant-btn.ant-btn-disabled,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button.ant-btn-text:disabled,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button.ant-btn-text.ant-btn-disabled,
        .uni-tabs-header-wrapper button.uni-tabs-scroll-button:disabled,
        .uni-tabs-header-wrapper button.uni-tabs-scroll-button.ant-btn-disabled,
        .uni-tabs-header-wrapper button.uni-tabs-scroll-button[disabled] {
          width: 24px !important; /* 图标14px + 左右padding各5px = 24px */
          height: 40px !important; /* 总高40px */
          padding: 13px 5px !important; /* 上下13px，左右5px，图标14px居中 */
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          border: none !important;
          border-bottom: none !important;
          background: transparent !important;
          box-shadow: none !important;
          color: rgba(0, 0, 0, 0.25) !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
          position: relative !important;
          z-index: 2 !important;
          margin-bottom: 0 !important;
          margin-top: 0 !important;
          line-height: 1 !important;
        }
        .uni-tabs-header-wrapper .uni-tabs-scroll-button:disabled .anticon,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button:disabled .ant-btn-icon,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button:disabled span.anticon,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button.ant-btn-disabled .anticon,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button.ant-btn-disabled .ant-btn-icon,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button.ant-btn-disabled span.anticon,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button[disabled] .anticon,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button[disabled] .ant-btn-icon,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button[disabled] span.anticon,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button.ant-btn:disabled .anticon,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button.ant-btn.ant-btn-disabled .anticon,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button.ant-btn-text:disabled .anticon,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button.ant-btn-text.ant-btn-disabled .anticon,
        .uni-tabs-header-wrapper button.uni-tabs-scroll-button:disabled .anticon,
        .uni-tabs-header-wrapper button.uni-tabs-scroll-button:disabled svg,
        .uni-tabs-header-wrapper .uni-tabs-scroll-button:disabled svg {
          color: rgba(0, 0, 0, 0.25) !important;
          fill: rgba(0, 0, 0, 0.25) !important;
        }
        /* 可以点击时：主题色（默认状态，hover 时加深） */
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button:not(:disabled):not(.ant-btn-disabled):not([disabled]):hover,
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button.ant-btn:not(:disabled):not(.ant-btn-disabled):not(
            [disabled]
          ):hover,
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button.ant-btn-text:not(:disabled):not(.ant-btn-disabled):not(
            [disabled]
          ):hover {
          color: var(--ant-colorPrimaryHover) !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button:not(:disabled):not(.ant-btn-disabled):not([disabled]):hover
          .anticon,
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button:not(:disabled):not(.ant-btn-disabled):not([disabled]):hover
          .ant-btn-icon,
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button:not(:disabled):not(.ant-btn-disabled):not([disabled]):hover
          span.anticon,
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button.ant-btn:not(:disabled):not(.ant-btn-disabled):not(
            [disabled]
          ):hover
          .anticon,
        .uni-tabs-header-wrapper
          .uni-tabs-scroll-button.ant-btn-text:not(:disabled):not(.ant-btn-disabled):not(
            [disabled]
          ):hover
          .anticon {
          color: var(--ant-colorPrimaryHover) !important;
        }
        /* 按钮容器样式 - 高度与按钮一致，宽度等于按钮宽度 */
        .uni-tabs-scroll-button-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px; /* 按钮宽度 24px，容器宽度也设置为 24px */
          height: 40px; /* 与按钮高度一致 */
          padding-bottom: 0 !important;
          padding-top: 0 !important;
          border-bottom: none !important;
          position: relative;
          overflow: visible; /* 确保分割线可以显示 */
          flex-shrink: 0; /* 防止被压缩 */
        }
        /* 左按钮容器 - 右侧分割线 */
        .uni-tabs-scroll-button-left {
          margin-right: 0;
          position: relative;
          z-index: 2;
        }
        /* 左按钮右侧分割线 - 根据标签栏背景色自动适配 */
        .uni-tabs-scroll-button-wrapper:has(.uni-tabs-scroll-button-left)::after {
          content: '';
          position: absolute;
          right: 0;
          top: -1px;
          bottom: 0; /* 确保分割线到底部 */
          width: 1px;
          background: ${dividerSoft} !important;
          z-index: 1;
          opacity: 1 !important;
        }
        /* 左侧阴影 - 显示在左按钮右侧，当可以向左滚动时显示，根据标签栏背景色自动适配 */
        .uni-tabs-header-wrapper.can-scroll-left::before {
          content: '';
          position: absolute;
          left: 24px; /* 按钮宽度 24px，适配新按钮尺寸 */
          top: 0;
          bottom: 0; /* 与右侧阴影保持一致，确保对称 */
          width: 20px;
          background: linear-gradient(to right, ${shadowSoft}, transparent) !important;
          pointer-events: none;
          z-index: 1; /* 与右侧阴影一致，确保不遮挡标签文字 */
        }
        /* 右按钮容器 - 左侧分割线（移除右侧分割线避免重复） */
        .uni-tabs-scroll-button-right {
          margin-left: 0;
          position: relative;
          z-index: 2;
        }
        /* 右按钮左侧分割线 - 根据标签栏背景色自动适配 */
        .uni-tabs-scroll-button-wrapper:has(.uni-tabs-scroll-button-right)::before {
          content: '';
          position: absolute;
          left: 0;
          top: -1px;
          bottom: 0; /* 确保分割线到底部 */
          width: 1px;
          background: ${dividerSoft} !important;
          z-index: 1;
          opacity: 1 !important;
        }
        /* 右侧阴影 - 显示在小箭头按钮左侧，固定位置不随滚动移动，根据标签栏背景色自动适配 */
        .uni-tabs-header-wrapper.can-scroll-right::after {
          content: '';
          position: absolute;
          right: 24px; /* 按钮宽度 24px，适配新按钮尺寸 */
          top: 0;
          bottom: 0;
          width: 20px;
          background: linear-gradient(to left, ${shadowSoft}, transparent);
          pointer-events: none;
          z-index: 1;
        }
        /* 如果有全屏按钮且没有右按钮，右侧阴影直接在全屏按钮左侧 */
        .uni-tabs-header-wrapper.can-scroll-right:has(.uni-tabs-fullscreen-button-wrapper):not(
            :has(.uni-tabs-scroll-button-right)
          )::after {
          right: 40px; /* 全屏按钮 40px */
        }
        /* 如果有全屏按钮且有右按钮，右侧阴影需要向右偏移 */
        .uni-tabs-header-wrapper.can-scroll-right:has(.uni-tabs-fullscreen-button-wrapper):has(
            .uni-tabs-scroll-button-right
          )::after {
          right: 64px; /* 右按钮 24px + 全屏按钮 40px */
        }
        /* 全屏按钮容器样式 - 统一大小和padding，与按钮宽度高度一致 */
        .uni-tabs-fullscreen-button-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px; /* 按钮宽度 40px，容器宽度也设置为 40px */
          height: 40px; /* 与按钮高度一致 */
          margin-left: 0;
          padding-bottom: 0 !important;
          padding-top: 0 !important;
          border-bottom: none !important;
          position: relative;
          overflow: visible; /* 确保分割线可以显示 */
          flex-shrink: 0; /* 防止被压缩 */
          z-index: 2;
        }
        /* 全屏按钮左侧分割线 - 与标签页分割线样式一致，等高，根据标签栏背景色自动适配 */
        .uni-tabs-fullscreen-button-wrapper::before {
          content: '';
          position: absolute;
          left: 0;
          top: -1px;
          bottom: 0; /* 确保分割线到底部 */
          width: 1px;
          background: ${dividerSoft} !important;
          z-index: 1;
          opacity: 1 !important;
        }
        /* 全屏按钮样式 - 单独设置，保持左右padding为13px（与左右按钮不同），根据标签栏背景色自动适配 */
        .uni-tabs-header-wrapper .uni-tabs-fullscreen-button,
        .uni-tabs-header-wrapper .uni-tabs-fullscreen-button.ant-btn,
        .uni-tabs-header-wrapper .uni-tabs-fullscreen-button.ant-btn-text,
        .uni-tabs-header-wrapper button.uni-tabs-fullscreen-button,
        .uni-tabs-header-wrapper button.uni-tabs-fullscreen-button.ant-btn,
        .uni-tabs-header-wrapper button.uni-tabs-fullscreen-button.ant-btn-text {
          width: 40px !important; /* 正方形，与高度一致 */
          height: 40px !important; /* 总高40px */
          padding: 13px !important; /* 四周padding相等（左右13px），图标14px居中 */
          color: ${accent} !important;
        }
        /* 全屏按钮图标颜色 - 根据标签栏背景色自动适配 */
        .uni-tabs-header-wrapper .uni-tabs-fullscreen-button .anticon,
        .uni-tabs-header-wrapper .uni-tabs-fullscreen-button.ant-btn .anticon,
        .uni-tabs-header-wrapper .uni-tabs-fullscreen-button.ant-btn-text .anticon,
        .uni-tabs-header-wrapper button.uni-tabs-fullscreen-button .anticon,
        .uni-tabs-header-wrapper button.uni-tabs-fullscreen-button.ant-btn .anticon,
        .uni-tabs-header-wrapper button.uni-tabs-fullscreen-button.ant-btn-text .anticon {
          color: ${accent} !important;
        }
        /* 全屏按钮 hover 状态 - 根据标签栏背景色自动适配 */
        .uni-tabs-header-wrapper .uni-tabs-fullscreen-button:hover,
        .uni-tabs-header-wrapper .uni-tabs-fullscreen-button.ant-btn:hover,
        .uni-tabs-header-wrapper .uni-tabs-fullscreen-button.ant-btn-text:hover {
          color: ${accentHover} !important;
        }
        .uni-tabs-header-wrapper .uni-tabs-fullscreen-button:hover .anticon,
        .uni-tabs-header-wrapper .uni-tabs-fullscreen-button.ant-btn:hover .anticon,
        .uni-tabs-header-wrapper .uni-tabs-fullscreen-button.ant-btn-text:hover .anticon {
          color: ${accentHover} !important;
        }
        /* 标签栏容器 - 允许横向滚动，底部允许溢出显示外圆角 */
        .uni-tabs-container {
          flex: 1;
          overflow-x: hidden;
          overflow-y: hidden;
          position: relative;
          z-index: 1;
        }
        /* 强制隐藏 tabs nav 的滚动条 */
        .uni-tabs-container .ant-tabs-nav::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .uni-tabs-container .ant-tabs-nav {
          overflow-x: auto;
          overflow-y: hidden; /* 关键：防止垂直滚动条出现 */
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
          scrollbar-width: none !important; /* Firefox */
        }
        .uni-tabs-container .ant-tabs-nav-list {
          overflow: visible !important;
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
        }
        .uni-tabs-container .ant-tabs-tab {
          overflow: visible !important;
        }
        /* 移除所有可能移动的阴影效果和分隔线 */
        .uni-tabs-container .ant-tabs-nav-more {
          padding: 8px 0px 8px 8px !important;
          box-shadow: none !important;
          color: ${textSoft} !important;
        }
        /* 更多标签按钮图标颜色 - 根据标签栏背景色自动适配 */
        .uni-tabs-container .ant-tabs-nav-more .anticon {
          color: ${textSoft} !important;
        }
        .uni-tabs-container .ant-tabs-nav-operations {
          box-shadow: none !important;
        }
        /* 移除 nav-operations 的伪元素分隔线 */
        .uni-tabs-container .ant-tabs-nav-operations::before,
        .uni-tabs-container .ant-tabs-nav-operations::after {
          display: none !important;
          box-shadow: none !important;
        }
        /* 禁用 Ant Design 原生右侧阴影，使用自定义阴影适配小箭头按钮 */
        .uni-tabs-container .ant-tabs-nav-wrap::after {
          display: none !important;
        }
        /* 移除 nav-list 的分隔线 */
        .uni-tabs-container .ant-tabs-nav-list::after {
          display: none !important;
        }
        /* 彻底隐藏所有相关容器的滚动条 */
        .uni-tabs-container .ant-tabs-nav-wrap::-webkit-scrollbar,
        .uni-tabs-container .ant-tabs-nav-scroll::-webkit-scrollbar,
        .uni-tabs-container .ant-tabs-nav-list::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* 统一内容容器样式 */
        .uni-tabs-content {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
        }

        /* 普通页面统一添加 16px 内边距（顶部由 margin-top 控制，所以顶部内边距为 0） */
        /* 使用 !important 确保在全屏模式下 padding 不会被 ProLayout 或其他样式覆盖 */
        .uni-tabs-content-padded {
          /* 使用 margin 代替 padding，避免在全屏模式下 padding 失效的问题 */
          /* 此时滚动条会位于内容区域的边缘（margin 内部），而不是窗口边缘 */
          margin: 16px !important;
          padding: 0 !important;
          box-sizing: border-box;
          width: calc(100% - 32px) !important;
        }
        /* 全屏模式主菜单按钮容器 */
        .uni-tabs-menu-button-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          position: relative;
          z-index: 2;
          pointer-events: auto;
        }
        /* 全屏主菜单按钮样式 */
        .uni-tabs-menu-button {
          width: 32px !important;
          height: 32px !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          color: ${menuColor} !important;
          font-size: 16px !important;
          border-radius: 50% !important;
          transition: background 0.2s ease !important;
        }
        .uni-tabs-menu-button:hover {
          color: ${menuHoverColor} !important;
          background: ${menuHoverBg} !important;
        }
      }
    `,
    popoverMenu: css`
      &.uni-tabs-nav-popover-menu {
        .ant-menu {
          border: none !important;
          box-shadow: none !important;
          max-height: calc(100vh - 80px);
          overflow-y: auto;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .ant-menu::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      }
    `,
  }
})
