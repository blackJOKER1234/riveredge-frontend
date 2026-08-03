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

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  lazy,
} from 'react'
import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { ProTable, ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components'
import { ConfigProvider, Grid } from 'antd'
import UniView from '../uni-view'
import { useConfigStore } from '../../stores/configStore'
import { useListPageStatCardsContext } from '../layout-templates/listPageStatCardsContext'
import { useUserPreferenceStore } from '../../stores/userPreferenceStore'
import { useNewShortcut } from '../../hooks/useNewShortcut'
import { usePagePermissionResource } from '../../hooks/usePagePermissionResource'
import { useResourcePermissions } from '../../hooks/useResourcePermissions'
import { LIST_PAGE_TABLE_SCROLL, getViewportHeightExpr } from '../layout-templates/constants'
import {
  shouldEnableUniTableBodyScrollY,
  measureTableBodyOverflowsViewport,
} from './uniTableScrollPolicy'
import {
  UNI_TABLE_SELECTION_COL_WIDTH,
  computeUniTableMinScrollX,
} from '../../utils/uniTableLayoutColumns'
import { useProTableSearch } from './useProTableSearch'
import { shouldIgnoreRowClickForSelection } from './rowClickSelection'
import {
  hasUniTableFixedColumns,
} from './columnPolicy'
import { UNI_TABLE_STYLES } from './uniTableStyles'
import { UniTableViews, UniTableMobileCards } from './UniTableViews'
import type { UniTableProps } from './types'
import { useUniTableData } from './hooks/useUniTableData'
import { useUniTableColumns } from './hooks/useUniTableColumns'
import { useUniTableToolbar } from './toolbar/useUniTableToolbar'

// 懒加载：UniImport 内含 UniverJS（约 2MB+），仅在用户点击导入时加载
const LazyUniImport = lazy(() => import('../uni-import'))

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
  const tableBodyPaneRef = useRef<HTMLDivElement>(null)

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


  // 存储选中的行键（支持外部受控与内部自持两种模式）
  const [internalSelectedRowKeys, setInternalSelectedRowKeys] = useState<React.Key[]>([])
  const selectedRowKeys =
    selectedRowKeysProp !== undefined ? selectedRowKeysProp : internalSelectedRowKeys

  /** 同步清空 ProTable 与受控/内部选中态（删除后避免「已选择 N 项」残留） */
  const clearAllRowSelection = useCallback(() => {
    nativeTableActionRef.current?.clearSelected?.()
    setInternalSelectedRowKeys([])
    onRowSelectionChange?.([])
  }, [onRowSelectionChange])

  const handleBatchDeleteConfirm = useCallback(
    async (keys: React.Key[]) => {
      if (!onDelete) return
      // 统一去重，避免上游选中态出现重复 key 时触发“前端一次、后端多次删同一记录”误报。
      const uniqueKeys = Array.from(new Set(keys))
      await Promise.resolve(onDelete(uniqueKeys))
      clearAllRowSelection()
    },
    [onDelete, clearAllRowSelection]
  )

  useEffect(() => {
    if (selectedRowKeysProp !== undefined) {
      setInternalSelectedRowKeys(selectedRowKeysProp)
      if (selectedRowKeysProp.length === 0) {
        nativeTableActionRef.current?.clearSelected?.()
      }
    }
  }, [selectedRowKeysProp])

  // 导入弹窗可见状态（用于 showImportButton 时）
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [selectionAlertLayout, setSelectionAlertLayout] = useState<{
    top: number
    height: number
  } | null>(null)

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
    dataSource: restProps.dataSource as T[] | undefined,
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
   * 将按钮容器移动到 ant-pro-table 内部
   */
  /**
   * 将按钮容器移动到 ant-pro-table 内部
   *
   * fix: 不再移动按钮容器。
   * 原因：当切换到卡片/看板等视图时，ProTable 会被隐藏 (display: none)，導致内部的按钮容器也不可见。
   * 为了在所有视图模式下都能看到搜索和切换按钮，需要保持容器在 ProTable 外部。
   */
  /*
  useLayoutEffect(() => {
    // 移动搜索框到 ProTable 内部
    // ... logic removed ...
  }, [currentViewType])
  */

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
    toolBarRender: restProps.toolBarRender as any,
    options: restProps.options,
    toolbar: restProps.toolbar as any,
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

  /**
   * 处理行选择变化（与 ProTable `rowSelection.selectedRowKeys` 受控联动，保证点行勾选与勾选列一致）
   */
  const handleRowSelectionChange = useCallback(
    (keys: React.Key[]) => {
      setInternalSelectedRowKeys(keys)
      onRowSelectionChange?.(keys)
    },
    [onRowSelectionChange]
  )

  const normalizedUserRowSelection = React.useMemo(() => {
    const userRowSelection = (restProps as { rowSelection?: unknown }).rowSelection
    if (!userRowSelection || typeof userRowSelection !== 'object') {
      return userRowSelection as
        | ({
            columnWidth?: number
          } & Record<string, unknown>)
        | undefined
    }
    const rowSelectionObj = userRowSelection as {
      columnWidth?: number
    } & Record<string, unknown>
    if (rowSelectionObj.columnWidth != null) return rowSelectionObj
    return {
      ...rowSelectionObj,
      columnWidth: UNI_TABLE_SELECTION_COL_WIDTH,
    }
  }, [restProps])

  const memoizedRowSelection = React.useMemo(
    () =>
      enableRowSelection
        ? {
            ...(normalizedUserRowSelection && typeof normalizedUserRowSelection === 'object'
              ? normalizedUserRowSelection
              : {}),
            type: 'checkbox' as const,
            columnWidth:
              normalizedUserRowSelection &&
              typeof normalizedUserRowSelection === 'object' &&
              normalizedUserRowSelection.columnWidth != null
                ? normalizedUserRowSelection.columnWidth
                : UNI_TABLE_SELECTION_COL_WIDTH,
            selectedRowKeys,
            onChange: handleRowSelectionChange,
            ...(rowSelectionGetCheckboxProps
              ? { getCheckboxProps: rowSelectionGetCheckboxProps }
              : {}),
          }
        : normalizedUserRowSelection,
    [
      enableRowSelection,
      normalizedUserRowSelection,
      selectedRowKeys,
      handleRowSelectionChange,
      rowSelectionGetCheckboxProps,
    ]
  )

  const memoizedEditable = React.useMemo(
    () =>
      enableRowEdit
        ? {
            type: 'multiple' as const,
            onSave: onRowEditSave as any,
            onDelete: onRowEditDelete as any,
          }
        : undefined,
    [enableRowEdit, onRowEditSave, onRowEditDelete]
  )

  const handleClearSelection = clearAllRowSelection

  const memoizedPagination = React.useMemo(
    () => ({
      defaultPageSize,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (total: number, range: [number, number]) =>
        t('components.uniTable.paginationTotal', { total, start: range[0], end: range[1] }),
      ...(restProps.pagination as Record<string, unknown> | undefined),
    }),
    [defaultPageSize, t, restProps.pagination]
  )
  const effectiveTableAlertRender = (restProps as any).tableAlertRender ?? false
  const restTableVirtual = (restProps as any).virtual === true
  const restTableScrollY = (restProps as any).scroll?.y

  const scrollPolicyInput = React.useMemo(
    () => ({
      allowCustomScrollY,
      restTableScrollY,
      fillViewportBody,
      virtualized,
      restTableVirtual,
      tableDataLength: tableData.length,
      currentPageSize,
    }),
    [
      allowCustomScrollY,
      restTableScrollY,
      fillViewportBody,
      virtualized,
      restTableVirtual,
      tableData.length,
      currentPageSize,
    ]
  )

  /** 策略层 scroll.y（按行数）；未装满页默认 natural-height */
  const policyScrollYEnabled = React.useMemo(
    () => shouldEnableUniTableBodyScrollY(scrollPolicyInput),
    [scrollPolicyInput]
  )
  /** 实测表体超出视口时补开 scroll.y（多行单元格、树表展开等） */
  const [viewportScrollForced, setViewportScrollForced] = useState(false)
  const proTableBodyScrollYEnabled = policyScrollYEnabled || viewportScrollForced

  const isEmptyTable = tableData.length === 0
  const emptyTableHasFixedColumns = isEmptyTable && hasUniTableFixedColumns(effectiveTableColumns)
  const tableHasRowSelection = enableRowSelection || !!normalizedUserRowSelection

  const rowClickSelectionEnabled =
    !disableRowClickSelection && tableHasRowSelection && !!memoizedRowSelection

  const userOnRowProp = (
    restProps as { onRow?: (record: T, index: number) => Record<string, unknown> }
  ).onRow

  const getEffectiveSelectedRowKeys = useCallback((): React.Key[] => {
    const fromRowSelection = memoizedRowSelection?.selectedRowKeys
    if (Array.isArray(fromRowSelection)) return fromRowSelection as React.Key[]
    return selectedRowKeys
  }, [memoizedRowSelection, selectedRowKeys])

  const notifyRowSelectionChange = useCallback(
    (nextKeys: React.Key[]) => {
      const rsOnChange = memoizedRowSelection?.onChange as
        | ((keys: React.Key[], selectedRows: T[], info: { type: string }) => void)
        | undefined
      if (typeof rsOnChange === 'function') {
        rsOnChange(nextKeys, [], { type: 'multiple' })
        return
      }
      handleRowSelectionChange(nextKeys)
    },
    [memoizedRowSelection, handleRowSelectionChange]
  )

  const mergeOnRowWithRowClickSelection = useCallback(
    (record: T, index: number) => {
      const base = typeof userOnRowProp === 'function' ? (userOnRowProp(record, index) ?? {}) : {}
      if (!rowClickSelectionEnabled) return Object.keys(base).length > 0 ? base : undefined

      return {
        ...base,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          const el = e.target
          if (!(el instanceof Element)) return
          if (shouldIgnoreRowClickForSelection(el)) return
          ;(base as { onClick?: (ev: React.MouseEvent<HTMLElement>) => void }).onClick?.(e)
          if (e.defaultPrevented) return

          const recordKey =
            typeof rowKey === 'function'
              ? (rowKey as (r: T, i?: number) => React.Key)(record, index)
              : ((record as Record<string, unknown>)[rowKey as string] as React.Key)
          if (recordKey === undefined || recordKey === null) return

          if (rowSelectionGetCheckboxProps) {
            const p = rowSelectionGetCheckboxProps(record)
            if (p?.disabled) return
          }

          const key = recordKey as React.Key
          const currentKeys = getEffectiveSelectedRowKeys()
          const selectionType = memoizedRowSelection?.type === 'radio' ? 'radio' : 'checkbox'
          let next: React.Key[]
          if (selectionType === 'radio') {
            next = [key]
          } else {
            const has = currentKeys.includes(key)
            next = has ? currentKeys.filter(k => k !== key) : [...currentKeys, key]
          }
          notifyRowSelectionChange(next)
        },
      }
    },
    [
      userOnRowProp,
      rowClickSelectionEnabled,
      rowKey,
      rowSelectionGetCheckboxProps,
      getEffectiveSelectedRowKeys,
      memoizedRowSelection?.type,
      notifyRowSelectionChange,
    ]
  )

  const listPageScrollY = React.useMemo(() => {
    if (!proTableBodyScrollYEnabled) return undefined
    const offsetPx = statCardsCtx?.tableScrollOffsetPx
    if (offsetPx != null) {
      return getViewportHeightExpr(offsetPx, { compensateHeaderInFullscreen: true })
    }
    return `calc(100vh - var(--uni-table-scroll-offset, ${LIST_PAGE_TABLE_SCROLL.DEFAULT_FALLBACK_OFFSET_PX}px) + (${LIST_PAGE_TABLE_SCROLL.HEADER_HEIGHT_PX}px - var(--header-height, ${LIST_PAGE_TABLE_SCROLL.HEADER_HEIGHT_PX}px)))`
  }, [proTableBodyScrollYEnabled, statCardsCtx?.tableScrollOffsetPx])

  React.useLayoutEffect(() => {
    if (statCardsCtx?.tableScrollOffsetPx == null) return
    window.dispatchEvent(new Event('resize'))
  }, [statCardsCtx?.tableScrollOffsetPx])

  React.useLayoutEffect(() => {
    if (policyScrollYEnabled) {
      setViewportScrollForced(false)
      return
    }
    if (tableData.length === 0) {
      setViewportScrollForced(false)
      return
    }
    if (currentViewType !== 'table' && currentViewType !== 'detailTable') {
      setViewportScrollForced(false)
      return
    }

    const root = containerRef.current
    if (!root) return

    const measure = () => {
      setViewportScrollForced(measureTableBodyOverflowsViewport(root))
    }

    measure()
    const raf = window.requestAnimationFrame(measure)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measure()) : null
    const tbody = root.querySelector('.ant-table-tbody')
    if (ro && tbody) ro.observe(tbody)
    const tableWrapper = root.querySelector('.ant-table-wrapper')
    if (ro && tableWrapper) ro.observe(tableWrapper)
    window.addEventListener('resize', measure)
    return () => {
      window.cancelAnimationFrame(raf)
      ro?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [
    policyScrollYEnabled,
    tableData,
    currentViewType,
    effectiveTableColumns,
    showDelayedLoading,
    currentPageSize,
  ])

  /** natural-height：antd 在 scroll.x 下可能重设 overflow，布局后强制关闭纵向滚动避免空纵条 */
  React.useLayoutEffect(() => {
    if (proTableBodyScrollYEnabled) return
    const root = containerRef.current
    if (!root) return

    const applyNaturalHeightScroll = () => {
      root
        .querySelectorAll<HTMLElement>(
          '.ant-table-header, .ant-table-content, .ant-table-body, .ant-table-body-inner, .ant-table-fixed-left .ant-table-body-inner, .ant-table-fixed-right .ant-table-body-inner'
        )
        .forEach(el => {
          el.style.overflowY = 'hidden'
          el.style.maxHeight = 'none'
          el.style.scrollbarGutter = 'stable'
          if (isEmptyTable && !emptyTableHasFixedColumns) {
            el.style.setProperty('overflow-x', 'hidden', 'important')
          } else {
            el.style.removeProperty('overflow-x')
          }
        })
    }

    applyNaturalHeightScroll()
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => applyNaturalHeightScroll())
        : null
    const tableHost = root.querySelector('.ant-table-wrapper')
    if (ro && tableHost) ro.observe(tableHost)
    return () => ro?.disconnect()
  }, [
    proTableBodyScrollYEnabled,
    isEmptyTable,
    emptyTableHasFixedColumns,
    tableData,
    currentViewType,
    showDelayedLoading,
  ])

  React.useLayoutEffect(() => {
    if (!enableRowSelection || selectedRowKeys.length === 0) return
    const host = tableBodyPaneRef.current
    if (!host) return

    const syncLayout = () => {
      const pager = host.querySelector(
        '.ant-table-wrapper .ant-table-pagination'
      ) as HTMLElement | null
      if (!pager) return
      const hostRect = host.getBoundingClientRect()
      const pagerRect = pager.getBoundingClientRect()
      const next = {
        top: Math.max(0, pagerRect.top - hostRect.top),
        height: Math.max(1, pagerRect.height),
      }
      setSelectionAlertLayout(prev => {
        if (!prev) return next
        if (Math.abs(prev.top - next.top) < 0.5 && Math.abs(prev.height - next.height) < 0.5)
          return prev
        return next
      })
    }

    syncLayout()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => syncLayout()) : null
    if (ro) {
      ro.observe(host)
      const pager = host.querySelector(
        '.ant-table-wrapper .ant-table-pagination'
      ) as HTMLElement | null
      if (pager) ro.observe(pager)
    }
    window.addEventListener('resize', syncLayout)
    return () => {
      window.removeEventListener('resize', syncLayout)
      ro?.disconnect()
    }
  }, [enableRowSelection, selectedRowKeys.length, currentViewType, isMobile])


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
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
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

          <ConfigProvider getPopupContainer={() => document.body}>
            <div
              ref={tableBodyPaneRef}
              className="uni-table-body-pane"
              style={{
                display:
                  (currentViewType === 'table' ||
                    currentViewType === 'detailTable' ||
                    (tableViewTypes && tableViewTypes.includes(currentViewType))) &&
                  !isMobile
                    ? 'block'
                    : 'none',
                width: '100%',
                position: 'relative',
              }}
            >
              <ProTable<T>
                key={`uni-pt-cols-${String(columnsPersistenceFullKey ?? 'np')}-${columnsStatePatchEpoch}`}
                headerTitle={memoizedHeaderTitle}
                actionRef={actionRefForProTable}
                formRef={formRef}
                columns={effectiveTableColumns}
                request={handleRequest}
                debounceTime={tableRequestDebounce}
                rowKey={rowKey}
                search={false}
                style={{ margin: 0, padding: 0 }}
                bordered={false}
                cardBordered={!embedded}
                {...(!showLoading
                  ? { loading: false }
                  : loadingDelay > 0
                    ? { loading: showDelayedLoading }
                    : {})}
                columnsState={mergedColumnsStateProp}
                toolbar={memoizedToolbar}
                rowSelection={memoizedRowSelection}
                editable={memoizedEditable}
                pagination={memoizedPagination}
                tableAlertRender={effectiveTableAlertRender}
                toolBarRender={(_action, { selectedRowKeys: toolBarSelectedRowKeys }) => {
                  // 非受控模式：同步 ProTable 工具栏选中到内部 state；受控模式以 props 为准，避免删除后残留 ghost keys
                  if (selectedRowKeysProp === undefined && toolBarSelectedRowKeys) {
                    const currentKeys = selectedRowKeys
                    const newKeys = toolBarSelectedRowKeys
                    if (
                      currentKeys.length !== newKeys.length ||
                      currentKeys.some((key, index) => key !== newKeys[index])
                    ) {
                      requestAnimationFrame(() => {
                        setInternalSelectedRowKeys(newKeys)
                      })
                    }
                  }
                  return memoizedRightActions ? [memoizedRightActions] : []
                }}
                {...(() => {
                  // 过滤 toolBarRender/search；scroll：调用方优先，否则默认 x 为 max-content（antd）；拖拽开启时注入数值 x
                  const {
                    toolBarRender,
                    search,
                    toolbar: _omitToolbar,
                    pagination: _omitPagination,
                    scroll: userScroll,
                    rowSelection: _omitRowSelection,
                    components: userComponents,
                    virtual: userVirtual,
                    tableAlertRender: _omitTableAlertRender,
                    debounceTime: _omitDebounce,
                    onRow: userOnRow,
                    size: _omitTableSize,
                    options: _omitTableOptions,
                    onSizeChange: _omitOnSizeChange,
                    sticky: userSticky,
                    className: userTableClassName,
                    ...otherProps
                  } = restProps
                  const mergedProTableClassName = [
                    'uni-table-pro-table',
                    proTableBodyScrollYEnabled ? 'uni-table-scroll-y' : '',
                    userTableClassName,
                  ]
                    .filter(Boolean)
                    .join(' ')
                  const mergedComponents =
                    resizableColumns.length > 0
                      ? {
                          ...(userComponents || {}),
                          header: {
                            ...(userComponents?.header || {}),
                            cell: resizableComponents.header.cell,
                          },
                        }
                      : userComponents
                  /** 统一滚动策略：默认忽略页面旧式 scroll.x/scroll.y，仅保留白名单开关。 */
                  const ourScrollX = effectiveTableWidth
                  const normalizedUserScroll =
                    (!allowCustomScrollY || !allowCustomScrollX) && userScroll
                      ? ({
                          ...userScroll,
                          ...(allowCustomScrollX ? {} : { x: undefined }),
                          ...(allowCustomScrollY ? {} : { y: undefined }),
                        } as typeof userScroll)
                      : userScroll
                  let mergedScroll =
                    ourScrollX != null
                      ? { ...(normalizedUserScroll || {}), x: ourScrollX }
                      : allowCustomScrollX && normalizedUserScroll?.x !== undefined
                        ? normalizedUserScroll
                        : { ...(normalizedUserScroll || {}), x: 'max-content' as const }
                  const useVirtual = virtualized || userVirtual === true
                  if (!useVirtual && mergedScroll?.y === undefined && listPageScrollY) {
                    mergedScroll = {
                      ...(mergedScroll || {}),
                      y: listPageScrollY,
                    }
                  }
                  if (useVirtual) {
                    mergedScroll = {
                      ...(mergedScroll || {}),
                      y: mergedScroll?.y ?? virtualTableBodyMaxHeight,
                    }
                  }
                  if (!proTableBodyScrollYEnabled && mergedScroll?.y !== undefined) {
                    const { y: _omitScrollY, ...scrollWithoutY } = mergedScroll
                    mergedScroll = scrollWithoutY
                  }
                  /** 空表 + 固定列：必须注入数值 scroll.x（antd 固定列定位依赖列 width 与 scroll.x 一致） */
                  if (isEmptyTable && emptyTableHasFixedColumns) {
                    const minScrollX = computeUniTableMinScrollX(effectiveTableColumns, {
                      includeSelection: tableHasRowSelection,
                    })
                    if (minScrollX > 0) {
                      const keepY = proTableBodyScrollYEnabled ? mergedScroll?.y : undefined
                      mergedScroll =
                        keepY != null
                          ? ({ x: minScrollX, y: keepY } as typeof mergedScroll)
                          : ({ x: minScrollX } as typeof mergedScroll)
                    }
                  } else if (!proTableBodyScrollYEnabled && isEmptyTable) {
                    if (ourScrollX != null) {
                      mergedScroll = { x: ourScrollX } as typeof mergedScroll
                    } else {
                      mergedScroll = undefined
                    }
                  }

                  const mergedOnRow = rowClickSelectionEnabled
                    ? mergeOnRowWithRowClickSelection
                    : userOnRow

                  return {
                    ...otherProps,
                    className: mergedProTableClassName,
                    showSorterTooltip: (
                      otherProps as { showSorterTooltip?: boolean | Record<string, unknown> }
                    ).showSorterTooltip ?? {
                      target: 'sorter-icon',
                      placement: 'bottom',
                    },
                    ...(proTableBodyScrollYEnabled && userSticky !== undefined
                      ? { sticky: userSticky }
                      : {}),
                    ...(mergedOnRow ? { onRow: mergedOnRow } : {}),
                    ...(useVirtual
                      ? { virtual: true }
                      : userVirtual !== undefined
                        ? { virtual: userVirtual }
                        : {}),
                    components: mergedComponents,
                    ...(mergedScroll != null ? { scroll: mergedScroll } : {}),
                  }
                })()}
                size="small"
                options={memoizedOptions}
                optionsRender={
                  statCardsCtx?.enabled ? statCardsOptionsRender : (restProps as any).optionsRender
                }
                revalidateOnFocus={false}
              />
              {enableRowSelection && selectedRowKeys.length > 0 ? (
                <div
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: selectionAlertLayout?.top ?? 0,
                    zIndex: 2,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    height: selectionAlertLayout?.height ?? 32,
                    color: 'var(--ant-color-text-secondary)',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      height: selectionAlertLayout?.height ?? 32,
                      lineHeight: `${selectionAlertLayout?.height ?? 32}px`,
                    }}
                  >
                    {t('components.uniTable.selectedCountFooter', {
                      count: selectedRowKeys.length,
                    })}
                  </span>
                  <a
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      height: selectionAlertLayout?.height ?? 32,
                      lineHeight: `${selectionAlertLayout?.height ?? 32}px`,
                    }}
                    onClick={handleClearSelection}
                  >
                    {t('components.uniTable.clearSelectionFooter')}
                  </a>
                </div>
              ) : null}
            </div>
          </ConfigProvider>

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
        <Suspense fallback={null}>
          <LazyUniImport
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
        </Suspense>
      )}
    </>
  )
}

export default UniTable
