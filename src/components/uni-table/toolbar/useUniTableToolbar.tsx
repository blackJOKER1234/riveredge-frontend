/**
 * useUniTableToolbar
 *
 * 从 UniTable.tsx 拆出的工具栏域 Hook，覆盖：
 * - 3.1 左侧功能按钮区（headerTitle / buildLeftActions / buildHeaderActions）
 * - 3.2 右侧数据能力按钮区（buildRightActions / memoizedRightActions）
 * - ProTable toolbar 组装（memoizedToolbar）
 * - 表格 options 与列设置重置（memoizedOptions）
 * - 统计卡显隐切换（statCardsOptionsRender）
 * - 搜索行显隐、按钮尺寸与 UniSearch 组装（showSearchToolbarRow / effectiveToolbarButtonSize / memoizedUniSearch）
 * - headerTitle 组装（memoizedHeaderTitle）与列表工具栏存在标记（hasListToolbarActions）
 * - 窄屏右侧按钮仅图标模式（dataActionIconOnly + containerRef 测量）
 *
 * 行为约束：所有抽取逻辑与 UniTable.tsx 当前实现保持一致；依赖数组、默认值、
 * 非 memo 的普通计算均按原文件照搬，不额外重构。调用方接入时需把返回的
 * containerRef 挂到原外层容器 div 上，其余依赖（权限门控、选中行、搜索参数、
 * reload 等）由 options 传入。
 */

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Space, theme, Tooltip } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  PrinterOutlined,
  TableOutlined,
  PieChartOutlined,
} from '@ant-design/icons'
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components'
import UniSearch from '../../uni-search'
import { UniBatchDeleteButton } from '../../uni-batch'
import { UniSyncButton } from '../../uni-sync'
import { UniImportToolbarButton } from '../../uni-import'
import { UniExportMenuButton } from '../../uni-export'
import { withSingleNewShortcutHint } from '../../../utils/globalNewShortcut'
import { withToolbarItemKeys, TableColumnResetButton } from '../toolbarUtils'
import { DATA_ACTION_ICON_ONLY_MAX_WIDTH } from '../constants'
import type { ResourcePermissionGates } from '../../../hooks/useResourcePermissions'
import type { ListPageStatCardsContextValue } from '../../layout-templates/listPageStatCardsContext'
import type { UniTableProps } from '../types'

/** 工具栏域依赖的 ProTable 透传字段（options / toolbar / optionsRender 等保持最小局部类型）。 */
export interface UniTableToolbarOptions<
  T extends Record<string, any> = Record<string, any>,
