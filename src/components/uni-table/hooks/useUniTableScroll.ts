/**
 * UniTable 滚动策略 Hook
 *
 * 从 UniTable.tsx 拆出：scroll.y 策略、视口越界补开滚动、限高实测、
 * natural-height 样式清理与选中行底部提示定位。
 */
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { ListPageStatCardsContextValue } from '../../layout-templates/listPageStatCardsContext'
import {
  LIST_PAGE_TABLE_SCROLL,
  getViewportHeightExpr,
} from '../../layout-templates/constants'
import {
  measureTableBodyOverflowsViewport,
  shouldEnableUniTableBodyScrollY,
} from '../uniTableScrollPolicy'

export interface UseUniTableScrollOptions {
  containerRef: RefObject<HTMLDivElement | null>
  allowCustomScrollY: boolean
  restTableScrollY?: string | number
  fillViewportBody: boolean
  virtualized: boolean
  restTableVirtual: boolean
  tableData: unknown[]
  currentPageSize: number
  statCardsCtx: ListPageStatCardsContextValue | null
  currentViewType: string
  showDelayedLoading: boolean
  effectiveTableColumns: any[]
  isEmptyTable: boolean
  emptyTableHasFixedColumns: boolean
  enableRowSelection: boolean
  selectedRowKeysLength: number
  isMobile: boolean
}

export interface UseUniTableScrollResult {
  tableBodyPaneRef: RefObject<HTMLDivElement | null>
  proTableBodyScrollYEnabled: boolean
  listPageScrollY: string | number | undefined
  selectionAlertLayout: { top: number; height: number } | null
}

/**
 * UniTable 滚动策略 Hook。
 *
 * @param options - 滚动策略输入与共享容器 ref。
 */
export function useUniTableScroll({
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
  selectedRowKeysLength,
  isMobile,
}: UseUniTableScrollOptions): UseUniTableScrollResult {
  const tableBodyPaneRef = useRef<HTMLDivElement>(null)
  const tableDataLength = tableData.length
  const [viewportScrollForced, setViewportScrollForced] = useState(false)
  const [measuredTableBodyScrollY, setMeasuredTableBodyScrollY] = useState<number | null>(null)
  const [selectionAlertLayout, setSelectionAlertLayout] = useState<{
    top: number
    height: number
  } | null>(null)

  const scrollPolicyInput = useMemo(
    () => ({
      allowCustomScrollY,
      restTableScrollY,
      fillViewportBody,
      virtualized,
      restTableVirtual,
      tableDataLength,
      currentPageSize,
    }),
    [
      allowCustomScrollY,
      restTableScrollY,
      fillViewportBody,
      virtualized,
      restTableVirtual,
      tableDataLength,
      currentPageSize,
    ]
  )

  /** 策略层 scroll.y（按行数）；未装满页默认 natural-height */
  const policyScrollYEnabled = useMemo(
    () => shouldEnableUniTableBodyScrollY(scrollPolicyInput),
    [scrollPolicyInput]
  )
  /** 限高模式：容器实测的表体可用高度（px），替代视口估算避免表格越界 */
  const proTableBodyScrollYEnabled = policyScrollYEnabled || viewportScrollForced

  /** 限高模式：响应式跟随容器高度，让表体始终落在页面 padding 内 */
  useLayoutEffect(() => {
    if (!proTableBodyScrollYEnabled || virtualized || restTableVirtual) {
      setMeasuredTableBodyScrollY(null)
      return
    }
    const root = containerRef.current
    const host = tableBodyPaneRef.current
    if (!root || !host) return

    const MIN_BODY_PX = 80
    const CHROME_GAP_PX = 40
    let raf = 0
    const measure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const toolbar = host.querySelector<HTMLElement>('.ant-pro-table-list-toolbar-container')
        const header = host.querySelector<HTMLElement>('.ant-table-thead')
        const pager = host.querySelector<HTMLElement>('.ant-table-pagination')
        const chrome =
          (toolbar?.offsetHeight ?? 0) +
          (header?.offsetHeight ?? 0) +
          (pager?.offsetHeight ?? 0) +
          CHROME_GAP_PX
        const next = Math.max(MIN_BODY_PX, host.clientHeight - chrome)
        setMeasuredTableBodyScrollY(prev => (prev === next ? prev : next))
      })
    }

    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measure()) : null
    if (ro) {
      ro.observe(root)
      ro.observe(host)
      const toolbar = host.querySelector('.ant-pro-table-list-toolbar-container')
      if (toolbar) ro.observe(toolbar)
      const header = host.querySelector('.ant-table-thead')
      if (header) ro.observe(header)
      const pager = host.querySelector('.ant-table-pagination')
      if (pager) ro.observe(pager)
    }
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [
    proTableBodyScrollYEnabled,
    virtualized,
    restTableVirtual,
    tableData,
    currentViewType,
    showDelayedLoading,
    currentPageSize,
  ])

  const listPageScrollY = useMemo(() => {
    if (!proTableBodyScrollYEnabled) return undefined
    if (measuredTableBodyScrollY != null) return measuredTableBodyScrollY
    const offsetPx = statCardsCtx?.tableScrollOffsetPx
    if (offsetPx != null) {
      return getViewportHeightExpr(offsetPx, { compensateHeaderInFullscreen: true })
    }
    return `calc(100vh - var(--uni-table-scroll-offset, ${LIST_PAGE_TABLE_SCROLL.DEFAULT_FALLBACK_OFFSET_PX}px) + (${LIST_PAGE_TABLE_SCROLL.HEADER_HEIGHT_PX}px - var(--header-height, ${LIST_PAGE_TABLE_SCROLL.HEADER_HEIGHT_PX}px)))`
  }, [proTableBodyScrollYEnabled, measuredTableBodyScrollY, statCardsCtx?.tableScrollOffsetPx])

  useLayoutEffect(() => {
    if (statCardsCtx?.tableScrollOffsetPx == null) return
    window.dispatchEvent(new Event('resize'))
  }, [statCardsCtx?.tableScrollOffsetPx])

  useLayoutEffect(() => {
    if (policyScrollYEnabled) {
      setViewportScrollForced(false)
      return
    }
    if (tableDataLength === 0) {
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
  useLayoutEffect(() => {
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

  useLayoutEffect(() => {
    if (!enableRowSelection || selectedRowKeysLength === 0) return
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
  }, [enableRowSelection, selectedRowKeysLength, currentViewType, isMobile])

  return {
    tableBodyPaneRef,
    proTableBodyScrollYEnabled,
    listPageScrollY,
    selectionAlertLayout,
  }
}
