/**
 * UniTable 数据层 Hook
 *
 * 从 UniTable.tsx 拆出的「数据请求、搜索、缓存、分页状态、加载状态」域。
 * 已由 UniTable.tsx 接入，行为与拆分前保持一致。
 *
 * 域职责：
 * - TanStack Query 自动启用、prefetchNextPage、staleWhileRevalidate
 * - 拼音首字母前端过滤、请求竞态（requestSeqRef）
 * - 模糊搜索防抖与搜索重置
 * - 延迟 loading、卸载清理
 * - reload / reloadAndRest 的 TanStack 强刷新包装
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components'
import { isPinyinKeyword, matchPinyinInitialsAsync } from '../../../utils/pinyin'
import { stableJsonForQueryKey } from '../../../utils/tableQueryKey'
import type { UniTableProps } from '../types'

type UniTableSort = Record<string, 'ascend' | 'descend' | null>
type UniTableFilter = Record<string, Array<string | number> | null>

interface ResolvedTanstackQuery {
  queryKeyPrefix: readonly unknown[]
  staleTime: number
  gcTime: number
  prefetchNextPage: boolean
  staleWhileRevalidate: boolean
}

interface RequestRuntime<T extends Record<string, any>> {
  showLoading: boolean
  loadingDelay: number
  defaultPageSize: number
  columnsForPinyinSearch: ProColumns<T>[]
  resolvedTanstackQuery: ResolvedTanstackQuery | undefined
  skipFuzzyPinyinClientFilter: boolean
}

export interface UseUniTableDataOptions<T extends Record<string, any> = Record<string, any>> {
  queryClient: QueryClient
  request?: UniTableProps<T>['request']
  dataSource?: T[]
  showLoading?: boolean
  loadingDelay?: number
  defaultPageSize: number
  columnPersistenceId?: string
  tanstackQuery?: UniTableProps<T>['tanstackQuery']
  skipFuzzyPinyinClientFilter?: boolean
  onTableDataChange?: (data: T[]) => void
  columnsForPinyinSearch: ProColumns<T>[]
  formRef: MutableRefObject<ProFormInstance | undefined>
  searchParamsRef: MutableRefObject<Record<string, any> | undefined>
  nativeTableActionRef: MutableRefObject<ActionType | undefined>
}

export interface UseUniTableDataResult<T extends Record<string, any> = Record<string, any>> {
  tableData: T[]
  setTableData: React.Dispatch<React.SetStateAction<T[]>>
  currentPageSize: number
  showDelayedLoading: boolean
  fuzzySearchKeyword: string
  pinnedSearchUiEpoch: number
  setPinnedSearchUiEpoch: React.Dispatch<React.SetStateAction<number>>
  handleRequest: (
    params: any,
    sort: UniTableSort,
    filter: UniTableFilter
  ) => Promise<{ data?: T[]; success?: boolean; total?: number }>
  handleFuzzySearch: (value: string) => void
  handleSearchReset: () => void
  warmupPinyinIfNeeded: () => void
  dropUniTableTanstackCache: () => void
  reloadWithTanstackCacheBust: (...args: any[]) => unknown
  reloadAndRestWithTanstackCacheBust: (...args: any[]) => unknown
}

/**
 * UniTable 数据域 Hook。
 *
 * @param options - 数据请求/搜索/缓存域所需 props 与共享 refs。
 * @returns 沿用 UniTable.tsx 命名的状态与回调，供主组件接入。
 */
