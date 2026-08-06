/**
 * UniTable：统一 ProTable 封装（列表页表格区）
 *
 * 分层约定（与 uni-* 抽象对齐，便于页面与文档一致描述）：
 *
 * 1. **uni-staticcard（若有）**：统计/指标卡片不在本组件内；由 `ListPageTemplate.statCards` 或页面放在表格上方。
 * 2. **第一行工具区**（搜索行，`ProCard` 内 flex）：
 *    - **2.1 左侧**：**uni-search** — `UniSearch`（模糊/高级搜索、重置等）。
 *    - **2.2 右侧**：**uni-view** — `UniView`（表格/明细/卡片/看板/… 及 `customViews`）。
 * 3. **第二行工具区**（`ProTable` 的标题行 + 工具栏）：
 *    - **3.1 左侧功能按钮区** — `headerTitle` ← `buildLeftActions()`：**可选 `toolBarActionsBeforeCreate`**、**新建**、**uni-pull / uni-push**（下推请用 `UniPushToolbarButton`，`type="primary"` + `ArrowDownOutlined`，放 `toolBarActionsAfterCreate`；勿与右侧数据能力混排）、**uni-batch**（删除用 `UniBatchDeleteButton`；其它批量操作用 `UniBatchMenuButton` 或 `toolBarActionsAfterDelete`）、编辑、工具栏「详情」入口等；实现上通过 `headerActions` 或 `toolBarActions` / `toolBarActionsAfterDelete`，以及 **ProTable `toolBarRender` 的返回值（见下）** 注入。
 *    - **3.2 右侧** — 组件内 `buildRightActions()` + `toolbar.actions`：**uni-import**、**uni-export**、**uni-sync**、**数据集**（可选，位于同步后）、**打印**；**表格设定**为 ProTable 原生 **`options`**。
 *
 * **重要**：传入的 **`toolBarRender` 会被剥离后只在左侧复用**：其返回值并入 `headerTitle`，**不会**出现在 ProTable 默认右侧工具栏；传给 `ProTable` 的 `toolBarRender` 由本组件重写，仅负责同步选中行并渲染 **3.2** 内建按钮。
 *
 * 4. **表格**：右侧固定列顺序由 `normalizeFixedRightColumnOrder` 规范 — **uni-lifecycle**（`lifecycle_stage` / `lifecycle`）、**uni-action**（`uni-action` 模块约定，固定列垫后）。
 *    **主从堆叠列**（减横滚）：见 `stackedPrimaryColumn.tsx` — `UniTableStackedPrimaryCell` + `uniTablePrimaryFlex` + `UNI_TABLE_STACKED_PRIMARY_COLUMN_DEFAULTS`。
 *    **行点击选中**（唯一控制源）：只要启用行选择（`enableRowSelection` 或 `rowSelection`），默认点击表身切换勾选；用 `disableRowClickSelection` 关闭。
 * 5. **详情 uni-detail**：列表侧由 `onDetail`、行内操作列等与页面级 **uni-detail**（如 `DetailDrawerTemplate`）配合；本文件不渲染详情壳。
 *
 * **组装清单（子模块）**：`UniSearch`、`UniView`、`UniPushToolbarButton`、`UniBatchDeleteButton`（及通用 `UniBatchButton`）、`UniImportToolbarButton` + `UniImport`、`UniExportMenuButton`、`UniSyncButton`；列侧 `uni-action` / `uni-lifecycle` 在列定义中接入。
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components'
import { Grid } from 'antd'
import UniView from '../uni-view'
import { useConfigStore } from '../../stores/configStore'
import { useListPageStatCardsContext } from '../layout-templates/listPageStatCardsContext'
import { useUserPreferenceStore } from '../../stores/userPreferenceStore'
import { useNewShortcut } from '../../hooks/useNewShortcut'
import { usePagePermissionResource } from '../../hooks/usePagePermissionResource'
import { useResourcePermissions } from '../../hooks/useResourcePermissions'
import { useProTableSearch } from './useProTableSearch'
import { hasUniTableFixedColumns } from './columnPolicy'
import { UNI_TABLE_STYLES } from './uniTableStyles'
import { UniTableViews, UniTableMobileCards } from './UniTableViews'
import { UniTableProTable } from './UniTableProTable'
import { UniTableImportModal } from './UniTableImportModal'
import type { UniTableProps } from './types'
import { useUniTableData } from './hooks/useUniTableData'
import { useUniTableColumns } from './hooks/useUniTableColumns'
import { useUniTableToolbar } from './toolbar/useUniTableToolbar'
import { useUniTableRowSelection } from './hooks/useUniTableRowSelection'
import { useUniTableScroll } from './hooks/useUniTableScroll'
import { useStableShallowValue } from './hooks/useStableShallowValue'

/**
 * 清除 UniTable 列表 TanStack 缓存（与工具栏 refresh 相同语义），便于跨页 mutation 后其它列表立即拉新数据。
 */