> {
  /** 3.1 左侧：完全自定义左侧功能按钮区（提供后不再走默认拼装） */
  headerActions?: React.ReactNode
  /** 左侧标题兜底（headerActions 为空时展示） */
  headerTitle?: string
  toolBarActionsBeforeCreate?: React.ReactNode[]
  toolBarActionsAfterCreate?: React.ReactNode[]
  toolBarActions?: React.ReactNode[]
  toolBarActionsAfterDelete?: React.ReactNode[]
  toolBarActionsAfterBatch?: React.ReactNode[]
  toolBarButtonSize?: 'large' | 'middle' | 'small'
  showFuzzySearch?: boolean
  fuzzySearchPlaceholder?: string
  showAdvancedSearch?: boolean
  searchPlacement?: 'searchRow' | 'toolbarLeft'
  beforeSearchButtons?: React.ReactNode
  betweenFuzzyAndAdvancedButtons?: React.ReactNode
  afterSearchButtons?: React.ReactNode
  viewTypes?: UniTableProps<T>['viewTypes']
  showCreateButton?: boolean
  onCreate?: () => void
  createButtonText?: string
  showEditButton?: boolean
  onEdit?: (selectedRowKeys: React.Key[]) => void
  onDetail?: (selectedRowKeys: React.Key[]) => void | Promise<void>
  detailButtonText?: string
  showDeleteButton?: boolean
  onDelete?: (selectedRowKeys: React.Key[]) => void
  deleteButtonText?: string
  deleteConfirmTitle?: string | ((count: number) => string)
  deleteConfirmDescription?: string | ((count: number) => string)
  deleteButtonDisabled?: boolean
  showImportButton?: boolean
  onImport?: UniTableProps<T>['onImport']
  showExportButton?: boolean
  onExport?: UniTableProps<T>['onExport']
  exportButtonText?: string
  rightToolBarActionsBeforeExport?: React.ReactNode[]
  showSyncButton?: boolean
  onSync?: () => void
  syncButtonText?: string
  showDatasetConfigButton?: boolean
  onDatasetConfig?: () => void
  datasetConfigButtonText?: string
  showPrintButton?: boolean
  onPrint?: UniTableProps<T>['onPrint']
  printButtonText?: string
  /** ProTable toolBarRender：仅用于向左侧注入节点（UniTable 剥离后复用） */
  toolBarRender?: UniTableProps<T>['toolBarRender']
  /** ProTable 原始 options（与 toolbar.options 合并为 mergedToolbarOptions） */
  options?: unknown
  /** ProTable 原始 toolbar（options 与 actions） */
  toolbar?: {
    actions?: React.ReactNode | React.ReactNode[]
    options?: unknown
  }

  /** 权限门控（仅详情按钮直接使用 canRead；其余 gated* 由调用方按现有规则计算） */
  permissionGates: Pick<ResourcePermissionGates, 'canRead'>
  gatedShowCreateButton: boolean
  gatedShowDeleteButton: boolean
  gatedShowEditButton: boolean
  gatedShowImportButton: boolean
  gatedShowExportButton: boolean
  /** 当前选中行键（受控/内部已归一） */
  selectedRowKeys: React.Key[]
  /** 当前页表格数据 */
  tableData: T[]
  /** 列表页统计卡上下文（未启用时传 null） */
  statCardsCtx: ListPageStatCardsContextValue | null
  /** 带 TanStack 强刷新的 reload（与工具栏 options 共用） */
  reload: (...args: any[]) => unknown
  /** 带 TanStack 强刷新的 reloadAndRest（toolBarRender mock action 使用） */
  reloadAndRest: (...args: any[]) => unknown
  /** 列设置重置（列宽/列状态） */
  handleColumnReset: () => void
  /** 模糊搜索输入回调（主组件防抖逻辑） */
  handleFuzzySearch: (value: string) => void
  /** 搜索重置回调（主组件清空关键词/表单并刷新） */
  handleSearchReset: () => void
  /** 批量删除确认回调 */
  handleBatchDeleteConfirm: (keys: React.Key[]) => void | Promise<void>
  /** 打开导入弹窗回调（对应原组件 setImportModalVisible(true)） */
  openImportModal: () => void
  /** ProTable / 页面共用的搜索参数 ref */
  searchParamsRef: React.MutableRefObject<Record<string, any> | undefined>
  /** ProTable 表单实例 ref */
  formRef: React.MutableRefObject<ProFormInstance | undefined>
  /** 对外暴露的 action ref（包含 TanStack 强刷新包装） */
  actionRef: React.MutableRefObject<ActionType | undefined>
  /** 当前模糊搜索关键词 */
  fuzzySearchKeyword: string
  /** 高级搜索钉住条件激活态 epoch */
  pinnedSearchUiEpoch: number
  setPinnedSearchUiEpoch: React.Dispatch<React.SetStateAction<number>>
  /** 已处理列（日期格式化、单位字典、操作列等） */
  processedColumns: ProColumns<T>[]
  /** 聚焦模糊搜索时预加载拼音库 */
  warmupPinyinIfNeeded: () => void
  /** 移动端判定（主组件已计算） */
  isMobile: boolean
}

