/** UniTable 容器/表身样式：由组件注入 <style>，避免新增全局样式文件 */
export const UNI_TABLE_STYLES = `
        .ant-table-container {
          height: calc(100% - 148px)!important;
          max-height: calc(100% - 148px)!important;
        }
        /* 统一 UniTable 容器样式，确保所有页面间距一致 */
        .uni-table-container {
          --uni-table-radius: var(--ant-borderRadiusLG, var(--ant-borderRadius, 8px));
          --uni-table-row-radius: var(--ant-borderRadiusLG, var(--ant-borderRadius, 8px));
          position: relative;
          padding: 0;
          margin: 0;
          flex: 1 1 auto;
          width: 100%;
        }
        /* ProTable 外框：ProCard 默认用 colorSplit 过浅，统一为次级边框色 */
        .uni-table-container:not(.uni-table-embedded) .uni-table-pro-table.ant-pro-table > .ant-pro-card.ant-pro-card-border {
          border: 1px solid var(--ant-colorBorderSecondary, var(--ant-colorBorder)) !important;
          border-radius: var(--uni-table-radius) !important;
          overflow: hidden;
        }
        /* 表头 + 表身外框（不含工具栏、分页） */
        .uni-table-container:not(.uni-table-embedded) .uni-table-pro-table .ant-table-container {
          border: 1px solid var(--ant-colorBorderSecondary, var(--ant-colorBorder));
          border-radius: var(--uni-table-radius);
          overflow: hidden;
          isolation: isolate;
        }
        .uni-table-container .ant-table-tbody > tr.ant-table-row {
          --uni-table-row-background: var(--ant-table-bg, var(--ant-colorBgContainer, #fff));
        }
        .uni-table-container .ant-table-tbody > tr.ant-table-row:hover,
        .uni-table-container .ant-table-tbody > tr.ant-table-row > td.ant-table-cell-row-hover {
          --uni-table-row-background: var(--ant-table-row-hover-bg, var(--ant-colorFillAlter, #fafafa));
        }
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected {
          --uni-table-row-background: var(--ant-table-row-selected-bg, var(--ant-colorPrimaryBg, #e6f4ff));
        }
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected:hover,
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-row-hover {
          --uni-table-row-background: var(--ant-table-row-selected-hover-bg, var(--ant-table-row-hover-bg, var(--ant-colorFillAlter, #fafafa)));
        }
        .uni-table-container .ant-table-tbody > tr.ant-table-row > td.ant-table-cell-fix-start,
        .uni-table-container .ant-table-tbody > tr.ant-table-row > td.ant-table-cell-fix-end,
        .uni-table-container .ant-table-tbody > tr.ant-table-row > td.ant-table-cell-fix-left,
        .uni-table-container .ant-table-tbody > tr.ant-table-row > td.ant-table-cell-fix-right {
          background: var(--uni-table-row-background);
        }
        .uni-table-container .ant-table-tbody > tr.ant-table-row > td.ant-table-cell-fix-start.ant-table-cell-row-hover,
        .uni-table-container .ant-table-tbody > tr.ant-table-row > td.ant-table-cell-fix-end.ant-table-cell-row-hover,
        .uni-table-container .ant-table-tbody > tr.ant-table-row > td.ant-table-cell-fix-left.ant-table-cell-row-hover,
        .uni-table-container .ant-table-tbody > tr.ant-table-row > td.ant-table-cell-fix-right.ant-table-cell-row-hover {
          background: var(--ant-table-row-hover-bg, var(--ant-colorFillAlter, #fafafa));
        }
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-start,
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-end,
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-left,
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-right {
          background: var(--ant-table-row-selected-bg, var(--ant-colorPrimaryBg, #e6f4ff));
        }
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-start.ant-table-cell-row-hover,
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-end.ant-table-cell-row-hover,
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-left.ant-table-cell-row-hover,
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-right.ant-table-cell-row-hover {
          background: var(--ant-table-row-selected-hover-bg, var(--ant-table-row-hover-bg, var(--ant-colorFillAlter, #fafafa)));
        }
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-end-shadow-show::after,
        .uni-table-container .ant-table-tbody > tr.ant-table-row > td.ant-table-cell-fix-end-shadow-show.ant-table-cell-row-hover::after,
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-right::after,
        .uni-table-container .ant-table-tbody > tr.ant-table-row > td.ant-table-cell-fix-right.ant-table-cell-row-hover::after {
          background: var(--uni-table-row-background);
          box-shadow: none;
        }
        .uni-table-container .ant-table-tbody > tr.ant-table-row:hover > td.ant-table-cell:first-child:not(.ant-table-cell-fix-right),
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell:first-child:not(.ant-table-cell-fix-right),
        .uni-table-container .ant-table-tbody > tr > td.ant-table-cell-row-hover:first-child:not(.ant-table-cell-fix-right),
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-left-first {
          border-start-start-radius: var(--uni-table-row-radius);
          border-end-start-radius: var(--uni-table-row-radius);
        }
        .uni-table-container .ant-table-tbody > tr.ant-table-row:hover > td.ant-table-cell:last-child:not(.ant-table-cell-fix-left),
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell:last-child:not(.ant-table-cell-fix-left),
        .uni-table-container .ant-table-tbody > tr > td.ant-table-cell-row-hover:last-child:not(.ant-table-cell-fix-left),
        .uni-table-container .ant-table-tbody > tr.ant-table-row-selected > td.ant-table-cell-fix-right-last {
          border-start-end-radius: var(--uni-table-row-radius);
          border-end-end-radius: var(--uni-table-row-radius);
        }
        .uni-table-container .ant-table-thead > tr:first-child > th:first-child:not(.ant-table-cell-fix-right),
        .uni-table-container .ant-table-thead > tr:first-child > th.ant-table-cell-fix-left-first {
          border-start-start-radius: var(--uni-table-radius);
        }
        .uni-table-container .ant-table-thead > tr:first-child > th:last-child:not(.ant-table-cell-fix-left),
        .uni-table-container .ant-table-thead > tr:first-child > th.ant-table-cell-fix-right-last {
          border-start-end-radius: var(--uni-table-radius);
        }
        .uni-table-container .ant-table-tbody > tr:last-child:not(.ant-table-measure-row) > td:first-child:not(.ant-table-cell-fix-right),
        .uni-table-container .ant-table-tbody > tr:last-child:not(.ant-table-measure-row) > td.ant-table-cell-fix-left-first {
          border-end-start-radius: var(--uni-table-radius);
        }
        .uni-table-container .ant-table-tbody > tr:last-child:not(.ant-table-measure-row) > td:last-child:not(.ant-table-cell-fix-left),
        .uni-table-container .ant-table-tbody > tr:last-child:not(.ant-table-measure-row) > td.ant-table-cell-fix-right-last {
          border-end-end-radius: var(--uni-table-radius);
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
        /* 行高统一 64px：表头/表身单元格显式锁定高度（覆盖 small 密度默认行高；
         * 依赖 padding 推算行高不可靠——antd 单元格存在额外行高差额，故直接设置 height） */
        .uni-table-container .ant-table-thead > tr > th,
        .uni-table-container .ant-table-tbody > tr > td {
          height: 64px !important;
        }
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
        /* 工具栏按钮统一 44px 高。
         * 注意：antd 开启 cssVar 后，按钮元素自身携带 .css-var-* 类并直接声明 --ant-control-height（32px），
         * 容器级 CSS 变量覆盖无效（元素自身声明优先于继承值），因此必须直接在按钮元素上强制 height；
         * !important 用于压过 antd 的 height: var(--ant-control-height)。 */
        .uni-table-container .pro-table-button-container .ant-btn,
        .uni-table-container .ant-pro-table-list-toolbar .ant-btn {
          height: 44px !important;
        }
        /* 分页器布局：每页条数选择器固定在最左，其余（总数/翻页/跳转）保持右侧。
         * 注意：antd 6 中 .ant-table-pagination 即 ul.ant-pagination 自身（非外层容器）。
         * 分页器整体 36px：item/prev/next/总数/跳转输入框均由 antd CSS 变量统一驱动，改变量即全部同步。 */
        .uni-table-container .ant-table-pagination {
          --ant-pagination-item-size-actual: 36px !important;
          position: relative;
          height: 36px !important;
          align-items: center;
        }
        .uni-table-container .ant-table-pagination .ant-pagination-options-size-changer {
          position: absolute;
          /* 预留外部标签"每页条目数"的空间：汉字宽=1em（5em 文字宽 + 8px 间距 + 12px 左缓冲），
           * 用 em 计算使标签与选择器随字号偏好（10-22px）同步缩放，避免固定像素错位 */
          left: calc(5em + 20px);
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
        }
        /* 每页条数 select（antd 6 无 .ant-select-selector，结构为 .ant-select > .ant-select-content + .ant-select-suffix）：
         * cssVar 模式下高度由元素自身声明的 --ant-select-height 计算 padding 得出，容器级覆盖无效，需直接强制 height；
         * x 轴 padding 同样需直接强制 */
        .uni-table-container .ant-table-pagination .ant-select {
          height: 36px !important;
          padding-block: 0 !important;
          padding-inline: 15px !important;
        }
        .uni-table-container .ant-table-pagination .ant-select-content {
          align-items: center !important;
        }
        /* 每页条数选择器及其下拉框圆角跟随系统偏好（--ant-border-radius，0-24 动态调整）。
         * antd 6 默认：small select 用 borderRadiusSM、下拉面板用 borderRadiusLG、选项用 borderRadiusSM，
         * 均与全局 borderRadius 不一致，此处显式统一为系统圆角。 */
        .uni-table-container .ant-table-pagination .ant-select {
          border-radius: var(--ant-border-radius) !important;
        }
        .ant-select-dropdown {
          border-radius: var(--ant-border-radius) !important;
        }
        .ant-select-dropdown .ant-select-item-option {
          border-radius: var(--ant-border-radius) !important;
        }
        /* 每页条数选择器前置标签文字：位于选择器左侧外部并排（right:100% 定位到选择器边框外，不占用其内部空间） */
        .uni-table-container .ant-table-pagination .ant-pagination-options-size-changer::before {
          content: '每页条目数';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: 100%;
          margin-right: 8px;
          color: var(--ant-color-text-secondary, rgba(0, 0, 0, 0.65));
          white-space: nowrap;
        }
        /* 跳页输入框（quick-jumper，antd 6 渲染为原生 input）：x 轴 padding 与每页条数选择器一致，圆角跟随系统偏好 */
        .uni-table-container .ant-table-pagination .ant-pagination-options-quick-jumper input {
          padding-inline: 15px !important;
          border-radius: var(--ant-border-radius) !important;
        }
`
