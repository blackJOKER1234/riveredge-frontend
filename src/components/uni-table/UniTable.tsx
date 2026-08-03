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
  ReactNode,
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
import { translatePathTitle } from '../../utils/menuTranslation'
import { ProTable, ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components'
import type { ColumnsState } from '@ant-design/pro-table'
import { Button, Space, theme, ConfigProvider, Grid, Tooltip } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  PrinterOutlined,
  TableOutlined,
  PieChartOutlined,
} from '@ant-design/icons'
import { isPinyinKeyword, matchPinyinInitialsAsync } from '../../utils/pinyin'
import UniSearch from '../uni-search'
import UniView from '../uni-view'
import { UniBatchDeleteButton } from '../uni-batch'
import { UniSyncButton } from '../uni-sync'
import { UniImportToolbarButton } from '../uni-import'
import { UniExportMenuButton } from '../uni-export'
import { useConfigStore } from '../../stores/configStore'
import { useListPageStatCardsContext } from '../layout-templates/listPageStatCardsContext'
import { useUserPreferenceStore } from '../../stores/userPreferenceStore'
import { useAntdResizableHeader } from 'use-antd-resizable-header'
import 'use-antd-resizable-header/dist/style.css'
import { formatDateBySiteSetting, formatDateTimeBySiteSetting } from '../../utils/format'
import { useNewShortcut } from '../../hooks/useNewShortcut'
import { usePagePermissionResource } from '../../hooks/usePagePermissionResource'
import { useResourcePermissions } from '../../hooks/useResourcePermissions'
import { withSingleNewShortcutHint } from '../../utils/globalNewShortcut'
import { DictionaryLabel } from '../dictionary-label'
import { stableJsonForQueryKey } from '../../utils/tableQueryKey'
import { isUniTableOperationColumn, renderUniTableOperationCell } from '../uni-action'
import { LIST_PAGE_TABLE_SCROLL, getViewportHeightExpr } from '../layout-templates/constants'
import {
  shouldEnableUniTableBodyScrollY,
  measureTableBodyOverflowsViewport,
} from './uniTableScrollPolicy'
import {
  getUniTableLifecycleCellClassName,
  isUniTableLifecycleColumn,
  resolveUniTableLifecycleColumnWidth,
  resolveUniTableOperationColumnWidth,
  UNI_TABLE_LIFECYCLE_MIN_WIDTH,
  UNI_TABLE_OPERATION_MIN_WIDTH,
  UNI_TABLE_SELECTION_COL_WIDTH,
  computeUniTableMinScrollX,
} from '../../utils/uniTableLayoutColumns'
import { DATA_ACTION_ICON_ONLY_MAX_WIDTH } from './constants'
import { useProTableSearch } from './useProTableSearch'
import { shouldIgnoreRowClickForSelection } from './rowClickSelection'
import {
  applyUniTableColumnWidthPolicy,
  buildDefaultColumnsStateMap,
  buildFixedRightColumnOrderOverlay,
  finalizeUniTableColumns,
  hasUniTableFixedColumns,
} from './columnPolicy'
import { withToolbarItemKeys, TableColumnResetButton } from './toolbarUtils'
import { generateImportConfigFromColumns } from './importConfig'
import { UNI_TABLE_STYLES } from './uniTableStyles'
import { UniTableViews, UniTableMobileCards } from './UniTableViews'
import type { UniTableProps } from './types'

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
  const { token } = theme.useToken()
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
  // 表格数据状态（用于其他视图）
  const [tableData, setTableData] = useState<T[]>([])
  /** 当前分页大小：用于判断当前页是否未装满（未装满则不注入 scroll.y） */
  const [currentPageSize, setCurrentPageSize] = useState<number>(defaultPageSize)
  // ⭐ 关键：使用 useProTableSearch Hook 管理搜索参数
  const {
    searchParamsRef: hookSearchParamsRef,
    formRef: hookFormRef,
    actionRef: hookActionRef,
  } = useProTableSearch()
  const searchParamsRef = (externalSearchParamsRef ||
    hookSearchParamsRef) as React.MutableRefObject<Record<string, any> | undefined>
  // 模糊搜索关键词状态
  const [fuzzySearchKeyword, setFuzzySearchKeyword] = useState<string>('')
  /** 递增以使 QuerySearchButton 重算钉住条件激活态（searchParamsRef 变更不触发渲染） */
  const [pinnedSearchUiEpoch, setPinnedSearchUiEpoch] = useState(0)
  // 防抖定时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const internalActionRef = useRef<ActionType>()
  const internalFormRef = useRef<ProFormInstance>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dataActionIconOnly, setDataActionIconOnly] = useState(false)
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

  /** 父组件常写内联 request，避免其引用每帧变化触发 ProTable 重复拉数 */
  const requestRef = useRef(request)
  requestRef.current = request
  const staticDataSourceRef = useRef<T[] | undefined>(
    Array.isArray(restProps.dataSource) ? (restProps.dataSource as T[]) : undefined
  )
  staticDataSourceRef.current = Array.isArray(restProps.dataSource)
    ? (restProps.dataSource as T[])
    : undefined
  const onTableDataChangeRef = useRef(onTableDataChange)
  onTableDataChangeRef.current = onTableDataChange

  /**
   * 自动启用 TanStack Query（实时列表）：
   * - 全量列表页已带稳定 `columnPersistenceId`，可直接作为 query 命名空间。
   * - 默认 staleTime=0，禁止 staleWhileRevalidate 展示过期行。
   * - 显式传入 `tanstackQuery` 时与默认值合并（`queryKeyPrefix` 缺省时取 `columnPersistenceId`）。
   * - 显式传入 `tanstackQuery={{ enabled: false }}` 可彻底关闭。
   */
  const resolvedTanstackQuery = useMemo(() => {
    if (tanstackQuery && (tanstackQuery as any).enabled === false) return undefined
    const fallbackPrefix = columnPersistenceId
      ? ([columnPersistenceId] as readonly unknown[])
      : undefined
    const queryKeyPrefix = tanstackQuery?.queryKeyPrefix ?? fallbackPrefix
    if (!queryKeyPrefix || queryKeyPrefix.length === 0) return undefined
    return {
      queryKeyPrefix,
      staleTime: tanstackQuery?.staleTime ?? 0,
      gcTime: tanstackQuery?.gcTime ?? 300_000,
      prefetchNextPage: tanstackQuery?.prefetchNextPage ?? true,
      staleWhileRevalidate: tanstackQuery?.staleWhileRevalidate ?? false,
    }
  }, [tanstackQuery, columnPersistenceId])

  const tanstackQueryRef = useRef(resolvedTanstackQuery)
  tanstackQueryRef.current = resolvedTanstackQuery

  const dropUniTableTanstackCache = useCallback(() => {
    const liveTq = tanstackQueryRef.current
    if (liveTq?.queryKeyPrefix && liveTq.queryKeyPrefix.length > 0) {
      const queryKey = ['uniTable', ...liveTq.queryKeyPrefix] as const
      void queryClient.cancelQueries({ queryKey, exact: false })
      queryClient.removeQueries({ queryKey, exact: false })
    }
  }, [queryClient])

  /** mutation / 工具栏 refresh 后的下一次 request 必须绕过 TanStack fresh 短路 */
  const forceFreshNextRequestRef = useRef(false)
  /** 丢弃过期 in-flight 响应时，避免 ProTable 被旧 request 返回值覆盖 */
  const lastCommittedRequestResultRef = useRef<{
    data?: T[]
    success?: boolean
    total?: number
  } | null>(null)

  const reloadWithTanstackCacheBust = useCallback(
    (...args: any[]) => {
      forceFreshNextRequestRef.current = true
      dropUniTableTanstackCache()
      return (nativeTableActionRef.current?.reload as any)?.(...args)
    },
    [dropUniTableTanstackCache]
  )

  const reloadAndRestWithTanstackCacheBust = useCallback(
    (...args: any[]) => {
      forceFreshNextRequestRef.current = true
      dropUniTableTanstackCache()
      return (nativeTableActionRef.current?.reloadAndRest as any)?.(...args)
    },
    [dropUniTableTanstackCache]
  )

  /**
   * 请求序号：用户翻页/改筛选时，旧请求若仍在飞行（含 SWR 后台 revalidate），
   * 其结果不应再 setState 或触发 reload。仅最新一次请求允许写状态。
   */
  const requestSeqRef = useRef(0)

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

  // 延迟 loading：仅在 loadingDelay 毫秒后才显示，避免快速请求时的闪烁
  const [showDelayedLoading, setShowDelayedLoading] = useState(false)
  const [selectionAlertLayout, setSelectionAlertLayout] = useState<{
    top: number
    height: number
  } | null>(null)
  const loadingDelayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLoadingRef = useRef(false)
  const columnsSyncDebounceRef = useRef<NodeJS.Timeout | null>(null)
  /** 避免每个列表页挂载都抢跑 pinyin-pro；聚焦模糊搜索框时再预加载 */
  const pinyinWarmupRef = useRef(false)

  const warmupPinyinIfNeeded = useCallback(() => {
    if (pinyinWarmupRef.current) return
    pinyinWarmupRef.current = true
    import('../../utils/pinyin').then(({ preloadPinyinLib }) => {
      preloadPinyinLib().catch((err: any) => {
        console.warn('预加载拼音库失败:', err)
      })
    })
  }, [])

  // 拼音首字母过滤时遍历的列：排除 hideInSearch，减少大表列定义下的 CPU 开销
  const columnsForPinyinSearch = useMemo(() => {
    return columns.filter((col: ProColumns<T>) => {
      if (!col.dataIndex) return false
      if (col.hideInSearch === true) return false
      return true
    })
  }, [columns])

  /**
   * 把所有「会变」的运行期值都收敛到一个 ref，让 `handleRequest` 的 useCallback
   * 依赖永远稳定（仅 [queryClient]），避免父级重渲染时回调身份抖动导致 ProTable
   * 内部失效检查、上层 actionRef 闭包错乱。
   */
  const requestRuntimeRef = useRef({
    showLoading,
    loadingDelay,
    defaultPageSize,
    columnsForPinyinSearch,
    resolvedTanstackQuery,
    skipFuzzyPinyinClientFilter,
  })
  requestRuntimeRef.current = {
    showLoading,
    loadingDelay,
    defaultPageSize,
    columnsForPinyinSearch,
    resolvedTanstackQuery,
    skipFuzzyPinyinClientFilter,
  }

  // 预加载 UniImport（UniverSheet ~2MB）：直接在挂载时触发 import，让浏览器与页面其它资源并行下载。
  // 不再用 requestIdleCallback 做"空闲时"调度，那属于不确定时序的妥协。
  useEffect(() => {
    if (!gatedShowImportButton || !onImport) return
    import('../uni-import').catch(() => {})
  }, [gatedShowImportButton, onImport])

  // 站点日期格式（用于表格日期列展示，变更时触发列重新计算）
  const dateFormatKey = getConfig('date_format', 'YYYY-MM-DD')

  // 明细表格视图使用 detailTableColumns，否则使用 columns
  const effectiveColumns = React.useMemo(() => {
    if (currentViewType === 'detailTable' && detailTableColumns && detailTableColumns.length > 0) {
      return detailTableColumns
    }
    return columns
  }, [currentViewType, columns, detailTableColumns])

  // 检测是否为操作列（用于操作列样式与宽度处理；与 normalizeFixedRightColumnOrder 共用判定）
  const isOperationColumn = (col: any) => isUniTableOperationColumn(col)
  // 为 date/dateTime 列注入站点格式的展示，使站点设置中的日期格式在单据表格中生效
  const processedColumns = React.useMemo(() => {
    const mapped = effectiveColumns.map((col: any) => {
      // 自动处理日期和时间列的展示
      if (
        (col.valueType === 'date' || col.valueType === 'dateTime') &&
        !col.render &&
        !col.valueFormatter
      ) {
        const dataIndex = col.dataIndex
        return {
          ...col,
          render: (_: any, record: T) => {
            const val =
              dataIndex != null
                ? Array.isArray(dataIndex)
                  ? dataIndex.reduce((acc: any, key: string) => acc?.[key], record)
                  : record[dataIndex]
                : null
            return col.valueType === 'dateTime'
              ? formatDateTimeBySiteSetting(val, '-')
              : formatDateBySiteSetting(val, '-')
          },
        }
      }

      // 自动处理“单位”列的展示（全局优化：始终显示数据字典标签值）
      const unitFields = ['material_unit', 'unit', 'baseUnit', 'base_unit']
      if (typeof col.dataIndex === 'string' && unitFields.includes(col.dataIndex) && !col.render) {
        return {
          ...col,
          render: (val: any) => <DictionaryLabel dictionaryCode="unit" value={val} />,
        }
      }
      /** 生命周期列统一策略：固定收缩锚点 + 最小宽度，屏蔽历史固定宽度带来的留白。 */
      if (isUniTableLifecycleColumn(col)) {
        const { width: _w, minWidth: _mw, ...lifecycleRest } = col
        const userOnCell = lifecycleRest.onCell
        const lifecycleCellClass = getUniTableLifecycleCellClassName(lifecycleRest)
        return {
          ...lifecycleRest,
          width: resolveUniTableLifecycleColumnWidth(lifecycleRest),
          minWidth: UNI_TABLE_LIFECYCLE_MIN_WIDTH,
          resizable: false,
          onCell: (record: any, rowIndex?: number) => {
            const base = typeof userOnCell === 'function' ? userOnCell(record, rowIndex) || {} : {}
            return {
              ...base,
              className: `${lifecycleCellClass} ${base.className || ''}`.trim(),
            }
          },
        }
      }
      if (isOperationColumn(col)) {
        const {
          uniActionRenderOptions,
          render: baseRender,
          width: pageWidth,
          minWidth: _minWidth,
          ...rest
        } = col
        const resolvedWidth = resolveUniTableOperationColumnWidth({
          width: pageWidth,
          minWidth: UNI_TABLE_OPERATION_MIN_WIDTH,
          fixed: rest.fixed,
        })
        return {
          ...rest,
          width: resolvedWidth,
          minWidth: UNI_TABLE_OPERATION_MIN_WIDTH,
          resizable: false,
          render: baseRender
            ? (...args: any[]) => {
                const rendered = baseRender(...args)
                const record = args[1] as Record<string, any> | undefined
                const rowKey = String(record?.id ?? record?.uuid ?? args[2] ?? 'row')
                return renderUniTableOperationCell(rendered, `uni-op-${rowKey}`, {
                  permissionGates,
                  ...(uniActionRenderOptions && typeof uniActionRenderOptions === 'object'
                    ? uniActionRenderOptions
                    : {}),
                })
              }
            : undefined,
        }
      }
      return col
    })
    // 列宽策略保持稳定，不随空表/有数据态切换，避免固定列在首次加载与刷新时抖动
    return applyUniTableColumnWidthPolicy(mapped, false)
  }, [effectiveColumns, dateFormatKey, permissionGates])

  // 全项目统一策略：结构化列保留页面 width；主文本列由 applyUniTableColumnWidthPolicy 释放 width；
  // 不启用拖拽改宽与本地列宽持久化，避免「代码 width」与 localStorage 双控制源竞争。
  const columnsForResize = React.useMemo(() => [], [])

  // 列宽拖拽 hook（仅表格视图时生效，与 ProTable 列设置共存）
  const tableId = columnPersistenceId ?? headerTitle
  const {
    components: resizableComponents,
    resizableColumns,
    tableWidth,
    resetColumns,
    refresh,
  } = useAntdResizableHeader({
    columns: columnsForResize,
    columnsState: undefined,
  })

  const handleColumnReset = React.useCallback(() => {
    if (tableId) {
      try {
        localStorage.removeItem(`ui.tables.${tableId}.columnsWidth`)
      } catch (_) {}
      resetColumns(true)
      refresh()
      syncTablePreference(tableId, { columns: {}, columnsWidth: {} }).catch(() => {})
    }
  }, [tableId, resetColumns, refresh, syncTablePreference])

  // 操作列：不换行；列宽与 scroll 交由 antd（见下方 mergedScroll）
  const effectiveTableColumns = React.useMemo(() => {
    const baseCols =
      resizableColumns.length > 0
        ? resizableColumns
        : processedColumns.filter((c: any) => !isOperationColumn(c) && !c.hideInTable)
    const opCols = processedColumns.filter((c: any) => isOperationColumn(c))
    if (opCols.length === 0 && !processedColumns.some(c => c.hideInTable)) {
      return finalizeUniTableColumns(baseCols)
    }

    // 将操作列按原顺序插回（通常为最后一列）
    const opIndices = processedColumns
      .map((c: any, i: number) => (isOperationColumn(c) ? i : -1))
      .filter((i: number) => i >= 0)
    const result: any[] = []
    let baseIdx = 0
    let opIdx = 0
    for (let i = 0; i < processedColumns.length; i++) {
      const col = processedColumns[i]
      if (opIndices.includes(i)) {
        const opCol = opCols[opIdx++]
        const baseOnCell = opCol.onCell
        const mergedOnCell =
          baseOnCell && typeof baseOnCell === 'function'
            ? (record: any, rowIndex?: number) => {
                const base = baseOnCell(record, rowIndex) || {}
                return {
                  ...base,
                  className: `uni-table-operation-cell ${base?.className || ''}`.trim(),
                  style: {
                    whiteSpace: 'nowrap',
                    ...(base?.style || {}),
                  },
                }
              }
            : () => ({
                className: 'uni-table-operation-cell',
                style: { whiteSpace: 'nowrap' },
              })
        result.push({
          ...opCol,
          resizable: false,
          ellipsis: false,
          onCell: mergedOnCell,
        })
      } else if (col.hideInTable) {
        // 搜索专用列不参与 resize 也不参与 baseCols 映射，直接透传原定义以保持 ProTable 搜索表单功能
        result.push(col)
      } else {
        result.push(baseCols[baseIdx++] ?? col)
      }
    }
    return finalizeUniTableColumns(result)
  }, [resizableColumns, processedColumns])

  // 导入配置：优先使用传入的 importHeaders/importExampleRow，否则从 columns 自动生成
  const effectiveImportConfig = React.useMemo(() => {
    if (importHeaders && importHeaders.length > 0) {
      return {
        headers: importHeaders,
        exampleRow: importExampleRow,
        fieldMap: importFieldMap ?? {},
      }
    }
    if (autoGenerateImportConfig && processedColumns) {
      const generated = generateImportConfigFromColumns(processedColumns, { t })
      return {
        headers: generated.headers,
        exampleRow: generated.exampleRow,
        fieldMap: { ...generated.fieldMap, ...(importFieldMap ?? {}) },
      }
    }
    return { headers: undefined, exampleRow: undefined, fieldMap: importFieldMap }
  }, [
    importHeaders,
    importExampleRow,
    importFieldMap,
    autoGenerateImportConfig,
    processedColumns,
    t,
  ])

  const importTemplateDocumentName = useMemo(() => {
    if (importTemplateName?.trim()) return importTemplateName.trim()
    if (typeof headerTitle === 'string' && headerTitle.trim()) return headerTitle.trim()
    return translatePathTitle(location.pathname, t)?.trim() || undefined
  }, [importTemplateName, headerTitle, location.pathname, t])

  /** 仅列拖拽开启时使用 hook 算出的 tableWidth；否则不注入数值 scroll.x，交给 antd 默认策略 */
  const effectiveTableWidth: number | string | undefined =
    resizableColumns.length > 0 && tableWidth != null ? tableWidth : undefined

  /** 合并列状态：为右侧固定列写入默认 order，保证生命周期在操作列左侧（与 normalizeFixedRightColumnOrder 一致） */
  const mergedColumnsStateProp = React.useMemo(() => {
    const columnDefaults = buildDefaultColumnsStateMap(effectiveTableColumns)
    const user = userColumnsState || {}
    return {
      ...user,
      persistenceType: 'localStorage' as const,
      persistenceKey: user.persistenceKey ?? (tableId ? `ui.tables.${tableId}.columns` : undefined),
      defaultValue: {
        ...columnDefaults,
        ...(user.defaultValue || {}),
      },
      onChange: (map: Record<string, any> | undefined) => {
        if (map) user.onChange?.(map as Record<string, ColumnsState>)
        if (!tableId || !map) return
        const columnsSnapshot = map
        if (columnsSyncDebounceRef.current) clearTimeout(columnsSyncDebounceRef.current)
        columnsSyncDebounceRef.current = setTimeout(() => {
          columnsSyncDebounceRef.current = null
          syncTablePreference(tableId, { columns: columnsSnapshot }).catch(() => {})
        }, 800)
      },
    }
  }, [tableId, effectiveTableColumns, userColumnsState, syncTablePreference])

  /** 与 mergedColumnsStateProp.persistenceKey 一致，用于纠偏 localStorage 中的列 order */
  const columnsPersistenceFullKey =
    (userColumnsState as any)?.persistenceKey ??
    (tableId != null && tableId !== '' ? `ui.tables.${tableId}.columns` : undefined)

  /** 列结构签名：内容不变时避免因 columns 引用抖动重复打补丁 */
  const columnStructureSig = React.useMemo(
    () =>
      JSON.stringify(
        (effectiveTableColumns || []).map((c: any, i: number) => [
          i,
          c?.fixed ?? null,
          c?.dataIndex ?? null,
          c?.key ?? null,
          c?.valueType ?? null,
        ])
      ),
    [effectiveTableColumns]
  )

  /**
   * ProTable 对列设置的合并为 merge(defaultValue, localStorage)，用户历史持久化会盖住默认 order，
   * 仅靠 normalize 列顺序无法纠正展示。此处按规范重写右侧固定列的 order。
   *
   * 关键时序优化：
   * - 首次挂载时，在 render 阶段同步写入 localStorage，使 ProTable 首次渲染读到的就是
   *   已纠偏的值，无需再触发 epoch 重挂载（消除首屏白屏/回弹感）。
   * - 之后若 key/结构签名改变，再走 effect 路径 + epoch++，与原有行为一致。
   */
  const applyColumnsOrderOverlay = React.useCallback((): boolean => {
    if (
      typeof window === 'undefined' ||
      !columnsPersistenceFullKey ||
      !effectiveTableColumns?.length
    )
      return false
    try {
      const raw = window.localStorage.getItem(columnsPersistenceFullKey)
      if (!raw) return false
      const m = JSON.parse(raw) as Record<string, any>
      const overlay = buildFixedRightColumnOrderOverlay(effectiveTableColumns)
      const keys = Object.keys(overlay)
      if (keys.length === 0) return false
      const next = { ...m }
      let changed = false
      for (const k of keys) {
        const want = overlay[k]?.order
        if (want == null) continue
        const cur = next[k]?.order
        if (cur !== want) {
          next[k] = { ...(next[k] || {}), order: want }
          changed = true
        }
      }
      if (changed) {
        window.localStorage.setItem(columnsPersistenceFullKey, JSON.stringify(next))
      }
      return changed
    } catch {
      return false
    }
  }, [columnsPersistenceFullKey, effectiveTableColumns])

  const columnsStatePatchSigRef = React.useRef<string | null>(null)
  const [columnsStatePatchEpoch, setColumnsStatePatchEpoch] = React.useState(0)
  const currentPatchSig = `${columnsPersistenceFullKey ?? ''}::${columnStructureSig}`
  // 仅在首次挂载时同步纠偏（render 阶段）；后续 sig 变化由下方 effect 负责
  if (
    columnsStatePatchSigRef.current === null &&
    columnsPersistenceFullKey &&
    effectiveTableColumns?.length
  ) {
    columnsStatePatchSigRef.current = currentPatchSig
    applyColumnsOrderOverlay()
  }

  React.useLayoutEffect(() => {
    // 首次挂载已在 render 阶段完成纠偏，跳过
    if (columnsStatePatchSigRef.current === currentPatchSig) return
    columnsStatePatchSigRef.current = currentPatchSig
    if (applyColumnsOrderOverlay()) {
      setColumnsStatePatchEpoch(e => e + 1)
    }
  }, [currentPatchSig, applyColumnsOrderOverlay])

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

  /**
   * 处理模糊搜索（带防抖）
   *
   * 根据最佳实践：
   * 1. 使用防抖（300ms）来优化性能，避免频繁请求
   * 2. 搜索关键词存储到 searchParamsRef 中，作为 keyword 参数传递给后端
   * 3. 支持清除搜索，清除时重新加载数据
   */
  const handleFuzzySearch = (value: string) => {
    setFuzzySearchKeyword(value)

    // 清除之前的防抖定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // 设置防抖定时器（300ms）
    debounceTimerRef.current = setTimeout(() => {
      // 更新搜索参数
      if (searchParamsRef.current) {
        searchParamsRef.current.keyword = value.trim() || undefined
      } else {
        searchParamsRef.current = {
          keyword: value.trim() || undefined,
        }
      }
      setPinnedSearchUiEpoch(e => e + 1)

      // 触发表格重新加载
      if (actionRefForProTable?.current) {
        actionRefForProTable.current.reload()
      }
    }, 300)
  }

  /** 重置模糊关键词与表单筛选条件并刷新列表（与搜索条「重置」一致） */
  const handleSearchReset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    setFuzzySearchKeyword('')
    // 清空高级搜索 / 钉住条件写入的 searchParamsRef，否则仅删 keyword 时阶段筛选仍会生效
    searchParamsRef.current = undefined
    setPinnedSearchUiEpoch(e => e + 1)
    try {
      formRef.current?.resetFields?.()
    } catch {
      /* ignore */
    }
    actionRefForProTable.current?.reload?.()
  }, [])

  /**
   * 组件卸载时清除防抖定时器和 loading 延迟定时器
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (loadingDelayTimerRef.current) {
        clearTimeout(loadingDelayTimerRef.current)
      }
      if (columnsSyncDebounceRef.current) {
        clearTimeout(columnsSyncDebounceRef.current)
      }
    }
  }, [])

  /**
   * 同步 ProTable 原生 action 到页面 ref，并对 reload / reloadAndRest 包一层 TanStack 强刷新。
   */
  React.useLayoutEffect(() => {
    const inner = nativeTableActionRef.current
    if (!inner) {
      outwardActionRef.current = undefined as any
      return
    }
    outwardActionRef.current = {
      ...inner,
      reload: (...args: any[]) => reloadWithTanstackCacheBust(...args),
      reloadAndRest: (...args: any[]) => reloadAndRestWithTanstackCacheBust(...args),
      clearSelected: () => clearAllRowSelection(),
    }
  }, [
    outwardActionRef,
    reloadWithTanstackCacheBust,
    reloadAndRestWithTanstackCacheBust,
    clearAllRowSelection,
  ])

  /**
   * 表格数据请求（核心性能路径）
   *
   * 设计原则（与 TanStack Query 原生模型对齐）：
   * 1. 缓存命中（fresh）→ 同步从 `queryClient.getQueryData` 取值；不发起网络请求。
   * 2. 缓存命中（stale）+ `staleWhileRevalidate` → 立刻返回旧数据；后台用 `fetchQuery`
   *    revalidate；TanStack 默认开启 `structuralSharing`，结果与旧数据「内容相同」时
   *    返回同一引用，因此用 `===` 判断是否需要 `reload`，避免无变更时多余渲染。
   * 3. 缓存未命中 / 已禁用 SWR → `fetchQuery` 发起请求；`fetchQuery` 内部按 queryKey
   *    去重并发，相同 key 的并发请求只会触发一次网络往返。
   * 4. `prefetchNextPage`：成功拿到当前页后，在后台用与「下一页正常请求一致」的 key
   *    预取下一页（拼音前端过滤场景跳过，避免缓存与展示不一致）。
   * 5. 竞态：`requestSeqRef` 单调自增，仅最新一次请求允许写状态 / 触发 reload。
   * 6. `useCallback` 依赖仅 `[queryClient]`，永远稳定 —— 所有「会变」的运行期值都从
   *    `requestRuntimeRef.current` 读取，避免父组件重渲染时回调身份抖动。
   */
  const handleRequest = useCallback(
    async (
      params: any,
      sort: Record<string, 'ascend' | 'descend' | null>,
      filter: Record<string, React.ReactText[] | null>
    ) => {
      const seq = ++requestSeqRef.current
      const {
        showLoading: liveShowLoading,
        loadingDelay: liveLoadingDelay,
        defaultPageSize: liveDefaultPageSize,
        columnsForPinyinSearch: livePinyinCols,
        resolvedTanstackQuery: tq,
        skipFuzzyPinyinClientFilter: liveSkipFuzzyPinyinClientFilter,
      } = requestRuntimeRef.current

      if (liveShowLoading && liveLoadingDelay > 0) {
        isLoadingRef.current = true
        if (loadingDelayTimerRef.current) {
          clearTimeout(loadingDelayTimerRef.current)
        }
        loadingDelayTimerRef.current = setTimeout(() => {
          loadingDelayTimerRef.current = null
          if (isLoadingRef.current) {
            setShowDelayedLoading(true)
          }
        }, liveLoadingDelay)
      }

      /**
       * 取搜索表单值：`searchParamsRef.current` 可能是空对象（表示主动清空筛选），
       * 仅在 `undefined` 时回退到 ProForm `getFieldsValue`，避免覆盖「清空」语义。
       */
      const formValues = formRef.current?.getFieldsValue() || {}
      const searchFormValues =
        searchParamsRef.current !== undefined ? searchParamsRef.current : formValues

      const keywordForPrefetch = searchFormValues?.keyword
      const skipPrefetchForPinyin = !!(
        keywordForPrefetch &&
        isPinyinKeyword(keywordForPrefetch) &&
        !liveSkipFuzzyPinyinClientFilter
      )

      try {
        const reqPageSize = params.pageSize ?? liveDefaultPageSize
        setCurrentPageSize(prev => (prev === reqPageSize ? prev : reqPageSize))

        const runRequest = () => {
          if (typeof requestRef.current === 'function') {
            return requestRef.current(params, sort, filter, searchFormValues)
          }
          const rows = staticDataSourceRef.current ?? []
          const current = Number(params?.current ?? 1)
          const fallbackPageSize = rows.length > 0 ? rows.length : liveDefaultPageSize
          const pageSize = Number(params?.pageSize ?? fallbackPageSize)
          const start = Math.max(0, (current - 1) * pageSize)
          return Promise.resolve({
            data: rows.slice(start, start + pageSize),
            success: true,
            total: rows.length,
          })
        }
        let result: Awaited<ReturnType<typeof runRequest>>
        const forceFresh = forceFreshNextRequestRef.current
        if (forceFresh) {
          forceFreshNextRequestRef.current = false
        }

        if (tq?.queryKeyPrefix && tq.queryKeyPrefix.length > 0) {
          const pageSize = reqPageSize
          const current = params.current ?? 1
          const staleTimeMs = tq.staleTime ?? 0
          const gcTimeMs = tq.gcTime ?? 300_000
          const paramsKey = stableJsonForQueryKey(params)
          const sortKey = stableJsonForQueryKey(sort)
          const filterKey = stableJsonForQueryKey(filter)
          const searchKey = stableJsonForQueryKey(searchFormValues ?? {})
          const fullQueryKey = [
            'uniTable',
            ...tq.queryKeyPrefix,
            paramsKey,
            sortKey,
            filterKey,
            searchKey,
          ] as const

          const fetchOpts = {
            queryKey: [...fullQueryKey],
            queryFn: runRequest,
            staleTime: staleTimeMs,
            gcTime: gcTimeMs,
          } as const

          if (forceFresh) {
            result = await queryClient.fetchQuery({
              ...fetchOpts,
              staleTime: 0,
            })
          } else if (tq.staleWhileRevalidate) {
            const cached = queryClient.getQueryData(fullQueryKey) as
              | Awaited<ReturnType<typeof runRequest>>
              | undefined
            const state = queryClient.getQueryState(fullQueryKey)
            const updatedAt = state?.dataUpdatedAt ?? 0
            const cacheStale =
              !cached || state?.isInvalidated === true || Date.now() - updatedAt > staleTimeMs
            if (cached != null && cacheStale) {
              void queryClient
                .fetchQuery({ ...fetchOpts, staleTime: 0 })
                .then(fresh => {
                  if (requestSeqRef.current !== seq) return
                  if (fresh === cached) return
                  lastCommittedRequestResultRef.current = fresh
                  if (fresh.data) {
                    setTableData(fresh.data)
                    onTableDataChangeRef.current?.(fresh.data as T[])
                  }
                  nativeTableActionRef.current?.reload?.()
                })
                .catch(() => {
                  /* 失败由全局错误处理；旧数据继续展示 */
                })
              result = cached
            } else {
              result = await queryClient.fetchQuery(fetchOpts)
            }
          } else {
            result = await queryClient.fetchQuery(fetchOpts)
          }

          if (
            tq.prefetchNextPage &&
            !skipPrefetchForPinyin &&
            result &&
            typeof result.total === 'number' &&
            Number.isFinite(result.total) &&
            current * pageSize < result.total
          ) {
            const nextCurrent = current + 1
            const nextParams = { ...params, current: nextCurrent, pageSize }
            const nextKey = [
              'uniTable',
              ...tq.queryKeyPrefix,
              stableJsonForQueryKey(nextParams),
              sortKey,
              filterKey,
              searchKey,
            ] as const
            // prefetchQuery 会按 queryKey 去重；若已在飞行或缓存仍 fresh，则直接返回。
            void queryClient.prefetchQuery({
              queryKey: [...nextKey],
              queryFn: () => requestRef.current(nextParams, sort, filter, searchFormValues),
              staleTime: staleTimeMs,
              gcTime: gcTimeMs,
            })
          }
        } else {
          result = await runRequest()
        }

        // 拼音搜索：关键词为拼音首字母时在前端对返回数据二次过滤
        const keyword = searchFormValues?.keyword
        if (
          !liveSkipFuzzyPinyinClientFilter &&
          keyword &&
          isPinyinKeyword(keyword) &&
          result.data &&
          Array.isArray(result.data)
        ) {
          // 避免改写 TanStack 缓存中的对象引用
          const keywordLower = keyword.toLowerCase()
          const keywordUpper = keyword.toUpperCase()

          const filteredDataPromises = result.data.map(async (record: any) => {
            for (const column of livePinyinCols) {
              if (!column.dataIndex) continue
              const getFieldValue = (obj: any, path: string | string[] | number): any => {
                if (Array.isArray(path)) {
                  return path.reduce((acc, key) => acc?.[key], obj)
                }
                if (typeof path === 'number') return obj?.[path]
                const keys = String(path).split('.')
                return keys.reduce((acc, key) => acc?.[key], obj)
              }
              const fieldValue = getFieldValue(
                record,
                column.dataIndex as string | string[] | number
              )
              if (!fieldValue) continue
              const valueStr = String(fieldValue)
              if (valueStr.toLowerCase().includes(keywordLower)) return record
              const pinyinMatch = await matchPinyinInitialsAsync(valueStr, keywordUpper)
              if (pinyinMatch) return record
            }
            return null
          })

          const filteredResults = await Promise.all(filteredDataPromises)
          const filteredData = filteredResults.filter(item => item !== null)
          result = {
            ...result,
            data: filteredData,
            ...(result.total !== undefined ? { total: filteredData.length } : {}),
          }
        }

        // 竞态：旧请求结果到达时不写 state（仅最新 seq 落库），但仍把「本次实时算出的 result」返回给
        // ProTable —— result 始终基于最新 requestRef 计算，故即便 ProTable 末位应用的是过期请求的返回值，
        // 表格内容也仍是当前真值；切勿回退成空响应（会把已加载列表覆盖为「暂无数据」）。
        if (requestSeqRef.current !== seq) {
          return result
        }

        // 仅在数据引用变化时 setState（forceFresh 或 TanStack 结构共享豁免）
        if (result.data) {
          setTableData(prev => {
            if (forceFresh) return result.data
            return prev === result.data ? prev : result.data
          })
          onTableDataChangeRef.current?.(result.data as T[])
        }

        lastCommittedRequestResultRef.current = result

        return result
      } finally {
        if (liveShowLoading && liveLoadingDelay > 0 && requestSeqRef.current === seq) {
          isLoadingRef.current = false
          if (loadingDelayTimerRef.current) {
            clearTimeout(loadingDelayTimerRef.current)
            loadingDelayTimerRef.current = null
          }
          setShowDelayedLoading(false)
        }
      }
    },
    [queryClient]
  )

  const mergedToolbarOptions = (restProps.options ||
    (restProps.toolbar as any)?.options ||
    {}) as any

  /**
   * 处理视图类型切换
   */
  const handleViewTypeChange = (viewType: string) => {
    setCurrentViewType(viewType)
    if (onViewTypeChange) {
      onViewTypeChange(viewType)
    }
  }

  /** 3.1 左侧功能按钮区：`headerTitle` 内容（含 uni-batch、下推类按钮约定落此区）。 */
  const buildLeftActions = () => {
    const actions: ReactNode[] = []

    // 如果提供了自定义 headerActions，直接使用
    if (headerActions) {
      return headerActions
    }

    if (toolBarActionsBeforeCreate.length > 0) {
      actions.push(...withToolbarItemKeys(toolBarActionsBeforeCreate, 'uni-tb-before'))
    }

    // 新建按钮，带 Alt+N 快捷键提示
    if (gatedShowCreateButton && onCreate) {
      actions.push(
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreate}
          size={toolBarButtonSize}
        >
          {withSingleNewShortcutHint(createButtonText ?? t('components.uniTable.create'))}
        </Button>
      )
    }

    if (toolBarActionsAfterCreate.length > 0) {
      actions.push(...withToolbarItemKeys(toolBarActionsAfterCreate, 'uni-tb-after-create'))
    }

    // ProTable `toolBarRender`：在 UniTable 中仅用于向左侧注入节点（非右侧工具栏）
    if (restProps.toolBarRender) {
      const mockAction = {
        reload: reloadWithTanstackCacheBust,
        reloadAndRest: reloadAndRestWithTanstackCacheBust,
      } as any
      const mockSelectedRowKeys = selectedRowKeys as any
      const userResult = restProps.toolBarRender(mockAction, {
        selectedRowKeys: mockSelectedRowKeys,
      })

      if (Array.isArray(userResult)) {
        actions.push(...withToolbarItemKeys(userResult, 'uni-tb-render'))
      } else if (userResult) {
        actions.push(...withToolbarItemKeys([userResult], 'uni-tb-render'))
      }
    }

    // 合并 toolBarActions（兼容历史用法，与 toolBarRender 等效）
    if (toolBarActions.length > 0) {
      actions.push(...withToolbarItemKeys(toolBarActions, 'uni-tb-actions'))
    }

    // 批量删除（uni-batch 删除预设）
    if (gatedShowDeleteButton && onDelete) {
      actions.push(
        <UniBatchDeleteButton
          key="delete"
          selectedRowKeys={selectedRowKeys}
          onConfirm={handleBatchDeleteConfirm}
          toolBarButtonSize={toolBarButtonSize}
          buttonText={deleteButtonText}
          confirmTitle={deleteConfirmTitle}
          confirmDescription={deleteConfirmDescription}
          disabled={deleteButtonDisabled}
        />
      )
    }

    if (toolBarActionsAfterDelete.length > 0) {
      actions.push(...withToolbarItemKeys(toolBarActionsAfterDelete, 'uni-tb-after-delete'))
    }

    if (toolBarActionsAfterBatch.length > 0) {
      actions.push(...withToolbarItemKeys(toolBarActionsAfterBatch, 'uni-tb-after-batch'))
    }

    // 修改按钮（需要选中一行）
    if (gatedShowEditButton && onEdit) {
      actions.push(
        <Button
          key="edit"
          icon={<EditOutlined />}
          size={toolBarButtonSize}
          onClick={() => {
            if (selectedRowKeys.length === 1) {
              onEdit(selectedRowKeys)
            }
          }}
          disabled={selectedRowKeys.length !== 1}
        >
          {t('components.uniTable.edit')}
        </Button>
      )
    }

    if (onDetail && permissionGates.canRead) {
      actions.push(
        <Button
          key="detail"
          icon={<EyeOutlined />}
          size={toolBarButtonSize}
          onClick={() => {
            if (selectedRowKeys.length === 1) {
              void onDetail(selectedRowKeys)
            }
          }}
          disabled={selectedRowKeys.length !== 1}
        >
          {detailButtonText ?? t('components.uniTable.detail')}
        </Button>
      )
    }

    return actions.length > 0 ? <Space>{actions}</Space> : undefined
  }

  /** 3.2 右侧：uni-import / uni-export / uni-sync / 数据集（可选）/ 打印（表格设定见 `memoizedOptions`） */
  const buildRightActions = (iconOnly = false) => {
    const rightButtons: ReactNode[] = []

    const beforeExportActions = withToolbarItemKeys(
      rightToolBarActionsBeforeExport,
      'right-before-export'
    )
    if (beforeExportActions.length > 0) {
      rightButtons.push(...beforeExportActions)
    }

    if (gatedShowImportButton && onImport) {
      rightButtons.push(
        <UniImportToolbarButton
          key="import"
          size={toolBarButtonSize}
          iconOnly={iconOnly}
          onOpen={() => setImportModalVisible(true)}
        />
      )
    }

    if (gatedShowExportButton && onExport) {
      rightButtons.push(
        <UniExportMenuButton<T>
          key="export"
          size={toolBarButtonSize}
          iconOnly={iconOnly}
          buttonText={exportButtonText}
          onExport={onExport}
          selectedRowKeys={selectedRowKeys}
          tableData={tableData}
        />
      )
    }

    if (showSyncButton && onSync) {
      rightButtons.push(
        <UniSyncButton
          key="sync"
          size={toolBarButtonSize}
          iconOnly={iconOnly}
          onSync={onSync}
          buttonText={syncButtonText}
        />
      )
    }

    if (showDatasetConfigButton && onDatasetConfig) {
      rightButtons.push(
        <Button
          key="dataset-config"
          type="default"
          size={toolBarButtonSize}
          icon={<TableOutlined />}
          onClick={() => onDatasetConfig()}
        >
          {datasetConfigButtonText ?? t('components.uniTable.datasetConfig')}
        </Button>
      )
    }

    if (showPrintButton && onPrint) {
      rightButtons.push(
        <Button
          key="print"
          size={toolBarButtonSize}
          icon={<PrinterOutlined />}
          disabled={selectedRowKeys.length !== 1}
          onClick={() => onPrint(selectedRowKeys, tableData)}
        >
          {printButtonText ?? t('components.uniTable.print')}
        </Button>
      )
    }

    return rightButtons.length > 0 ? <Space size="small">{rightButtons}</Space> : undefined
  }

  const buildHeaderActions = () => {
    return buildLeftActions()
  }

  /** 选中行变化时需重算左侧工具栏（下推/编辑等依赖 selectedRowKeys） */
  const memoizedHeaderActions = React.useMemo(
    () => buildHeaderActions() || undefined,
    [
      selectedRowKeys,
      headerActions,
      toolBarActionsBeforeCreate,
      toolBarActionsAfterCreate,
      toolBarActions,
      toolBarActionsAfterDelete,
      toolBarActionsAfterBatch,
      gatedShowCreateButton,
      gatedShowDeleteButton,
      deleteButtonDisabled,
      gatedShowEditButton,
      permissionGates.canRead,
      restProps.toolBarRender,
    ]
  )

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

  const memoizedOptions = React.useMemo(
    () => ({
      setting: {
        listsHeight: 360,
        checkedReset: false,
        extra: <TableColumnResetButton onResetResizable={handleColumnReset} />,
      },
      fullScreen: false,
      ...mergedToolbarOptions,
      /** 密度固定为紧凑（small），不展示工具栏密度切换；置后以免被传入 options 覆盖 */
      density: false,
      reload: () => {
        mergedToolbarOptions.reload?.()
        void reloadWithTanstackCacheBust()
      },
    }),
    [mergedToolbarOptions, handleColumnReset, reloadWithTanstackCacheBust]
  )

  const statCardsOptionsRender = useCallback(
    (_props: unknown, defaultDom: React.ReactNode[]) => {
      if (!statCardsCtx?.enabled) return defaultDom
      const toggleNode = (
        <span key="uni-stat-cards-toggle" onClick={statCardsCtx.toggle}>
          <Tooltip
            title={t(
              statCardsCtx.visible
                ? 'components.uniTable.hideStatCards'
                : 'components.uniTable.showStatCards'
            )}
          >
            <PieChartOutlined
              style={statCardsCtx.visible ? undefined : { color: token.colorTextQuaternary }}
            />
          </Tooltip>
        </span>
      )
      const reloadIdx = defaultDom.findIndex(
        node => React.isValidElement(node) && node.key === 'reload'
      )
      if (reloadIdx >= 0) {
        return [...defaultDom.slice(0, reloadIdx), toggleNode, ...defaultDom.slice(reloadIdx)]
      }
      return [toggleNode, ...defaultDom]
    },
    [statCardsCtx, t, token.colorTextQuaternary]
  )

  const memoizedRightActions = !isMobile ? buildRightActions(dataActionIconOnly) : undefined

  const memoizedToolbar = React.useMemo(
    () => ({
      actions: [
        ...(memoizedRightActions ? [memoizedRightActions] : []),
        ...(restProps.toolbar?.actions
          ? Array.isArray(restProps.toolbar.actions)
            ? restProps.toolbar.actions
            : [restProps.toolbar.actions]
          : []),
      ],
    }),
    [memoizedRightActions, restProps.toolbar?.actions]
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

  React.useLayoutEffect(() => {
    const root = containerRef.current
    if (!root) return
    const sync = () => {
      setDataActionIconOnly(root.clientWidth < DATA_ACTION_ICON_ONLY_MAX_WIDTH)
    }
    sync()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => sync()) : null
    ro?.observe(root)
    window.addEventListener('resize', sync)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [])

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

  const showSearchToolbarRow =
    searchPlacement === 'searchRow'
      ? showFuzzySearch ||
        showAdvancedSearch ||
        Boolean(beforeSearchButtons) ||
        Boolean(afterSearchButtons) ||
        Boolean(betweenFuzzyAndAdvancedButtons) ||
        (isMobile && gatedShowCreateButton && onCreate)
      : (!isMobile && viewTypes && viewTypes.length > 1) ||
        (isMobile && gatedShowCreateButton && onCreate)

  const effectiveToolbarButtonSize =
    toolBarButtonSize ?? (searchPlacement === 'toolbarLeft' ? 'small' : 'middle')

  const memoizedUniSearch = React.useMemo(
    () => (
      <UniSearch
        beforeSearch={beforeSearchButtons}
        betweenFuzzyAndAdvanced={
          betweenFuzzyAndAdvancedButtons || (isMobile && gatedShowCreateButton && onCreate) ? (
            <>
              {betweenFuzzyAndAdvancedButtons}
              {isMobile && gatedShowCreateButton && onCreate ? (
                <Button
                  key="mobile-create"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={onCreate}
                  size={effectiveToolbarButtonSize}
                  style={{ flexShrink: 0 }}
                >
                  {createButtonText ?? t('components.uniTable.create')}
                </Button>
              ) : null}
            </>
          ) : null
        }
        showFuzzySearch={showFuzzySearch}
        fuzzyPlaceholder={fuzzySearchPlaceholder}
        fuzzyValue={fuzzySearchKeyword}
        onFuzzyChange={handleFuzzySearch}
        onFuzzyPressEnter={v => handleFuzzySearch(v)}
        onFuzzyFocus={warmupPinyinIfNeeded}
        showAdvancedSearch={showAdvancedSearch}
        advancedSearchTableProps={{
          columns: processedColumns,
          formRef: formRef as React.MutableRefObject<ProFormInstance>,
          actionRef: outwardActionRef as React.MutableRefObject<ActionType>,
          searchParamsRef,
          pinnedSearchUiEpoch,
          onSearchParamsApplied: () => setPinnedSearchUiEpoch(e => e + 1),
        }}
        afterSearch={afterSearchButtons}
        showReset={!isMobile && (showFuzzySearch || showAdvancedSearch)}
        onReset={handleSearchReset}
        isMobile={isMobile}
        toolBarButtonSize={effectiveToolbarButtonSize}
      />
    ),
    [
      afterSearchButtons,
      beforeSearchButtons,
      betweenFuzzyAndAdvancedButtons,
      createButtonText,
      effectiveToolbarButtonSize,
      formRef,
      fuzzySearchKeyword,
      fuzzySearchPlaceholder,
      gatedShowCreateButton,
      handleFuzzySearch,
      handleSearchReset,
      isMobile,
      onCreate,
      pinnedSearchUiEpoch,
      processedColumns,
      searchParamsRef,
      outwardActionRef,
      showAdvancedSearch,
      showFuzzySearch,
      t,
      warmupPinyinIfNeeded,
    ]
  )

  const memoizedHeaderTitle = React.useMemo(() => {
    const leftActions = memoizedHeaderActions || headerTitle
    if (searchPlacement === 'toolbarLeft') {
      return (
        <div
          className="uni-table-toolbar-left"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'nowrap',
            minWidth: 0,
            width: '100%',
          }}
        >
          {memoizedUniSearch}
          {leftActions ? <div style={{ flexShrink: 0 }}>{leftActions}</div> : null}
        </div>
      )
    }
    return leftActions || undefined
  }, [headerTitle, memoizedHeaderActions, memoizedUniSearch, searchPlacement])

  const hasListToolbarActions = Boolean(memoizedHeaderActions || memoizedRightActions)

  return (
    <>
      <style>{UNI_TABLE_STYLES}</style>
      <div
        ref={containerRef}
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