/** 窄屏测量：容器宽度低于阈值时右侧导入/导出/同步仅显示图标。 */
function useDataActionIconOnly(): {
  containerRef: React.RefObject<HTMLDivElement | null>
  dataActionIconOnly: boolean
} {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dataActionIconOnly, setDataActionIconOnly] = useState(false)

  useLayoutEffect(() => {
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

  return { containerRef, dataActionIconOnly }
}

/**
 * UniTable 工具栏域 Hook。
 *
 * @param options - 工具栏域所需 props、权限门控、表格运行时依赖与搜索/刷新回调。
 * @returns 沿用 UniTable.tsx 命名的 memoized 工具栏/搜索/options 结果，以及接入外层容器
 * 所需的 containerRef 和窄屏 dataActionIconOnly。
 */
export function useUniTableToolbar<T extends Record<string, any> = Record<string, any>>(
  options: UniTableToolbarOptions<T>
): {
  containerRef: React.RefObject<HTMLDivElement | null>
  dataActionIconOnly: boolean
  effectiveToolbarButtonSize: 'large' | 'middle' | 'small'
  memoizedHeaderActions: React.ReactNode | undefined
  memoizedHeaderTitle: React.ReactNode
  memoizedRightActions: React.ReactNode | undefined
  memoizedToolbar: { actions: React.ReactNode[] }
  memoizedOptions: any
  memoizedUniSearch: React.ReactNode
  /** 与 UniTable.tsx 一致：移动端新建回调使表达式可能为函数/undefined，仅作 truthy 判断 */
  showSearchToolbarRow: boolean | (() => void) | undefined
  hasListToolbarActions: boolean
  statCardsOptionsRender: (_props: unknown, defaultDom: React.ReactNode[]) => React.ReactNode[]
} {
  const {
    headerActions,
    headerTitle,
    toolBarActionsBeforeCreate = [],
    toolBarActionsAfterCreate = [],
    toolBarActions = [],
    toolBarActionsAfterDelete = [],
    toolBarActionsAfterBatch = [],
    toolBarButtonSize,
    showFuzzySearch = true,
    fuzzySearchPlaceholder,
    showAdvancedSearch = true,
    searchPlacement = 'searchRow',
    beforeSearchButtons,
    betweenFuzzyAndAdvancedButtons,
    afterSearchButtons,
    viewTypes = ['table', 'help'],
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
    showImportButton = true,
    onImport,
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
    toolBarRender,
    options: mergedOptions,
    toolbar,
    permissionGates,
    gatedShowCreateButton,
    gatedShowDeleteButton,
    gatedShowEditButton,
    gatedShowImportButton,
    gatedShowExportButton,
    selectedRowKeys,
    tableData,
    statCardsCtx,
    reload,
    reloadAndRest,
    handleColumnReset,
    handleFuzzySearch,
    handleSearchReset,
    handleBatchDeleteConfirm,
    openImportModal,
    searchParamsRef,
    formRef,
    actionRef,
    fuzzySearchKeyword,
    pinnedSearchUiEpoch,
    setPinnedSearchUiEpoch,
    processedColumns,
    warmupPinyinIfNeeded,
    isMobile,
  } = options

  const { t } = useTranslation()
  const { token } = theme.useToken()
  const { containerRef, dataActionIconOnly } = useDataActionIconOnly()

  const mergedToolbarOptions = (mergedOptions || (toolbar as any)?.options || {}) as any

  /** 3.1 左侧功能按钮区：`headerTitle` 内容（含 uni-batch、下推类按钮约定落此区）。 */
  const buildLeftActions = () => {
    const actions: React.ReactNode[] = []

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
    if (toolBarRender) {
      const mockAction = {
        reload,
        reloadAndRest,
      } as any
      const mockSelectedRowKeys = selectedRowKeys as any
      const userResult = toolBarRender(mockAction, {
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
    const rightButtons: React.ReactNode[] = []

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
          onOpen={openImportModal}
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
      toolBarRender,
    ]
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
        void reload()
      },
    }),
    [mergedToolbarOptions, handleColumnReset, reload]
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
        ...(toolbar?.actions
          ? Array.isArray(toolbar.actions)
            ? toolbar.actions
            : [toolbar.actions]
          : []),
      ],
    }),
    [memoizedRightActions, toolbar?.actions]
  )

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
          actionRef: actionRef as React.MutableRefObject<ActionType>,
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
      actionRef,
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

  return {
    containerRef,
    dataActionIconOnly,
    effectiveToolbarButtonSize,
    memoizedHeaderActions,
    memoizedHeaderTitle,
    memoizedRightActions,
    memoizedToolbar,
    memoizedOptions,
    memoizedUniSearch,
    showSearchToolbarRow,
    hasListToolbarActions,
    statCardsOptionsRender,
  }
}
