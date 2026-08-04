/** UniTable 容器/表身样式：由组件注入 <style>，避免新增全局样式文件 */
export const UNI_TABLE_STYLES = `
        .ant-table-container {
          height: calc(100% - 148px)!important;
          max-height: calc(100% - 148px)!important;
        }
        /* 统一 UniTable 容器样式，确保所有页面间距一致 */
        .uni-table-container {
          position: relative;
          padding: 0;
          margin: 0;
          flex: 1 1 auto;
          width: 100%;
        }
        /* ProTable 外框：ProCard 默认用 colorSplit 过浅，统一为次级边框色 */
        .uni-table-container:not(.uni-table-embedded) .uni-table-pro-table.ant-pro-table > .ant-pro-card.ant-pro-card-border {
          border: 1px solid var(--ant-colorBorderSecondary, var(--ant-colorBorder)) !important;
          border-radius: var(--ant-borderRadiusLG, var(--ant-borderRadius, 6px)) !important;
          overflow: hidden;
        }
        /* 表头 + 表身外框（不含工具栏、分页） */
        .uni-table-container:not(.uni-table-embedded) .uni-table-pro-table .ant-table-container {
          border: 1px solid var(--ant-colorBorderSecondary, var(--ant-colorBorder));
          border-radius: var(--ant-borderRadius, 6px);
          overflow: hidden;
        }
        .uni-table-container.uni-table-embedded .ant-pro-card {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
        }
        .uni-table-container.uni-table-embedded .ant-pro-card .ant-pro-card-body {
          padding: 0 !important;
        }
        .uni-table-container.uni-table-embedded .uni-table-pro-table {
          margin: 0 !important;
        }
        .uni-table-container.uni-table-embedded .ant-pro-table-list-toolbar-container {
          padding-block: 0 8px !important;
        }
        /* 表身行高/内边距由 ProTable size="small"（antd Table 密度）统一控制，勿在此覆盖 padding */
        .uni-table-container .ant-table-tbody > tr > td {
          border-bottom-color: rgba(0, 0, 0, 0.12) !important;
        }
        /* scroll.x / 固定列时 rc-table 注入的测量行：折叠占位，避免表头与首行数据之间出现白缝 */
        .uni-table-container .ant-table-tbody > tr.ant-table-measure-row {
          height: 0 !important;
          line-height: 0 !important;
          visibility: collapse;
        }
        .uni-table-container .ant-table-tbody > tr.ant-table-measure-row > .ant-table-measure-cell {
          height: 0 !important;
          padding: 0 !important;
          border: none !important;
          line-height: 0 !important;
          font-size: 0 !important;
          overflow: hidden !important;
        }
        .uni-table-container .ant-table-tbody > tr.ant-table-measure-row .ant-table-measure-cell-content {
          height: 0 !important;
          overflow: hidden !important;
        }
        /**
         * 表身单元格默认不换行（贴合原生 antd 单行表格风格）。
         * 表头同步相同 nowrap / 语义 class，避免表头与表身列宽计算不一致导致轻微错位。
         */
        .uni-table-container .ant-table-tbody > tr > td:not(.uni-table-operation-cell):not(.uni-table-lifecycle-cell),
        .uni-table-container .ant-table-thead > tr > th:not(.uni-table-operation-cell):not(.uni-table-lifecycle-cell) {
          white-space: nowrap;
        }
        .uni-table-container .ant-table-tbody > tr > td.uni-table-operation-cell,
        .uni-table-container .ant-table-thead > tr > th.uni-table-operation-cell {
          white-space: nowrap;
        }
        .uni-table-container .ant-table-tbody > tr > td.uni-table-lifecycle-cell,
        .uni-table-container .ant-table-thead > tr > th.uni-table-lifecycle-cell {
          white-space: nowrap;
        }
        /* 非 fixed：收缩锚点；fixed right 由列 width 控制，禁止 1px 以免与操作列重叠 */
        .uni-table-container .ant-table-tbody > tr > td.uni-table-lifecycle-cell:not(.uni-table-lifecycle-fixed-right),
        .uni-table-container .ant-table-thead > tr > th.uni-table-lifecycle-cell:not(.uni-table-lifecycle-fixed-right) {
          width: 1px;
          max-width: fit-content;
        }
        .uni-table-container .uni-table-pro-table .ant-table-thead .ant-table-column-sorters,
        .uni-table-container .uni-table-pro-table .ant-table-thead .ant-table-column-title {
          white-space: nowrap;
        }
        /* 工具栏置于表头 tooltip 之上，避免排序提示挡住批量操作等按钮 */
        .uni-table-container .ant-pro-table-list-toolbar {
          position: relative;
          z-index: 3;
        }
        /* 无 string headerTitle 时仍展示 3.1 功能按钮行（新建/批量等） */
        .uni-table-container.uni-table-has-list-toolbar .ant-pro-table-list-toolbar-container {
          display: flex !important;
          min-height: 32px;
        }
        /* 排序提示默认向下弹出（见 showSorterTooltip），避免遮挡上方工具栏 */
        .uni-table-container .ant-table-thead .ant-table-column-sorters-tooltip-target-sorter .ant-table-column-sorter {
          margin-inline-start: 4px;
        }
        /* 未限高（natural-height）：纵向滚动由 UniTable 统一关闭，覆盖 global.less 全局表格规则 */
        .uni-table-container.uni-table-natural-height .ant-pro-table,
        .uni-table-container.uni-table-natural-height .ant-pro-card,
        .uni-table-container.uni-table-natural-height .ant-pro-card-body,
        .uni-table-container.uni-table-natural-height .ant-pro-table-container,
        .uni-table-container.uni-table-natural-height .ant-table-wrapper,
        .uni-table-container.uni-table-natural-height .ant-spin-nested-loading,
        .uni-table-container.uni-table-natural-height .ant-spin-container,
        .uni-table-container.uni-table-natural-height .ant-table,
        .uni-table-container.uni-table-natural-height .ant-table-container {
          height: auto !important;
          max-height: none !important;
          flex: 0 1 auto !important;
        }
        /* 未限高时不拉伸 UniTable 填满列高（否则 flex+overflow-y:auto 产生空滚动条） */
        .uni-table-container.uni-table-natural-height .ant-table-content,
        .uni-table-container.uni-table-natural-height .ant-table-body,
        .uni-table-container.uni-table-natural-height .ant-table-body-inner,
        .uni-table-container.uni-table-natural-height .ant-table-fixed-left .ant-table-body-inner,
        .uni-table-container.uni-table-natural-height .ant-table-fixed-right .ant-table-body-inner,
        .uni-table-container.uni-table-natural-height .ant-table-header {
          overflow-y: hidden !important;
          max-height: none !important;
          scrollbar-gutter: stable !important;
          flex: none !important;
        }
        .uni-table-container.uni-table-natural-height .ant-table-wrapper .ant-table-content::-webkit-scrollbar,
        .uni-table-container.uni-table-natural-height .ant-table-wrapper .ant-table-body::-webkit-scrollbar {
          width: 0 !important;
          display: none !important;
        }
        .uni-table-container.uni-table-natural-height .ant-table-wrapper .ant-table-content::-webkit-scrollbar:horizontal,
        .uni-table-container.uni-table-natural-height .ant-table-wrapper .ant-table-body::-webkit-scrollbar:horizontal {
          height: 6px !important;
          display: block !important;
        }
        /* 空表且无固定列：关闭横向滚动，避免仅表头时出现空横条 */
        .uni-table-container.uni-table-natural-height.uni-table-empty:not(.uni-table-empty-has-fixed) .ant-table-content,
        .uni-table-container.uni-table-natural-height.uni-table-empty:not(.uni-table-empty-has-fixed) .ant-table-body,
        .uni-table-container.uni-table-natural-height.uni-table-empty:not(.uni-table-empty-has-fixed) .ant-table-body-inner,
        .uni-table-container.uni-table-natural-height.uni-table-empty:not(.uni-table-empty-has-fixed) .ant-table-fixed-left .ant-table-body-inner,
        .uni-table-container.uni-table-natural-height.uni-table-empty:not(.uni-table-empty-has-fixed) .ant-table-fixed-right .ant-table-body-inner {
          overflow-x: hidden !important;
        }
        /* 空表有固定列：保留 scroll 容器以维持表头对齐，仅隐藏横向滚动条外观 */
        .uni-table-container.uni-table-natural-height.uni-table-empty.uni-table-empty-has-fixed .ant-table-wrapper .ant-table-content::-webkit-scrollbar:horizontal,
        .uni-table-container.uni-table-natural-height.uni-table-empty.uni-table-empty-has-fixed .ant-table-wrapper .ant-table-body::-webkit-scrollbar:horizontal {
          height: 0 !important;
          display: none !important;
        }
        .uni-table-container.uni-table-natural-height.uni-table-empty:not(.uni-table-empty-has-fixed) .ant-table-wrapper .ant-table-content::-webkit-scrollbar:horizontal,
        .uni-table-container.uni-table-natural-height.uni-table-empty:not(.uni-table-empty-has-fixed) .ant-table-wrapper .ant-table-body::-webkit-scrollbar:horizontal {
          height: 0 !important;
          display: none !important;
        }
        /* 已限高（scroll.y）：表头/表体同步预留纵向滚动条占位，避免列宽抖动 */
        .uni-table-container.uni-table-scroll-y-mode .uni-table-pro-table.uni-table-scroll-y .ant-table-header,
        .uni-table-container.uni-table-scroll-y-mode .uni-table-pro-table.uni-table-scroll-y .ant-table-body,
        .uni-table-container.uni-table-scroll-y-mode .uni-table-pro-table.uni-table-scroll-y .ant-table-content {
          scrollbar-gutter: stable;
        }
        /* 页面布局内限高：表格整体跟随容器，在 padding 内占满且不越界 */
        .uni-page-body-inner .uni-table-container.uni-table-scroll-y-mode {
          flex: 1 1 auto !important;
          display: flex !important;
          flex-direction: column !important;
          min-height: 0 !important;
          max-height: 100% !important;
          overflow: hidden !important;
        }
        .uni-page-body-inner .uni-table-container.uni-table-scroll-y-mode .uni-table-search-pane-wrap {
          flex: 1 1 auto !important;
          display: flex !important;
          flex-direction: column !important;
          min-height: 0 !important;
          max-height: 100% !important;
        }
        .uni-page-body-inner .uni-table-container.uni-table-scroll-y-mode .uni-table-search-pane-wrap > .pro-table-button-container {
          flex: 0 0 auto !important;
        }
        .uni-page-body-inner .uni-table-container.uni-table-scroll-y-mode .uni-table-search-pane-wrap > .uni-table-body-pane {
          flex: 1 1 auto !important;
          min-height: 0 !important;
          max-height: 100% !important;
          overflow: visible !important;
        }
`
