import { isUniTableOperationColumn } from '../uni-action'
import {
  getUniTableLifecycleCellClassName,
  isUniTableLifecycleColumn,
} from '../../utils/uniTableLayoutColumns'

export function normalizeFixedRightColumnOrder<T extends Record<string, any>>(columns: T[]): T[] {
  if (!columns?.length) return columns
  const rest: T[] = []
  const fixedRight: T[] = []
  for (const col of columns) {
    if ((col as any).fixed === 'right') fixedRight.push(col)
    else rest.push(col)
  }
  if (fixedRight.length <= 1) return columns

  const isLifecycle = (c: any) => isUniTableLifecycleColumn(c)

  fixedRight.sort((a: any, b: any) => {
    const rank = (c: any) => (isUniTableOperationColumn(c) ? 2 : isLifecycle(c) ? 1 : 0)
    return rank(a) - rank(b)
  })
  return [...rest, ...fixedRight]
}

export function applyLifecycleColumnAlignLeft<T extends Record<string, any>>(columns: T[]): T[] {
  if (!columns?.length) return columns
  return columns.map((col: any) => {
    if (!isUniTableLifecycleColumn(col)) return col
    return { ...col, align: 'left' as const }
  })
}

/** 短人名类字段保留页面 width（如销售员/采购员），不做内容撑宽。 */
export const UNI_TABLE_SHORT_NAME_FIELDS = new Set([
  'salesman_name',
  'buyer_name',
  'operator_name',
  'user_name',
  'creator_name',
  'updater_name',
  'auditor_name',
])

export const UNI_TABLE_STRUCTURED_VALUE_TYPES = new Set([
  'date',
  'dateTime',
  'dateRange',
  'time',
  'money',
  'digit',
  'digitRange',
  'select',
  'progress',
  'index',
  'indexBorder',
])

export function isUniTableLayoutColumn(col: any): boolean {
  return (
    col?.hideInTable === true || isUniTableOperationColumn(col) || isUniTableLifecycleColumn(col)
  )
}

/** 主文本列：去掉固定 width，配合 scroll.x=max-content 由内容决定列宽（销售订单已验证策略）。 */
export function isUniTableFlexTextColumn(col: any): boolean {
  if (isUniTableLayoutColumn(col)) return false
  if (col?.fixed) return false
  if (col?.resizable === false || col?.uniTableKeepWidth === true) return false

  const dataIndex = typeof col?.dataIndex === 'string' ? col.dataIndex : ''
  if (!dataIndex) return false
  if (UNI_TABLE_SHORT_NAME_FIELDS.has(dataIndex)) return false
  if (col?.valueType && UNI_TABLE_STRUCTURED_VALUE_TYPES.has(String(col.valueType))) return false
  if (/(^code$|_code$)/.test(dataIndex)) return false

  if (
    /_(name|title|remark|description|desc|note|notes|comment|address|specification)$|^(name|title|remark|description|note|comment)$/.test(
      dataIndex
    )
  ) {
    return true
  }

  return col?.ellipsis === true && !col?.valueType
}

/** 页面标记的主信息列：释放 width、保留 minWidth，用于吃掉表格剩余横向空间（如客户/名称） */
export function isUniTablePrimaryFlexColumn(col: any): boolean {
  return col?.uniTablePrimaryFlex === true
}

/** 结构化/短名列不参与「兜底 strip」，避免更新时间/金额等被拉宽 */
export function isUniTableProtectedWidthColumn(col: any): boolean {
  if (col?.uniTableKeepWidth === true || col?.resizable === false) return true
  const dataIndex = typeof col?.dataIndex === 'string' ? col.dataIndex : ''
  if (dataIndex && UNI_TABLE_SHORT_NAME_FIELDS.has(dataIndex)) return true
  if (col?.valueType && UNI_TABLE_STRUCTURED_VALUE_TYPES.has(String(col.valueType))) return true
  return false
}

export function stripUniTableColumnWidth(col: any): any {
  if (col?.width == null) return col
  const { width: _width, ...rest } = col
  return rest
}

/**
 * 全项目列宽策略（与 scroll.x=max-content 配合）：
 * 1. 主文本列 / uniTablePrimaryFlex 列去掉 width，由内容或 minWidth 撑开；
 * 2. 若可见数据列仍全部带 width，仅从 flex 候选列释放一列（禁止误伤 dateTime/金额等定宽列）。
 */
export function hasUniTableFixedColumns(columns: any[]): boolean {
  return columns.some(c => !c.hideInTable && (c.fixed === 'left' || c.fixed === 'right'))
}