export function useUniTableData<T extends Record<string, any> = Record<string, any>>({
  queryClient,
  request,
  dataSource,
  showLoading = false,
  loadingDelay = 0,
  defaultPageSize,
  columnPersistenceId,
  tanstackQuery,
  skipFuzzyPinyinClientFilter = false,
  onTableDataChange,
  columnsForPinyinSearch,
  formRef,
  searchParamsRef,
  nativeTableActionRef,
}: UseUniTableDataOptions<T>): UseUniTableDataResult<T> {
  const [tableData, setTableData] = useState<T[]>([])
  const [currentPageSize, setCurrentPageSize] = useState<number>(defaultPageSize)
  const [showDelayedLoading, setShowDelayedLoading] = useState(false)
  const [fuzzySearchKeyword, setFuzzySearchKeyword] = useState('')
  const [pinnedSearchUiEpoch, setPinnedSearchUiEpoch] = useState(0)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadingDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLoadingRef = useRef(false)
  const pinyinWarmupRef = useRef(false)

  const requestRef = useRef(request)
  requestRef.current = request
  const staticDataSourceRef = useRef<T[] | undefined>(
    Array.isArray(dataSource) ? (dataSource as T[]) : undefined
  )
  staticDataSourceRef.current = Array.isArray(dataSource) ? (dataSource as T[]) : undefined
  const onTableDataChangeRef = useRef(onTableDataChange)
  onTableDataChangeRef.current = onTableDataChange

  /** 自动启用 TanStack Query：逻辑与原 UniTable.tsx 完全一致 */
  const resolvedTanstackQuery = useMemo<ResolvedTanstackQuery | undefined>(() => {
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

  const forceFreshNextRequestRef = useRef(false)
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

  const requestSeqRef = useRef(0)
  const requestRuntimeRef = useRef<RequestRuntime<T>>({
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

  const warmupPinyinIfNeeded = useCallback(() => {
    if (pinyinWarmupRef.current) return
    pinyinWarmupRef.current = true
    import('../../../utils/pinyin').then(({ preloadPinyinLib }) => {
      preloadPinyinLib().catch((err: any) => {
        console.warn('预加载拼音库失败:', err)
      })
    })
  }, [])

  /**
   * 表格数据请求（核心性能路径），与原 UniTable.tsx 实现保持一致。
   */
  const handleRequest = useCallback(
    async (params: any, sort: UniTableSort, filter: UniTableFilter) => {
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
            void queryClient.prefetchQuery({
              queryKey: [...nextKey],
              queryFn: () => (requestRef.current as any)(nextParams, sort, filter, searchFormValues),
              staleTime: staleTimeMs,
              gcTime: gcTimeMs,
            })
          }
        } else {
          result = await runRequest()
        }

        const keyword = searchFormValues?.keyword
        if (
          !liveSkipFuzzyPinyinClientFilter &&
          keyword &&
          isPinyinKeyword(keyword) &&
          result.data &&
          Array.isArray(result.data)
        ) {
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

        if (requestSeqRef.current !== seq) {
          return result
        }

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

  /** 模糊搜索：300ms 防抖后写入搜索参数并刷新 */
  const handleFuzzySearch = (value: string) => {
    setFuzzySearchKeyword(value)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (searchParamsRef.current) {
        searchParamsRef.current.keyword = value.trim() || undefined
      } else {
        searchParamsRef.current = {
          keyword: value.trim() || undefined,
        }
      }
      setPinnedSearchUiEpoch(e => e + 1)

      if (nativeTableActionRef?.current) {
        nativeTableActionRef.current.reload()
      }
    }, 300)
  }

  /** 重置模糊关键词与表单筛选条件并刷新列表 */
  const handleSearchReset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    setFuzzySearchKeyword('')
    searchParamsRef.current = undefined
    setPinnedSearchUiEpoch(e => e + 1)
    try {
      formRef.current?.resetFields?.()
    } catch {
      /* ignore */
    }
    nativeTableActionRef.current?.reload?.()
  }, [])

  /** 组件卸载时清除防抖定时器和 loading 延迟定时器 */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (loadingDelayTimerRef.current) {
        clearTimeout(loadingDelayTimerRef.current)
      }
    }
  }, [])

  return {
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
    dropUniTableTanstackCache,
    reloadWithTanstackCacheBust,
    reloadAndRestWithTanstackCacheBust,
  }
}
