import { createGlobalStyle } from "antd-style";

/**
 * 全局样式配置
 *
 * @example
 * ```tsx
 * <ThemeProvider theme={theme}>
 *   <GlobalStyle />
 *   <App />
 * </ThemeProvider>
 * ```
 */ const GlobalStyle = createGlobalStyle`
	::-webkit-scrollbar {
		width: 14px;
		height: 14px;
		box-sizing: border-box;
		/* 保证滚动条出现时不会改变布局 */
		overflow-y: overlay;
		scrollbar-gutter: stable; 
	}
	
	::-webkit-scrollbar-track {
		/* background-color: ${({ theme }) => theme.other?.panelBg}; */
        /* border: 1px solid ${({ theme }) => theme.black?.["black 6%"]}; */
	}
	::-webkit-scrollbar-thumb {
		width: 6px;
		height: 6px;
		border-radius: 12px;
	}

	::-webkit-scrollbar-thumb:hover {
		background-color: ${({ theme }) => theme.black?.["black 24%"]};
	}
	::-webkit-scrollbar-corner {
		/* background-color: transparent; */
		display: none;
	}
	/* rc-virtual-list 虚拟列表滚动条 */
	.rc-virtual-list-scrollbar {
		/* width: 14px !important;		
		height: 14px !important;		 */
		box-sizing: border-box !important;
		transform: translateX(150%);
	}
	.rc-virtual-list-scrollbar-thumb {
		width: 6px;
		height: 6px;
		border-radius: 12px;
		background-color: ${({ theme }) => theme.black?.["black 8%"]} !important;
	}
	.rc-virtual-list-scrollbar-thumb:hover {
		background-color: ${({ theme }) => theme.black?.["black 24%"]};
	}


	.ant-message .ant-message-notice-title {
   		color: ${({ theme }) => theme.black?.["black 100%"]};
	}

	.ant-message .ant-message-notice {
   		background-color: ${({ theme }) => theme.other?.messageBg};
	}
	
	// 问号 tooltip icon
	span.anticon-question-circle[aria-label="question-circle"]:hover {
		color: ${({ theme }) => (theme.blue as any).scale?.blue3};
	}


	/* /固定列阴影颜色 */
	.ant-table-cell-fix-start-shadow-show,
	.ant-table-cell-fix-end-shadow-show {
		--ant-color-split: ${({ theme }) => theme.gray?.["gray 8%"]};
	}



`;

export default GlobalStyle;