export function invalidateUniTableListCache(
  queryClient: QueryClient,
  ...columnPersistenceIds: string[]
): void {
  for (const id of columnPersistenceIds) {
    const trimmed = id.trim()
    if (!trimmed) continue
    const queryKey = ['uniTable', trimmed] as const
    void queryClient.cancelQueries({ queryKey, exact: false })
    queryClient.removeQueries({ queryKey, exact: false })
  }
}

/** @see 文件顶部 JSDoc 分层（uni-search / uni-view / uni-batch / uni-import 等） */
export function UniTable<T extends Record<string, any> = Record<string, any>>({
  request,
  columns,
  headerTitle,
  headerActions,
  rowKey = 'id',
  showFuzzySearch = true, // 默认显示模糊搜索
  skipFuzzyPinyinClientFilter = false,
  fuzzySearchPlaceholder,
  showAdvancedSearch = true, // 默认显示高级搜索
  searchPlacement = 'searchRow',
  beforeSearchButtons,
  betweenFuzzyAndAdvancedButtons,
  afterSearchButtons,
  enableRowSelection = false,
  onRowSelectionChange,
  onTableDataChange,
  selectedRowKeys: selectedRowKeysProp,
  rowSelectionGetCheckboxProps,
  disableRowClickSelection = false,
  enableRowEdit = false,
  onRowEditSave,
  onRowEditDelete,
  toolBarActionsBeforeCreate = [],
  toolBarActionsAfterCreate = [],
  toolBarActions = [],
  toolBarActionsAfterDelete = [],
  toolBarActionsAfterBatch = [],
  showImportButton = true,
  onImport,
  onImportPrecheck,
  importHeaders,
  importExampleRow,
  importTemplateName,
  importFieldMap,
  enableCustomImport = false,
  enableRelationImport = false,
  relationImportConfig,
  onRelationImportPrecheck,
  onRelationImportSubmit,
  importFieldRules,
  autoGenerateImportConfig = true,
  showExportButton = true,
  onExport,
  exportButtonText,
  rightToolBarActionsBeforeExport = [],
  showSyncButton = false,
  onSync,
  syncButtonText,
  showDatasetConfigButton = false,
  onDatasetConfig,
  datasetConfigButtonText,
  showPrintButton = false,
  onPrint,
  printButtonText,
  permissionResource: permissionResourceProp,
  completeCreateSourceResource,
  showCreateButton = false,
  onCreate,
  createButtonText,
  showEditButton = false,
  onEdit,
  onDetail,
  detailButtonText,
  showDeleteButton = false,
  onDelete,
  deleteButtonText,
  deleteConfirmTitle,
  deleteConfirmDescription,
  deleteButtonDisabled = false,
  defaultPageSize: defaultPageSizeProp,
  showQuickJumper = true,
  viewTypes = ['table', 'help'],
  defaultViewType = 'table',
  onViewTypeChange,
  tableViewTypes,
  detailTableColumns,
  ganttViewConfig,
  helpViewConfig,
  cardViewConfig,
  kanbanViewConfig,
  statsViewConfig,
  customViews,
  touchViewConfig,
  toolBarButtonSize,
  loadingDelay: loadingDelayProp,
  showLoading = false,
  virtualized = false,
  virtualTableBodyMaxHeight = 520,
  allowCustomScrollY = false,
  fillViewportBody = false,
  allowCustomScrollX = false,
  actionRef: externalActionRef,
  formRef: externalFormRef,
  searchParamsRef: externalSearchParamsRef,
  tanstackQuery,
  columnPersistenceId,
  embedded = false,
  columnsState: userColumnsState,
  searchFormItems: _unusedSearchFormItems,
  ...restProps
}: UniTableProps<T>) {
  const { t } = useTranslation()
  const location = useLocation()
  const pagePermissionResource = usePagePermissionResource(location.pathname)
  const permissionGates = useResourcePermissions(
    permissionResourceProp ?? pagePermissionResource,
    completeCreateSourceResource ? { completeCreateSourceResource } : undefined
  )
  const gatedShowCreateButton = showCreateButton && permissionGates.canCreate
  const gatedShowDeleteButton = showDeleteButton && permissionGates.canDelete
  const gatedShowEditButton = showEditButton && permissionGates.canUpdate
  const gatedShowImportButton = showImportButton && permissionGates.canImport
  const gatedShowExportButton = showExportButton && permissionGates.canExport
  const queryClient = useQueryClient()
  const getConfig = useConfigStore(s => s.getConfig)
  const getPreference = useUserPreferenceStore(s => s.getPreference)
  const syncTablePreference = useUserPreferenceStore(s => s.syncTablePreference)
  const statCardsCtx = useListPageStatCardsContext()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md && screens.xs // 手机端判定：小于 768px 且有 xs

  // 全局 Alt+N：当前页有新建按钮时，按 Alt+N 触发新建（与点击新建按钮一致）
  useNewShortcut(gatedShowCreateButton && onCreate ? onCreate : undefined)

  // 计算最终配置（优先使用 Props，其次使用用户偏好，最后使用全局配置）
  // 分页大小优先级：Props > User Preference > Config Store > Default(20)
  const defaultPageSize =
    defaultPageSizeProp ??
    getPreference('ui.default_page_size', getConfig('ui.default_page_size', 20))

  const loadingDelay = loadingDelayProp ?? getConfig('ui.table_loading_delay', 0)

  /** 已 patch @ant-design/pro-table：`debounceTime != null ? debounceTime : 30`，0 为同步触发 */
  const tableRequestDebounce = restProps.debounceTime ?? 0

  /** restProps 浅比较稳定：值链未变化时复用引用，避免 memo 子组件随主组件空转重渲。 */
  const stableRestProps = useStableShallowValue(restProps)

  // 视图类型状态（支持内置类型及 customViews 的 key）
  const [currentViewType, setCurrentViewType] = useState<string>(defaultViewType)
  // ⭐ 关键：使用 useProTableSearch Hook 管理搜索参数
  const {
    searchParamsRef: hookSearchParamsRef,
    formRef: hookFormRef,
    actionRef: hookActionRef,
  } = useProTableSearch()
  const searchParamsRef = (externalSearchParamsRef ||
    hookSearchParamsRef) as React.MutableRefObject<Record<string, any> | undefined>

  const internalActionRef = useRef<ActionType>()
  const internalFormRef = useRef<ProFormInstance>()
  const buttonContainerRef = useRef<HTMLDivElement>(null)

  /**
   * ProTable 实际挂载的 action ref（始终独立持有，避免与页面 ref 互相覆盖）。
   * 页面 / hook / 内部 ref 通过 layout effect 同步「带 TanStack 强刷新的 reload」。
   */
  const nativeTableActionRef = useRef<ActionType>()
  const actionRefForProTable = nativeTableActionRef as React.MutableRefObject<
    ActionType | undefined
  >
  const outwardActionRef = (externalActionRef ||
    hookActionRef ||
    internalActionRef) as React.MutableRefObject<ActionType | undefined>
  const formRef = (externalFormRef || hookFormRef || internalFormRef) as React.MutableRefObject<
    ProFormInstance | undefined
  >

  // 导入弹窗可见状态（用于 showImportButton 时）
  const [importModalVisible, setImportModalVisible] = useState(false)

  // 拼音首字母过滤时遍历的列：排除 hideInSearch，减少大表列定义下的 CPU 开销
  const columnsForPinyinSearch = useMemo(() => {
    return columns.filter((col: ProColumns<T>) => {
      if (!col.dataIndex) return false
      if (col.hideInSearch === true) return false
      return true
    })
  }, [columns])

  const dataState = useUniTableData<T>({
    queryClient,
    request,
    dataSource: stableRestProps.dataSource as T[] | undefined,
    showLoading,
    loadingDelay,
    defaultPageSize,
    columnPersistenceId,
    tanstackQuery,
    skipFuzzyPinyinClientFilter,
    onTableDataChange,
    columnsForPinyinSearch,
    formRef,
    searchParamsRef,
    nativeTableActionRef: actionRefForProTable,
  })
  const {
    tableData,
    setTableData,
    currentPageSize,
    showDelayedLoading,
    fuzzySearchKeyword,
    pinnedSearchUiEpoch,
    setPinnedSearchUiEpoch,
    handleRequest,
    handleFuzzySearch,
    handleSearchReset,
    warmupPinyinIfNeeded,
    reloadWithTanstackCacheBust,
    reloadAndRestWithTanstackCacheBust,
  } = dataState

  // 预加载 UniImport（UniverSheet ~2MB）：直接在挂载时触发 import，让浏览器与页面其它资源并行下载。
  // 不再用 requestIdleCallback 做"空闲时"调度，那属于不确定时序的妥协。
  useEffect(() => {
    if (!gatedShowImportButton || !onImport) return
    import('../uni-import').catch(() => {})
  }, [gatedShowImportButton, onImport])

  const columnsState = useUniTableColumns<T>({
    columns,
    detailTableColumns,
    currentViewType,
    headerTitle,
    columnPersistenceId,
    userColumnsState,
    importHeaders,
    importExampleRow,
    importFieldMap,
    autoGenerateImportConfig,
    importTemplateName,
    t,
    location,
    syncTablePreference,
    permissionGates,
  })
  const {
    processedColumns,
    resizableColumns,
    resizableComponents,
    effectiveTableColumns,
    handleColumnReset,
    effectiveTableWidth,
    mergedColumnsStateProp,
    columnsPersistenceFullKey,
    columnsStatePatchEpoch,
    effectiveImportConfig,
    importTemplateDocumentName,
  } = columnsState

  /**
   * 当视图类型是卡片/看板/统计视图时，确保数据已加载
   * 如果 tableData 为空且 actionRef 可用，主动触发数据加载
   */
  useEffect(() => {
    if (
      currentViewType !== 'table' &&
      currentViewType !== 'detailTable' &&
      tableData.length === 0 &&
      actionRefForProTable?.current
    ) {
      // 延迟执行，确保组件完全初始化
      setTimeout(() => {
        actionRefForProTable.current?.reload()
      }, 100)
    }
  }, [currentViewType, tableData.length])

  const rowSelectionState = useUniTableRowSelection<T>({
    enableRowSelection,
    onRowSelectionChange,
    selectedRowKeysProp,
    rowSelectionGetCheckboxProps,
    disableRowClickSelection,
    rowKey,
    onDelete,
    userRowSelection: stableRestProps.rowSelection,
    userOnRow: stableRestProps.onRow as any,
    enableRowEdit,
    onRowEditSave,
    onRowEditDelete,
    nativeTableActionRef,
  })
  const {
    selectedRowKeys,
    clearAllRowSelection,
    handleBatchDeleteConfirm,
    syncInternalSelectedRowKeys,
    tableHasRowSelection,
    rowClickSelectionEnabled,
    memoizedRowSelection,
    memoizedEditable,
    mergeOnRowWithRowClickSelection,
  } = rowSelectionState

  const toolbarState = useUniTableToolbar<T>({
    headerActions,
    headerTitle,
    toolBarActionsBeforeCreate,
    toolBarActionsAfterCreate,
    toolBarActions,
    toolBarActionsAfterDelete,
    toolBarActionsAfterBatch,
    toolBarButtonSize,
    showFuzzySearch,
    fuzzySearchPlaceholder,
    showAdvancedSearch,
    searchPlacement,
    beforeSearchButtons,
    betweenFuzzyAndAdvancedButtons,
    afterSearchButtons,
    viewTypes,
    showCreateButton,
    onCreate,
    createButtonText,
    showEditButton,
    onEdit,
    onDetail,
    detailButtonText,
    showDeleteButton,
    onDelete,
    deleteButtonText,
    deleteConfirmTitle,
    deleteConfirmDescription,
    deleteButtonDisabled,
    showImportButton,
    onImport,
    showExportButton,
    onExport,
    exportButtonText,
    rightToolBarActionsBeforeExport,
    showSyncButton,
    onSync,
    syncButtonText,
    showDatasetConfigButton,
    onDatasetConfig,
    datasetConfigButtonText,
    showPrintButton,
    onPrint,
    printButtonText,
    toolBarRender: stableRestProps.toolBarRender as any,
    options: stableRestProps.options,
    toolbar: stableRestProps.toolbar as any,
    permissionGates,
    gatedShowCreateButton,
    gatedShowDeleteButton,
    gatedShowEditButton,
    gatedShowImportButton,
    gatedShowExportButton,
    selectedRowKeys,
    tableData,
    statCardsCtx,
    reload: reloadWithTanstackCacheBust,
    reloadAndRest: reloadAndRestWithTanstackCacheBust,
    handleColumnReset,
    handleFuzzySearch,
    handleSearchReset,
    handleBatchDeleteConfirm,
    openImportModal: () => setImportModalVisible(true),
    searchParamsRef,
    formRef,
    actionRef: outwardActionRef,
    fuzzySearchKeyword,
    pinnedSearchUiEpoch,
    setPinnedSearchUiEpoch,
    processedColumns,
    warmupPinyinIfNeeded,
    isMobile: !!isMobile,
  })
  const {
    containerRef,
    memoizedHeaderTitle,
    memoizedToolbar,
    memoizedOptions,
    memoizedRightActions,
    memoizedUniSearch,
    showSearchToolbarRow,
    hasListToolbarActions,
    statCardsOptionsRender,
  } = toolbarState

  /**
   * 处理视图类型切换
   */
  const handleViewTypeChange = (viewType: string) => {
    setCurrentViewType(viewType)
    if (onViewTypeChange) {
      onViewTypeChange(viewType)
    }
  }

  const memoizedPagination = useMemo(
    () => ({
      defaultPageSize,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (total: number, range: [number, number]) =>
        t('components.uniTable.paginationTotal', { total, start: range[0], end: range[1] }),
      ...(stableRestProps.pagination as Record<string, unknown> | undefined),
    }),
    [defaultPageSize, t, stableRestProps.pagination]
  )
  const effectiveTableAlertRender = stableRestProps.tableAlertRender ?? false
  const restTableVirtual = stableRestProps.virtual === true
  const restTableScrollY = stableRestProps.scroll?.y

  const isEmptyTable = tableData.length === 0
  const emptyTableHasFixedColumns = isEmptyTable && hasUniTableFixedColumns(effectiveTableColumns)
  const userOnRowProp = stableRestProps.onRow
  const mergedOnRow = rowClickSelectionEnabled
    ? mergeOnRowWithRowClickSelection
    : userOnRowProp

  const scrollState = useUniTableScroll({
    containerRef,
    allowCustomScrollY,
    restTableScrollY,
    fillViewportBody,
    virtualized,
    restTableVirtual,
    tableData,
    currentPageSize,
    statCardsCtx,
    currentViewType,
    showDelayedLoading,
    effectiveTableColumns,
    isEmptyTable,
    emptyTableHasFixedColumns,
    enableRowSelection,
    selectedRowKeysLength: selectedRowKeys.length,
    isMobile: !!isMobile,
  })
  const {
    tableBodyPaneRef,
    proTableBodyScrollYEnabled,
    listPageScrollY,
    selectionAlertLayout,
  } = scrollState

  /** 同步 ProTable 原生 action 到页面 ref，并对 reload / reloadAndRest 包一层 TanStack 强刷新。 */
  React.useLayoutEffect(() => {
    const inner = nativeTableActionRef.current
    if (!inner) {
      outwardActionRef.current = undefined as any
      return
    }
    outwardActionRef.current = {
      ...inner,
      reload: reloadWithTanstackCacheBust as ActionType['reload'],
      reloadAndRest: reloadAndRestWithTanstackCacheBust as ActionType['reloadAndRest'],
      clearSelected: () => clearAllRowSelection(),
    }
  }, [
    outwardActionRef,
    reloadWithTanstackCacheBust,
    reloadAndRestWithTanstackCacheBust,
    clearAllRowSelection,
  ])

  return (
    <>
      <style>{UNI_TABLE_STYLES}</style>
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={`uni-table-container${embedded ? ' uni-table-embedded' : ''}${proTableBodyScrollYEnabled ? ' uni-table-scroll-y-mode' : ' uni-table-natural-height'}${isEmptyTable ? ' uni-table-empty' : ''}${emptyTableHasFixedColumns ? ' uni-table-empty-has-fixed' : ''}${hasListToolbarActions ? ' uni-table-has-list-toolbar' : ''}`}
        style={{
          position: 'relative',
          padding: isMobile ? '0 8px' : 0,
          margin: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          ...(fillViewportBody ? { flex: 1, minHeight: 0 } : {}),
        }}
      >
        <div className="uni-table-search-pane-wrap" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          {showSearchToolbarRow ? (
            <div
              ref={buttonContainerRef}
              className="pro-table-button-container"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: isMobile ? 'wrap' : 'nowrap',
                gap: 8,
                rowGap: 8,
                width: '100%',
                marginTop: isMobile ? 8 : 0,
                minWidth: 0,
              }}
            >
              {searchPlacement === 'searchRow' ? memoizedUniSearch : null}
              {!isMobile && viewTypes && viewTypes.length > 1 ? (
                <div style={{ flexShrink: 0, marginLeft: 8 }}>
                  <UniView
                    viewTypes={viewTypes}
                    value={currentViewType}
                    onChange={handleViewTypeChange}
                    customViews={customViews}
                    style={{ marginLeft: 0 }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <UniTableProTable<T>
            columnsPersistenceFullKey={columnsPersistenceFullKey}
            columnsStatePatchEpoch={columnsStatePatchEpoch}
            memoizedHeaderTitle={memoizedHeaderTitle}
            tableBodyPaneRef={tableBodyPaneRef}
            actionRefForProTable={actionRefForProTable}
            formRef={formRef}
            effectiveTableColumns={effectiveTableColumns}
            handleRequest={handleRequest}
            tableRequestDebounce={tableRequestDebounce}
            rowKey={rowKey}
            showLoading={showLoading}
            loadingDelay={loadingDelay}
            showDelayedLoading={showDelayedLoading}
            mergedColumnsStateProp={mergedColumnsStateProp}
            memoizedToolbar={memoizedToolbar}
            memoizedRowSelection={memoizedRowSelection}
            memoizedEditable={memoizedEditable}
            memoizedPagination={memoizedPagination}
            effectiveTableAlertRender={effectiveTableAlertRender}
            selectedRowKeysProp={selectedRowKeysProp}
            selectedRowKeys={selectedRowKeys}
            enableRowSelection={enableRowSelection}
            syncInternalSelectedRowKeys={syncInternalSelectedRowKeys}
            memoizedRightActions={memoizedRightActions}
            restProps={stableRestProps}
            proTableBodyScrollYEnabled={proTableBodyScrollYEnabled}
            isEmptyTable={isEmptyTable}
            emptyTableHasFixedColumns={emptyTableHasFixedColumns}
            tableHasRowSelection={tableHasRowSelection}
            effectiveTableWidth={effectiveTableWidth}
            allowCustomScrollY={allowCustomScrollY}
            allowCustomScrollX={allowCustomScrollX}
            virtualized={virtualized}
            virtualTableBodyMaxHeight={virtualTableBodyMaxHeight}
            listPageScrollY={listPageScrollY}
            rowClickSelectionEnabled={rowClickSelectionEnabled}
            mergedOnRow={mergedOnRow}
            resizableColumns={resizableColumns}
            resizableComponents={resizableComponents}
            statCardsOptionsRender={statCardsOptionsRender}
            memoizedOptions={memoizedOptions}
            embedded={embedded}
            currentViewType={currentViewType}
            tableViewTypes={tableViewTypes}
            isMobile={!!isMobile}
            selectionAlertLayout={selectionAlertLayout}
            handleClearSelection={clearAllRowSelection}
            t={t}
          />

          <UniTableViews<T>
            currentViewType={currentViewType}
            viewTypes={viewTypes}
            tableViewTypes={tableViewTypes}
            tableData={tableData}
            ganttViewConfig={ganttViewConfig}
            cardViewConfig={cardViewConfig}
            kanbanViewConfig={kanbanViewConfig}
            statsViewConfig={statsViewConfig}
            helpViewConfig={helpViewConfig}
            customViews={customViews}
            touchViewConfig={touchViewConfig}
          />
          <UniTableMobileCards<T>
            isMobile={isMobile}
            currentViewType={currentViewType}
            tableViewTypes={tableViewTypes}
            tableData={tableData}
            effectiveTableColumns={effectiveTableColumns}
            rowKey={rowKey}
          />
        </div>
      </div>

      {/* 导入弹窗：仅当用户点击导入时才加载 UniverJS 相关 chunk，显著减轻首屏体积 */}
      {gatedShowImportButton && onImport && importModalVisible && (
        <UniTableImportModal<T>
          visible={importModalVisible}
          onCancel={() => setImportModalVisible(false)}
          onConfirm={data => {
            onImport(data)
            setImportModalVisible(false)
            void reloadWithTanstackCacheBust()
          }}
          headers={effectiveImportConfig.headers}
          exampleRow={effectiveImportConfig.exampleRow}
          importFieldMap={effectiveImportConfig.fieldMap}
          enableCustomImport={enableCustomImport}
          enableRelationImport={enableRelationImport}
          relationImportConfig={relationImportConfig}
          onRelationImportPrecheck={onRelationImportPrecheck}
          onRelationImportSubmit={onRelationImportSubmit}
          templateDocumentName={importTemplateDocumentName}
          onImportPrecheck={onImportPrecheck}
        />
      )}
    </>
  )
}

export default UniTable