export function applyUniTableColumnWidthPolicy(columns: any[], preserveWidths = false): any[] {
  if (!columns?.length || preserveWidths) return columns

  let result = columns.map(col =>
    isUniTableFlexTextColumn(col) || isUniTablePrimaryFlexColumn(col)
      ? stripUniTableColumnWidth(col)
      : col
  )

  const dataCols = result.filter(col => !isUniTableLayoutColumn(col))
  const allHaveWidth = dataCols.length > 0 && dataCols.every(col => col.width != null)
  if (!allHaveWidth) return result

  let stripIdx = -1
  for (let i = result.length - 1; i >= 0; i--) {
    const col = result[i]
    if (isUniTableLayoutColumn(col) || col?.fixed || isUniTableProtectedWidthColumn(col)) continue
    if (isUniTableFlexTextColumn(col) || isUniTablePrimaryFlexColumn(col)) {
      stripIdx = i
      break
    }
  }
  if (stripIdx < 0) return result

  return result.map((col, i) => (i === stripIdx ? stripUniTableColumnWidth(col) : col))
}

/** 表头单元格与表身对齐：nowrap + 可选语义 class（生命周期 / 操作列）。 */
export function mergeUniTableHeaderCell(col: any, cellClassName?: string): any {
  const userOnHeaderCell = col.onHeaderCell
  return {
    ...col,
    onHeaderCell: (...args: any[]) => {
      const base =
        typeof userOnHeaderCell === 'function'
          ? userOnHeaderCell(...args) || {}
          : userOnHeaderCell || {}
      const mergedClass = [cellClassName, base.className].filter(Boolean).join(' ').trim()
      return {
        ...base,
        ...(mergedClass ? { className: mergedClass } : {}),
        style: {
          whiteSpace: 'nowrap',
          ...(base.style || {}),
        },
      }
    },
  }
}

/** 为所有可见表格列注入表头 onHeaderCell，与表身 nowrap / 生命周期 / 操作列 class 一致。 */
export function applyUniTableHeaderCellPolicy(columns: any[]): any[] {
  return columns.map(col => {
    if (col.hideInTable) return col
    if (isUniTableOperationColumn(col)) {
      return mergeUniTableHeaderCell(col, 'uni-table-operation-cell')
    }
    if (isUniTableLifecycleColumn(col)) {
      return mergeUniTableHeaderCell(col, getUniTableLifecycleCellClassName(col))
    }
    return mergeUniTableHeaderCell(col)
  })
}

export function finalizeUniTableColumns(columns: any[]): any[] {
  return applyUniTableHeaderCellPolicy(
    applyLifecycleColumnAlignLeft(normalizeFixedRightColumnOrder(columns))
  )
}

export function getProColumnStateKey(col: any, columnIndex: number): string {
  const key = col?.key ?? col?.dataIndex
  if (key != null && key !== '') {
    return Array.isArray(key) ? key.join('-') : String(key)
  }
  return String(columnIndex)
}

/**
 * 按当前列定义中「规范化后的右侧固定列」顺序写入 order，用于覆盖 localStorage 里错误的相对顺序。
 * ProTable 合并规则为 merge(defaultValue, storage)，storage 会盖住 default，故必须在持久化层纠偏。
 */
export function buildFixedRightColumnOrderOverlay(
  columns: any[]
): Record<string, { order: number }> {
  if (!columns?.length) return {}
  const normalized = normalizeFixedRightColumnOrder(columns)
  const out: Record<string, { order: number }> = {}
  let o = 1_000_000
  for (let i = 0; i < normalized.length; i++) {
    const col = normalized[i]
    if (col?.fixed !== 'right') continue
    const k = getProColumnStateKey(col, i)
    out[k] = { order: o++ }
  }
  return out
}

/**
 * ProTable：若存在 columnsState.defaultValue，会用它整段替代「从 columns 推导的 defaultColumnKeyMap」，
 * 故必须给出**完整**列 key 映射，再为右侧固定列写入递增 order（生命周期在操作列左侧）。
 */
export function buildDefaultColumnsStateMap(columns: any[]): Record<string, any> {
  const map: Record<string, any> = {}
  columns.forEach((col: any, index: number) => {
    const columnKey = getProColumnStateKey(col, index)
    map[columnKey] = {
      show: true,
      fixed: col.fixed,
      disable: col.disable,
    }
  })
  let order = 900_000
  columns.forEach((col: any, index: number) => {
    if (col?.fixed !== 'right') return
    const columnKey = getProColumnStateKey(col, index)
    map[columnKey] = {
      ...map[columnKey],
      order: order++,
      fixed: 'right',
      show: true,
    }
  })
  return map
}

/** 列展示重置按钮：同时恢复列显示和列宽到系统默认（需在 ProTable 内部渲染以访问 TableContext） */
