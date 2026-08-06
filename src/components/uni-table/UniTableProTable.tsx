/**
 * UniTableProTable
 *
 * 从 UniTable.tsx 拆出的表格渲染子组件：集中 ProTable props 归一化、
 * toolBarRender 选中行同步、滚动策略注入与选中行底部提示。
 */
import React, { memo, useMemo } from 'react'
import type { Key, RefObject } from 'react'
import { ConfigProvider } from 'antd'
import { ProTable, type ActionType, type ProFormInstance } from '@ant-design/pro-components'
import { computeUniTableMinScrollX } from '../../utils/uniTableLayoutColumns'

type UniTableMergedScroll = {
  x?: string | number | true
  y?: string | number
  scrollToFirstRowOnChange?: boolean
}

export interface UniTableProTableProps<
  T extends Record<string, any> = Record<string, any>,
> {
  columnsPersistenceFullKey?: string
  columnsStatePatchEpoch: number
  memoizedHeaderTitle?: React.ReactNode
  tableBodyPaneRef: RefObject<HTMLDivElement | null>
  actionRefForProTable: React.MutableRefObject<ActionType | undefined>
  formRef: React.MutableRefObject<ProFormInstance | undefined>
  effectiveTableColumns: any[]
  handleRequest: (params: any, sort: any, filter: any) => Promise<any>
  tableRequestDebounce: number
  rowKey: string | ((record: T, index?: number) => Key)
  showLoading: boolean
  loadingDelay: number
  showDelayedLoading: boolean
  mergedColumnsStateProp: any
  memoizedToolbar: { actions: React.ReactNode[] }
  memoizedRowSelection: any
  memoizedEditable: any
  memoizedPagination: any
  effectiveTableAlertRender: any
  selectedRowKeysProp?: Key[]
  selectedRowKeys: Key[]
  enableRowSelection: boolean
  syncInternalSelectedRowKeys: (keys: Key[]) => void
  memoizedRightActions?: React.ReactNode
  restProps: Record<string, any>
  proTableBodyScrollYEnabled: boolean
  isEmptyTable: boolean
  emptyTableHasFixedColumns: boolean
  tableHasRowSelection: boolean
  effectiveTableWidth?: number | string
  allowCustomScrollY: boolean
  allowCustomScrollX: boolean
  virtualized: boolean
  virtualTableBodyMaxHeight: number
  listPageScrollY?: string | number
  rowClickSelectionEnabled: boolean
  mergedOnRow: any
  resizableColumns: any[]
  resizableComponents: any
  statCardsOptionsRender?: (_props: unknown, defaultDom: React.ReactNode[]) => React.ReactNode[]
  memoizedOptions: any
  embedded: boolean
  currentViewType: string
  tableViewTypes?: string[]
  isMobile: boolean
  selectionAlertLayout: { top: number; height: number } | null
  handleClearSelection: () => void
  t: (key: string, options?: Record<string, any>) => string
}

function UniTableProTableInner<T extends Record<string, any> = Record<string, any>>({
  columnsPersistenceFullKey,
  columnsStatePatchEpoch,
  memoizedHeaderTitle,
  tableBodyPaneRef,
  actionRefForProTable,
  formRef,
  effectiveTableColumns,
  handleRequest,
  tableRequestDebounce,
  rowKey,
  showLoading,
  loadingDelay,
  showDelayedLoading,
  mergedColumnsStateProp,
  memoizedToolbar,
  memoizedRowSelection,
  memoizedEditable,
  memoizedPagination,
  effectiveTableAlertRender,
  selectedRowKeysProp,
  selectedRowKeys,
  enableRowSelection,
  syncInternalSelectedRowKeys,
  memoizedRightActions,
  restProps,
  proTableBodyScrollYEnabled,
  isEmptyTable,
  emptyTableHasFixedColumns,
  tableHasRowSelection,
  effectiveTableWidth,
  allowCustomScrollY,
  allowCustomScrollX,
  virtualized,
  virtualTableBodyMaxHeight,
  listPageScrollY,
  rowClickSelectionEnabled,
  mergedOnRow: mergedOnRowProp,
  resizableColumns,
  resizableComponents,
  statCardsOptionsRender,
  memoizedOptions,
  embedded,
  currentViewType,
  tableViewTypes,
  isMobile,
  selectionAlertLayout,
  handleClearSelection,
  t,
}: UniTableProTableProps<T>) {
  const mergedProTableProps = useMemo(() => {
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
    let mergedScroll: UniTableMergedScroll | undefined =
      ourScrollX != null
        ? ({ ...(normalizedUserScroll || {}), x: ourScrollX } as UniTableMergedScroll)
        : allowCustomScrollX && normalizedUserScroll?.x !== undefined
          ? (normalizedUserScroll as UniTableMergedScroll)
          : ({ ...(normalizedUserScroll || {}), x: 'max-content' as const } as UniTableMergedScroll)
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

    const mergedOnRow = rowClickSelectionEnabled ? mergedOnRowProp : userOnRow

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
  }, [
    restProps,
    resizableColumns,
    resizableComponents,
    effectiveTableWidth,
    allowCustomScrollX,
    allowCustomScrollY,
    virtualized,
    virtualTableBodyMaxHeight,
    listPageScrollY,
    proTableBodyScrollYEnabled,
    isEmptyTable,
    emptyTableHasFixedColumns,
    tableHasRowSelection,
    effectiveTableColumns,
    rowClickSelectionEnabled,
    mergedOnRowProp,
  ])

  return (
    <ConfigProvider getPopupContainer={() => document.body}>
      <div
        ref={tableBodyPaneRef as React.RefObject<HTMLDivElement>}
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
        {/* @ts-ignore */}
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
                  syncInternalSelectedRowKeys(newKeys)
                })
              }
            }
            return memoizedRightActions ? [memoizedRightActions] : []
          }}
          {...mergedProTableProps}
          size="small"
          options={memoizedOptions}
          optionsRender={
            statCardsOptionsRender
              ? statCardsOptionsRender
              : (restProps as any).optionsRender
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
  )
}

export const UniTableProTable = memo(UniTableProTableInner) as unknown as typeof UniTableProTableInner
