/**
 * UniTable 行选择域 Hook
 *
 * 从 UniTable.tsx 拆出：受控/内部选中态、批量删除清空、行选择列配置、
 * 行点击切换勾选与行编辑配置。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Key, MouseEvent, MutableRefObject } from 'react'
import type { ActionType } from '@ant-design/pro-components'
import { UNI_TABLE_SELECTION_COL_WIDTH } from '../../../utils/uniTableLayoutColumns'
import { shouldIgnoreRowClickForSelection } from '../rowClickSelection'
import { useStableShallowValue } from './useStableShallowValue'

export interface UseUniTableRowSelectionOptions<
  T extends Record<string, any> = Record<string, any>,
> {
  enableRowSelection: boolean
  onRowSelectionChange?: (selectedRowKeys: Key[]) => void
  selectedRowKeysProp?: Key[]
  rowSelectionGetCheckboxProps?: (record: T) => { disabled?: boolean }
  disableRowClickSelection?: boolean
  rowKey: string | ((record: T, index?: number) => Key)
  onDelete?: (selectedRowKeys: Key[]) => void | Promise<void>
  userRowSelection?: unknown
  userOnRow?: (record: T, index: number) => Record<string, unknown> | undefined
  enableRowEdit?: boolean
  onRowEditSave?: (key: Key, row: T) => Promise<void>
  onRowEditDelete?: (key: Key, row: T) => Promise<void>
  nativeTableActionRef: MutableRefObject<ActionType | undefined>
}

export interface UseUniTableRowSelectionResult<
  T extends Record<string, any> = Record<string, any>,
> {
  selectedRowKeys: Key[]
  clearAllRowSelection: () => void
  handleBatchDeleteConfirm: (keys: Key[]) => Promise<void>
  handleRowSelectionChange: (keys: Key[]) => void
  syncInternalSelectedRowKeys: (keys: Key[]) => void
  tableHasRowSelection: boolean
  rowClickSelectionEnabled: boolean
  memoizedRowSelection: any
  memoizedEditable: any
  mergeOnRowWithRowClickSelection: (
    record: T,
    index: number
  ) => Record<string, unknown> | undefined
}

type NormalizedUserRowSelection = ({ columnWidth?: number } & Record<string, unknown>) | undefined

/**
 * UniTable 行选择域 Hook。
 *
 * @param options - 行选择所需 props、受控态与 ProTable 原生 action ref。
 */
export function useUniTableRowSelection<
  T extends Record<string, any> = Record<string, any>,
