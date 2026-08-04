/**
 * UniTable 列策略 Hook
 *
 * 从 UniTable.tsx 拆出的「列处理、列状态持久化、固定列纠偏、导入配置、列重置」域。
 * 已由 UniTable.tsx 接入，行为与拆分前保持一致。
 *
 * 域职责：
 * - effectiveColumns / processedColumns / effectiveTableColumns 计算
 * - columnsForResize + useAntdResizableHeader（当前恒为空数组，保持拖拽改宽禁用）
 * - tableId / columnsPersistenceFullKey / 固定列 order 纠偏（localStorage + ProTable columnsState）
 * - handleColumnReset：列展示、列宽、服务端偏好重置
 * - effectiveImportConfig / importTemplateDocumentName：导入模板配置
 */
import {
  createElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { Key } from 'react'
import type { ProColumns } from '@ant-design/pro-components'
import type { ColumnsState } from '@ant-design/pro-table'
import { useConfigStore } from '../../../stores/configStore'
import { formatDateBySiteSetting, formatDateTimeBySiteSetting } from '../../../utils/format'
import { DictionaryLabel } from '../../../components/dictionary-label'
import { isUniTableOperationColumn, renderUniTableOperationCell } from '../../uni-action'
import { translatePathTitle } from '../../../utils/menuTranslation'
import {
  getUniTableLifecycleCellClassName,
  isUniTableLifecycleColumn,
  resolveUniTableLifecycleColumnWidth,
  resolveUniTableOperationColumnWidth,
  UNI_TABLE_LIFECYCLE_MIN_WIDTH,
  UNI_TABLE_OPERATION_MIN_WIDTH,
} from '../../../utils/uniTableLayoutColumns'
import {
  applyUniTableColumnWidthPolicy,
  buildDefaultColumnsStateMap,
  buildFixedRightColumnOrderOverlay,
  finalizeUniTableColumns,
} from '../columnPolicy'
import { generateImportConfigFromColumns } from '../importConfig'
import type { ResourcePermissionGates } from '../../../hooks/useResourcePermissions'

export type UseUniTableColumnsT = (key: string, opts?: { [key: string]: any }) => string

/** rc-table 在无 onCell 时也会为每个 Cell 新建空对象，导致 Cell memo 失效；统一注入稳定引用。 */
const UNI_TABLE_STATIC_CELL_PROPS: Record<string, unknown> = {}
const UNI_TABLE_OPERATION_CELL_PROPS = {
  className: 'uni-table-operation-cell',
  style: { whiteSpace: 'nowrap' },
}

/** 项目当前禁用列拖拽：用稳定空值替代 useAntdResizableHeader，避免其 window resize 重建列引用。 */
const UNI_TABLE_NO_RESIZABLE_COLUMNS: any[] = []
const UNI_TABLE_NO_RESIZABLE_COMPONENTS = { header: { cell: undefined } }
/** ProTable columnsState 未从包根导出，这里保持最小结构（与 ColumnStateType 一致）。 */
export interface UseUniTableColumnsUserState {
  persistenceType?: 'localStorage' | 'sessionStorage'
  persistenceKey?: string
  defaultValue?: Record<string, ColumnsState>
  value?: Record<string, ColumnsState>
  onChange?: (map: Record<string, ColumnsState>) => void
}

export interface UseUniTableColumnsOptions<T extends Record<string, any> = Record<string, any>> {
  /** 表格列定义 */
  columns: ProColumns<T>[]
  /** 明细表格视图列定义 */
  detailTableColumns?: ProColumns<T>[]
  /** 当前视图类型（detailTable 时使用 detailTableColumns） */
  currentViewType: string
  /** 表格标题；无 columnPersistenceId 时作为列持久化 key 与导入模板名 */
  headerTitle?: string
  /** 稳定的列展示/列宽持久化 key（推荐显式传入） */
  columnPersistenceId?: string
  /** 调用方传入的 ProTable columnsState */
  userColumnsState?: UseUniTableColumnsUserState
  /** 导入表头（可选，优先于自动生成） */
  importHeaders?: string[]
  /** 导入示例数据（可选，优先于自动生成） */
  importExampleRow?: string[]
  /** 导入字段映射（可选，叠加在自动生成结果之上） */
  importFieldMap?: Record<string, string>
  /** 是否自动从 columns 生成导入配置（默认：true，与 UniTableProps 一致） */
  autoGenerateImportConfig?: boolean
  /** 导入模板文件名中的单据/页面名称 */
  importTemplateName?: string
  /** i18n 翻译函数 */
  t: UseUniTableColumnsT
  /** 当前路由 location（用于解析菜单标题作为导入模板名） */
  location: { pathname: string }
  /** 用户表格偏好同步函数 */
  syncTablePreference: (tableId: string, state: Record<string, any>) => Promise<void>
  /** 页面资源权限门 */
  permissionGates: ResourcePermissionGates
  /** 保留：导出域后续接入时使用；当前列策略域不消费 */
  onExport?: (
    type: 'selected' | 'currentPage' | 'all',
    selectedRowKeys?: Key[],
    currentPageData?: T[]
  ) => void
}

export interface UseUniTableColumnsState {
  persistenceType?: 'localStorage' | 'sessionStorage'
  persistenceKey?: string
  defaultValue?: Record<string, ColumnsState>
  value?: Record<string, ColumnsState>
  onChange?: (map: Record<string, any> | undefined) => void
}

export interface UseUniTableColumnsImportConfig {
  headers: string[] | undefined
  exampleRow: string[] | undefined
  fieldMap: Record<string, string> | undefined
}

export interface UseUniTableColumnsResult<T extends Record<string, any> = Record<string, any>> {
  /** 明细视图列或基础列 */
  effectiveColumns: ProColumns<T>[]
  /** 注入日期格式、单位字典、生命周期/操作列宽度后的列 */
  processedColumns: any[]
  /** useAntdResizableHeader 返回的列（当前恒为空数组） */
  resizableColumns: any[]
  /** useAntdResizableHeader 返回的表头单元格组件 */
  resizableComponents: any
  /** 最终渲染到 ProTable 的列 */
  effectiveTableColumns: any[]
  /** 列持久化 key（columnPersistenceId ?? headerTitle） */
  tableId: string | undefined
  /** 列展示/列宽/服务端偏好重置回调 */
  handleColumnReset: () => void
  /** 拖拽开启时的数值 scroll.x（当前恒为 undefined） */
  effectiveTableWidth: number | string | undefined
  /** ProTable columnsState 合并结果 */
  mergedColumnsStateProp: UseUniTableColumnsState
  /** localStorage 列状态完整 key */
  columnsPersistenceFullKey: string | undefined
  /** 固定列 order 纠偏触发的重挂载 epoch */
  columnsStatePatchEpoch: number
  /** 导入弹窗使用的表头/示例/字段映射 */
  effectiveImportConfig: UseUniTableColumnsImportConfig
  /** 导入模板文档名 */
  importTemplateDocumentName: string | undefined
}

export function useUniTableColumns<T extends Record<string, any> = Record<string, any>>({
  columns,
  detailTableColumns,
  currentViewType,
  headerTitle,
  columnPersistenceId,
  userColumnsState,
  importHeaders,
  importExampleRow,
  importFieldMap,
  autoGenerateImportConfig = true,
  importTemplateName,
  t,
  location,
  syncTablePreference,
  permissionGates,
}: UseUniTableColumnsOptions<T>): UseUniTableColumnsResult<T> {
  const getConfig = useConfigStore(s => s.getConfig)
  const dateFormatKey = getConfig('date_format', 'YYYY-MM-DD')

  // 明细表格视图使用 detailTableColumns，否则使用 columns
  const effectiveColumns = useMemo(() => {
    if (currentViewType === 'detailTable' && detailTableColumns && detailTableColumns.length > 0) {
      return detailTableColumns
    }
    return columns
  }, [currentViewType, columns, detailTableColumns])

  const isOperationColumn = (col: any) => isUniTableOperationColumn(col)

  // 为 date/dateTime 列注入站点格式展示，单位列使用字典标签，生命周期/操作列注入统一宽度与样式
  const processedColumns = useMemo(() => {
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
          render: (val: any) =>
            createElement(DictionaryLabel, { dictionaryCode: 'unit', value: val }),
        }
      }
      // 生命周期列统一策略：固定收缩锚点 + 最小宽度，屏蔽历史固定宽度带来的留白
      if (isUniTableLifecycleColumn(col)) {
        const { width: _w, minWidth: _mw, ...lifecycleRest } = col
        const userOnCell = lifecycleRest.onCell
        const lifecycleCellClass = getUniTableLifecycleCellClassName(lifecycleRest)
        const stableLifecycleCellProps = { className: lifecycleCellClass }
        return {
          ...lifecycleRest,
          width: resolveUniTableLifecycleColumnWidth(lifecycleRest),
          minWidth: UNI_TABLE_LIFECYCLE_MIN_WIDTH,
          resizable: false,
          onCell: typeof userOnCell === 'function'
            ? (record: any, rowIndex?: number) => {
                const base = userOnCell(record, rowIndex) || {}
                return {
                  ...base,
                  className: `${lifecycleCellClass} ${base.className || ''}`.trim(),
                }
              }
            : () => stableLifecycleCellProps,
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
    // rc-table 对无 onCell 的列会回退到 `{}`，每次渲染都换引用导致 Cell memo 失效；
    // 普通列统一注入稳定 onCell，操作/生命周期列由下方各自维护稳定默认值。
    const withStableCellProps = mapped.map(col => {
      if (col.onCell || isOperationColumn(col) || isUniTableLifecycleColumn(col)) return col
      return { ...col, onCell: () => UNI_TABLE_STATIC_CELL_PROPS }
    })
    return applyUniTableColumnWidthPolicy(withStableCellProps, false)
  }, [effectiveColumns, dateFormatKey, permissionGates])

  // 全项目统一策略：结构化列保留页面 width；主文本列由 applyUniTableColumnWidthPolicy 释放 width；
  // 不启用拖拽改宽与本地列宽持久化，避免「代码 width」与 localStorage 双控制源竞争。
  const tableId = columnPersistenceId ?? headerTitle
  const resizableColumns = UNI_TABLE_NO_RESIZABLE_COLUMNS
  const resizableComponents = UNI_TABLE_NO_RESIZABLE_COMPONENTS
  const tableWidth: number | undefined = undefined
  const resetColumns = useCallback((_resetStorage?: boolean) => {}, [])
  const refresh = useCallback(() => {}, [])

  const handleColumnReset = useCallback(() => {
    if (tableId) {
      try {
        localStorage.removeItem(`ui.tables.${tableId}.columnsWidth`)
      } catch (_) {}
      resetColumns(true)
      refresh()
      syncTablePreference(tableId, { columns: {}, columnsWidth: {} }).catch(() => {})
    }
  }, [tableId, resetColumns, refresh, syncTablePreference])

  // 操作列：不换行；列宽与 scroll 交由 antd（见 UniTable 的 mergedScroll）
  const effectiveTableColumns = useMemo(() => {
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
            : () => UNI_TABLE_OPERATION_CELL_PROPS
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
  const effectiveImportConfig = useMemo(() => {
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

  // 仅列拖拽开启时使用 hook 算出的 tableWidth；否则不注入数值 scroll.x，交给 antd 默认策略
  const effectiveTableWidth: number | string | undefined =
    resizableColumns.length > 0 && tableWidth != null ? tableWidth : undefined

  const columnsSyncDebounceRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    return () => {
      if (columnsSyncDebounceRef.current) {
        clearTimeout(columnsSyncDebounceRef.current)
      }
    }
  }, [])

  // 合并列状态：为右侧固定列写入默认 order，保证生命周期在操作列左侧（与 normalizeFixedRightColumnOrder 一致）
  const mergedColumnsStateProp = useMemo((): UseUniTableColumnsState => {
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

  // 与 mergedColumnsStateProp.persistenceKey 一致，用于纠偏 localStorage 中的列 order
  const columnsPersistenceFullKey =
    userColumnsState?.persistenceKey ??
    (tableId != null && tableId !== '' ? `ui.tables.${tableId}.columns` : undefined)

  // 列结构签名：内容不变时避免因 columns 引用抖动重复打补丁
  const columnStructureSig = useMemo(
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
  const applyColumnsOrderOverlay = useCallback((): boolean => {
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

  const columnsStatePatchSigRef = useRef<string | null>(null)
  const [columnsStatePatchEpoch, setColumnsStatePatchEpoch] = useState(0)
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

  useLayoutEffect(() => {
    // 首次挂载已在 render 阶段完成纠偏，跳过
    if (columnsStatePatchSigRef.current === currentPatchSig) return
    columnsStatePatchSigRef.current = currentPatchSig
    if (applyColumnsOrderOverlay()) {
      setColumnsStatePatchEpoch(e => e + 1)
    }
  }, [currentPatchSig, applyColumnsOrderOverlay])

  return {
    effectiveColumns,
    processedColumns,
    resizableColumns,
    resizableComponents,
    effectiveTableColumns,
    tableId,
    handleColumnReset,
    effectiveTableWidth,
    mergedColumnsStateProp,
    columnsPersistenceFullKey,
    columnsStatePatchEpoch,
    effectiveImportConfig,
    importTemplateDocumentName,
  }
}
