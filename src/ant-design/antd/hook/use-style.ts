import { createStyles } from "antd-style";

const useStyle = createStyles(({ prefixCls, css, token }) => {
  const noScrollbar = `
		-ms-overflow-style: none;
		scrollbar-width: none;

		&::-webkit-scrollbar {
			display: none;
		}
	`;

  const checkbox = `
		.${prefixCls}-checkbox-indeterminate {
			:not(.${prefixCls}-checkbox-disabled) .${prefixCls}-checkbox-inner {
				// border-color: var(--${prefixCls}-color-primary) !important;
			}
			.${prefixCls}-checkbox-inner {
				&::after {
					border-radius: 20%;
				}
			}
		}
	`;

  const radio = `
		.${prefixCls}-radio-wrapper {
			&::after {
				content: '';
			}ƒ
		}
	`;

  const pagination = css`
    &.${prefixCls}-pagination {
      > li {
        height: 40px;
        display: inline-flex;
        align-items: center;
      }

      &:not(.${prefixCls}-pagination-disabled) {
        .${prefixCls}-pagination-prev, .${prefixCls}-pagination-next {
          &:hover {
            background: ${token.colorPrimary};
          }
        }

        .${prefixCls}-pagination-item-link {
          &:hover {
            color: ${token.colorWhite} !important;
          }
        }

        .${prefixCls}-pagination-simple-pager {
          input {
            border-color: transparent !important;
            background: ${token.colorBgContainer} !important;

            &:hover {
              border-color: ${token.colorPrimary} !important;
              background: ${token.colorWhite} !important;
            }
          }
        }
      }

      /* ② simple 输入框区域 */
      .${prefixCls}-pagination-simple-pager {
        height: 40px;
        display: inline-flex;
        align-items: center;

        input {
          width: 68px !important;
          height: 40px;
          line-height: 40px;
          box-sizing: border-box;
        }
        .${prefixCls}-pagination-total-text {
          color: ${token.colorTipsText};
        }
      }

      /* ③ 左右箭头 */

      .${prefixCls}-pagination-prev, .${prefixCls}-pagination-next {
        height: 40px !important;
        display: inline-flex;
        align-items: center;
      }

      /* ④ 共 xx 条 */
      .${prefixCls}-pagination-total-text {
        height: 40px;
        display: inline-flex;
        align-items: center;
      }
    }
  `;

  const input = `
		.${prefixCls}-checkbox-indeterminate:not(.${prefixCls}-checkbox-disabled) .${prefixCls}-checkbox-inner {
			border-color: var(--${prefixCls}-color-primary) !important;
		}

		.${prefixCls}-checkbox-indeterminate {
			.${prefixCls}-checkbox-inner {
				&::after {
					border-radius: 100%;
				}
			}
		}
	`;

  const textarea = `
		&.${prefixCls}-input {
			${noScrollbar}
		}
	`;

  const button = `
		&.${prefixCls}-btn-default {
			color: ${token.colorPrimary};
			border-color: ${token.colorPrimary};
			background: transparent;

			&[disabled] {
				color: ${token.colorBgDisabledButton} ;
				border-color: transparent;
				background: ${token.colorBgDisabledButton} !important;
			}
			
			&:not([disabled]) {
				&:hover {
					color: ${token.colorWhite} !important;
					border-color: ${token.colorBgActiveButton} !important;
					background: ${token.colorBgActiveButton} !important;
				}
			}
		}

		&.${prefixCls}-btn-link {
			height: 16px;
			padding: 0 !important;

			&:not([disabled]) {
				&:hover {
					span {
						text-decoration: underline;
					}
				}
			}
			&[disabled] {
				span {
					color: ${token.colorBgDisabledButton};
				}
			}
		}
		
		&.${prefixCls}-btn-dashed {
			color: ${token.colorTipsText};
			border-color: ${token.colorBorder};
			background: transparent;
			
			&[disabled] {
				color: ${token.colorBgDisabledButton} ;
				border-color: transparent;
				background: ${token.colorBgDisabledButton} !important;
			}
			
			&:not([disabled]) {
				&:hover {
					color: ${token.colorPrimary} !important;
					border-color: ${token.colorPrimary} !important;
					background: transparent !important;
				}
			}
		}
		
		.ant-btn-icon {
			display: flex;
			align-items: center;
			justify-content: center;
		}
	`;

  const menu = css`
    &.${prefixCls}-menu {
      border-style: none !important;

      &.${prefixCls}-menu-inline-collapsed {
        .${prefixCls}-menu-title-content {
          display: none !important;
        }
      }

      /* .${prefixCls}-menu-item, .${prefixCls}-menu-submenu-title {
				display: flex !important;
				align-items: center;
				justify-content: center;
				padding: 0 20px;

				&:not(.${prefixCls}-menu-item-only-child) {
					.${prefixCls}-menu-title-content {
						margin-left: 14px !important;
					}
				}
			} */

      /* .${prefixCls}-menu-item-selected {
				background: ${token.colorPrimary};
				color: ${token.colorWhite} !important;
			} */

      /* .${prefixCls}-menu-submenu-selected {
				.${prefixCls}-menu-submenu-title {
					background: ${token.colorBgDisabled};
				}
			} */

      .${prefixCls}-menu-sub {
        padding-left: 36px !important;
        margin-top: 8px !important;
      }
    }
  `;

  const tabs = `
		&.${prefixCls}-tabs {
			.${prefixCls}-tabs-tab {
				.anticon {
					:not(:last-child) {
						margin: 0 !important;
					}
				}
				&.${prefixCls}-tabs-tab-active {
					.${prefixCls}-tabs-tab-label-title {
						font-weight: bold;
					}
				}
				&:not(.${prefixCls}-tabs-tab-active) {
					.${prefixCls}-tabs-tab-label-count {
						color: ${token.colorBodyText} !important;
						background: ${token.colorBgDisabled} !important;
					}
				}
				.${prefixCls}-tabs-tab-label-count {
					font-size: 14px;
				}
			}
		}
	`;

  const table = css`
    &.${prefixCls}-table-wrapper {
      .${prefixCls}-table {
        border-radius: 0;
        .ant-table-thead {
          .request {
            &::after {
              content: "*";
              color: ${token.status.red5};
            }
          }
        }
      }

      .ant-form-item-additional {
        position: absolute;
        bottom: -14px;
        z-index: 100;
      }

      .ant-form-item-explain-error {
        font-size: 12px !important;
        line-height: 14px !important;
      }

      .ant-form-item {
        margin-bottom: 0 !important;
      }

      table {
        border-collapse: collapse;
      }

      .${prefixCls}-table-header {
        margin-bottom: 4px;
        white-space: nowrap;
        .${prefixCls}-table-thead {
          th {
            max-height: 40px !important;
            &:first-child {
              border-radius: 8px 0 0 8px !important;
            }

            &:last-child {
              border-radius: 0 8px 8px 0 !important;
            }
          }
          tr {
            height: 40px !important;
            box-sizing: border-box !important;
          }
        }
      }

      .ant-table-thead {
        background: ${token.other?.tableHeaderBg} !important;
      }
      tbody {
        tr:not(.ant-table-measure-row) {
          // border-bottom: 1px solid ${token.colorSplitLine} !important;
        }
        tr {
          height: 60px;
        }

        // 移除所有选中行之间的边框和间距
        .ant-table-row-selected {
          td {
            border-radius: 0 !important;
            border-bottom: none !important;
          }

          + .ant-table-row-selected td {
            border-top: none !important;
          }
        }
      }

      // 独立的单个选中行（前后都不是选中行）- 保留四角圆角
      .ant-table-row-selected:not(:has(+ .ant-table-row-selected)):not(
          :is(.ant-table-row-selected + *)
        ) {
        td {
          &:first-child {
            border-radius: 8px 0 0 8px !important;
          }
          &:last-child {
            border-radius: 0 8px 8px 0 !important;
          }
        }
      }

      // 连续选中行的第一行 - 只保留上方圆角
      .ant-table-row-selected:has(+ .ant-table-row-selected):not(
          :is(.ant-table-row-selected + *)
        ) {
        td {
          &:first-child {
            border-radius: 8px 0 0 0 !important;
          }
          &:last-child {
            border-radius: 0 8px 0 0 !important;
          }
        }
      }

      // 连续选中行的最后一行 - 只保留下方圆角
      .ant-table-row-selected
        + .ant-table-row-selected:not(:has(+ .ant-table-row-selected)) {
        td {
          &:first-child {
            border-radius: 0 0 0 8px !important;
          }
          &:last-child {
            border-radius: 0 0 8px 0 !important;
          }
        }
      }

      // 普通未选中行的圆角
      td {
        /* height: 64px; */
        border-style: none !important;

        &:first-child {
          border-radius: 8px 0 0 8px !important;
        }

        &:last-child {
          border-radius: 0 8px 8px 0 !important;
        }
      }
    }
  `;

  const drawer = css`
    .${prefixCls}-drawer-section {
    }
    .${prefixCls}-drawer-header {
      margin: 16px !important;
    }

    .${prefixCls}-drawer-body {
      padding: 4px 20px 0 20px !important;
      ${noScrollbar}
    }

    .${prefixCls}-drawer-footer {
      padding: 16px 0 !important;
      margin-bottom: 0 !important;
    }
  `;

  const select = css`
    .${prefixCls}-select-selector {
      padding: 0 20px !important;
    }
  `;

  const segmented = css`
    /* border: 1px solid #d9d9d9ff; */
    border: 1px solid ${token.black?.["black 12%"]};
    /* background-color: transparent; */
    /* height: 32px; */
    .${prefixCls}-segmented-group {
      .${prefixCls}-segmented-item {
        border-radius: 4px;
        overflow: hidden;
        > div {
          height: fit-content;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: "";
        }
      }
      .${prefixCls}-segmented-thumb {
        border-radius: 8px;
      }
    }
  `;

  const upload = css`
    display: block;
    height: 120px;

    .${prefixCls}-upload-drag {
      border-color: ${token.colorBorder} !important;
      border-radius: 8px !important;
      overflow: hidden;

      &:hover {
        border-color: ${token.colorPrimary} !important;
      }

      .${prefixCls}-upload-btn {
        padding: 0 !important;

        .${prefixCls}upload-drag-container {
        }
      }
    }

    // &:not(.${prefixCls}-upload-picture-card-wrapper) {
    //
    // 	display: block;
    // 	height: 72px !important;
    // 	font-size: 12px;
    //
    // 	.${prefixCls}-upload-drag {
    // 		border-radius: 24px;
    // 		color: ${token.colorTipsText};
    // 		border-color: ${token.colorBorder};
    // 		background: transparent;
    // 	}
    // }
    //
    // &.${prefixCls}-upload-picture-card-wrapper {
    //
    // 	.${prefixCls}-upload-list-picture-card {
    //
    // 		column-gap: 12px !important;
    // 		row-gap: 10px !important;
    //
    // 		.${prefixCls}-upload-list-item-container {
    //
    // 			width: 72px !important;
    // 			height: 72px !important;
    //
    // 			.${prefixCls}-upload-list-item {
    // 				padding: 0 !important;
    // 				border-style: dashed !important;
    // 				/* border-color: ${token.colorBorder}; */
    // 				border-radius: 12px;
    // 				overflow: hidden;
    //
    // 				&::before {
    // 					width: 100%;
    // 					height: 100%;
    // 					background: #00000099;
    // 				}
    //
    // 				.${prefixCls}-upload-list-item-image {
    // 					object-fit: none;
    // 				}
    //
    // 				button {
    // 					background: transparent;
    // 				}
    //
    // 				/* .${prefixCls}-upload-list-item-actions { */
    //
    // 					/* a {
    // 						display: none;
    // 					} */
    // 				/* } */
    // 			}
    // 		}
    //
    // 		.${prefixCls}-upload-select {
    // 			width: 72px;
    // 			height: 72px;
    // 			border-color: ${token.colorBorder};
    // 			border-radius: 12px;
    // 			background: transparent;
    // 		}
    // 	}
    // }
  `;

  const tree = css`
    .${prefixCls}-tree-node-content-wrapper {
      border-top-left-radius: 0px;
      border-bottom-left-radius: 0px;
    }

    .${prefixCls}-tree-switcher {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-inline-end: 0px;
      border-top-left-radius: ${token.borderRadius}px;
      border-bottom-left-radius: ${token.borderRadius}px;
    }

    .${prefixCls}-tree-treenode-selected {
      /* .${prefixCls}-tree-switcher {
						background-color: var(--ant-tree-node-selected-bg) !important;
					}
					.${prefixCls}-tree-node-content-wrapper{ 
						background-color: var(--ant-tree-node-selected-bg) !important;
					} */
      background-color: var(--ant-tree-node-selected-bg) !important;

      .${prefixCls}-tree-switcher {
        background-color: transparent !important;
      }
      .${prefixCls}-tree-node-content-wrapper {
        background-color: transparent !important;
      }
    }

    .${prefixCls}-tree-list-scrollbar-thumb {
      background-color: ${token.scrollBarColor} !important;
    }

    .${prefixCls}-tree-treenode {
      border-radius: ${token.borderRadius}px;
      &:hover {
        background-color: var(--ant-tree-node-hover-bg);
        .${prefixCls}-tree-switcher {
          background-color: transparent;
        }
        .${prefixCls}-tree-node-content-wrapper {
          background-color: transparent;
        }
      }
    }
  `;

  const transfer = css`
    .${prefixCls}-transfer {
      width: 100%;
    }
    .${prefixCls}-transfer-actions {
      .${prefixCls}-btn {
        border-radius: 100%;
      }
    }
    .${prefixCls}-transfer-section {
      flex: 1 1 0%;
      border-radius: 20px;
      height: fit-content;
      max-height: 312px;
      min-height: 240px;
      min-width: 200px;

      .${prefixCls}-transfer-list-header {
        padding: 0 6px;
        margin: 0 8px;
        height: 44px;
      }
      .${prefixCls}-transfer-list-body-search-wrapper {
        padding: 12px 8px 0 8px;
      }
    }
    .${prefixCls}-transfer-list-content {
      border-radius: 0 !important;
    }
    .${prefixCls}-empty {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 34px 0;
      .${prefixCls}-empty-image {
        width: 100px;
        height: 100px;
        margin-bottom: 0px;
      }
    }
  `;

  return {
    radio: css`
      ${radio}
    `,
    checkbox: css`
      ${checkbox}
    `,
    pagination: css`
      ${pagination}
    `,
    input: css`
      ${input}
    `,
    textarea: css`
      ${textarea}
    `,
    button: css`
      ${button}
    `,
    menu: css`
      ${menu}
    `,
    tabs: css`
      ${tabs}
    `,
    table: css`
      ${table}
    `,
    drawer: css`
      ${drawer}
    `,
    segmented,
    select,
    upload,
    tree,
    transfer,
  };
});

export default useStyle;