>({
  enableRowSelection,
  onRowSelectionChange,
  selectedRowKeysProp,
  rowSelectionGetCheckboxProps,
  disableRowClickSelection = false,
  rowKey,
  onDelete,
  userRowSelection,
  userOnRow,
  enableRowEdit = false,
  onRowEditSave,
  onRowEditDelete,
  nativeTableActionRef,
}: UseUniTableRowSelectionOptions<T>): UseUniTableRowSelectionResult<T> {
  const [internalSelectedRowKeys, setInternalSelectedRowKeys] = useState<Key[]>([])
  const selectedRowKeys = selectedRowKeysProp !== undefined ? selectedRowKeysProp : internalSelectedRowKeys

  /** 受控选中态上一次同步值：只允许“首次/非空→空”时清一次 ProTable，避免空数组回写自激。 */
  const lastControlledRowKeysRef = useRef<Key[] | undefined>(undefined)
  const clearAllRowSelection = useCallback(() => {
    lastControlledRowKeysRef.current = []
    nativeTableActionRef.current?.clearSelected?.()
    setInternalSelectedRowKeys([])
    onRowSelectionChange?.([])
  }, [nativeTableActionRef, onRowSelectionChange])

  const handleBatchDeleteConfirm = useCallback(
    async (keys: Key[]) => {
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
      const prev = lastControlledRowKeysRef.current
      lastControlledRowKeysRef.current = selectedRowKeysProp
      setInternalSelectedRowKeys(prevKeys =>
        prevKeys.length === selectedRowKeysProp.length &&
        prevKeys.every((key, index) => key === selectedRowKeysProp[index])
          ? prevKeys
          : selectedRowKeysProp
      )
      if (selectedRowKeysProp.length === 0 && (prev === undefined || prev.length > 0)) {
        nativeTableActionRef.current?.clearSelected?.()
      }
    }
  }, [selectedRowKeysProp, nativeTableActionRef])

  const stableUserRowSelection = useStableShallowValue(userRowSelection)
  const normalizedUserRowSelection = useMemo<NormalizedUserRowSelection>(() => {
    if (!stableUserRowSelection || typeof stableUserRowSelection !== 'object') {
      return stableUserRowSelection as NormalizedUserRowSelection
    }
    const rowSelectionObj = stableUserRowSelection as { columnWidth?: number } & Record<string, unknown>
    if (rowSelectionObj.columnWidth != null) return rowSelectionObj
    return {
      ...rowSelectionObj,
      columnWidth: UNI_TABLE_SELECTION_COL_WIDTH,
    }
  }, [stableUserRowSelection])

  const handleRowSelectionChange = useCallback(
    (keys: Key[]) => {
      setInternalSelectedRowKeys(prev =>
        prev.length === keys.length && prev.every((key, index) => key === keys[index])
          ? prev
          : keys
      )
      onRowSelectionChange?.(keys)
    },
    [onRowSelectionChange]
  )

  const syncInternalSelectedRowKeys = useCallback(
    (keys: Key[]) => {
      if (selectedRowKeysProp !== undefined) return
      setInternalSelectedRowKeys(prev =>
        prev.length === keys.length && prev.every((key, index) => key === keys[index])
          ? prev
          : keys
      )
    },
    [selectedRowKeysProp]
  )

  const memoizedRowSelection = useMemo(
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

  const memoizedEditable = useMemo(
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

  const tableHasRowSelection = enableRowSelection || !!normalizedUserRowSelection
  const rowClickSelectionEnabled =
    !disableRowClickSelection && tableHasRowSelection && !!memoizedRowSelection

  const getEffectiveSelectedRowKeys = useCallback((): Key[] => {
    const fromRowSelection = memoizedRowSelection?.selectedRowKeys
    if (Array.isArray(fromRowSelection)) return fromRowSelection as Key[]
    return selectedRowKeys
  }, [memoizedRowSelection, selectedRowKeys])

  const notifyRowSelectionChange = useCallback(
    (nextKeys: Key[]) => {
      const rsOnChange = memoizedRowSelection?.onChange as
        | ((keys: Key[], selectedRows: T[], info: { type: string }) => void)
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
      const base = typeof userOnRow === 'function' ? (userOnRow(record, index) ?? {}) : {}
      if (!rowClickSelectionEnabled) return Object.keys(base).length > 0 ? base : undefined

      return {
        ...base,
        onClick: (e: MouseEvent<HTMLElement>) => {
          const el = e.target
          if (!(el instanceof Element)) return
          if (shouldIgnoreRowClickForSelection(el)) return
          ;(base as { onClick?: (ev: MouseEvent<HTMLElement>) => void }).onClick?.(e)
          if (e.defaultPrevented) return

          const recordKey =
            typeof rowKey === 'function'
              ? (rowKey as (r: T, i?: number) => Key)(record, index)
              : ((record as Record<string, unknown>)[rowKey as string] as Key)
          if (recordKey === undefined || recordKey === null) return

          if (rowSelectionGetCheckboxProps) {
            const p = rowSelectionGetCheckboxProps(record)
            if (p?.disabled) return
          }

          const key = recordKey as Key
          const currentKeys = getEffectiveSelectedRowKeys()
          const selectionType = memoizedRowSelection?.type === 'radio' ? 'radio' : 'checkbox'
          let next: Key[]
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
      userOnRow,
      rowClickSelectionEnabled,
      rowKey,
      rowSelectionGetCheckboxProps,
      getEffectiveSelectedRowKeys,
      memoizedRowSelection?.type,
      notifyRowSelectionChange,
    ]
  )

  return {
    selectedRowKeys,
    clearAllRowSelection,
    handleBatchDeleteConfirm,
    handleRowSelectionChange,
    syncInternalSelectedRowKeys,
    tableHasRowSelection,
    rowClickSelectionEnabled,
    memoizedRowSelection,
    memoizedEditable,
    mergeOnRowWithRowClickSelection,
  }
}
