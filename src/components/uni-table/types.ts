import type * as React from 'react'
import type { ReactNode, Key, ReactText, ComponentType, MutableRefObject } from 'react'
import type { ProColumns, ProTableProps } from '@ant-design/pro-components'

export interface UniTableProps<T extends Record<string, any> = Record<string, any>>
  extends Omit<ProTableProps<T, any>, 'request'> {
  /**
   * 数据请求函数
   * 已内置排序参数处理，直接使用即可
   *
   * @param params - 分页参数（current, pageSize）
   * @param sort - 排序参数
   * @param filter - 筛选参数
   * @param searchFormValues - 搜索表单值（从 searchParamsRef 或 formRef 获取）
   * @returns 数据响应
   */
  request: (
    params: any,
    sort: Record<string, 'ascend' | 'descend' | null>,
    filter: Record<string, React.ReactText[] | null>,
    searchFormValues?: Record<string, any>
  ) => Promise<{
    data: T[]
    success: boolean
    total: number
  }>
  /**
   * 表格列定义
   */
  columns: ProColumns<T>[]
  /**
   * 表格标题（已废弃，使用 headerActions 替代）
   * @deprecated 使用 headerActions 替代
   */
  headerTitle?: string
  /**
   * 完全自定义 **3.1 左侧功能按钮区**（若提供则不再走 `buildLeftActions` 默认拼装）。
   * uni-pull / uni-push / uni-batch 等请与此区或 `toolBarActions` / `toolBarRender` 保持一致。
   */
  headerActions?: ReactNode
  /**
   * 行主键字段名（默认：'id'）
   */
  rowKey?: string | ((record: T, index?: number) => string)
  /**
   * 是否显示基础模糊搜索框（默认：true）
   */
  showFuzzySearch?: boolean
  /**
   * 为 true 时不在前端对「全字母关键词」做拼音首字母二次过滤（适用于已在 request 内把 `keyword` 交给后端全表搜索的列表）。
   * 默认 false：保留拼音首字母与当前页数据组合的旧行为。
   */
  skipFuzzyPinyinClientFilter?: boolean
  /** 模糊搜索框占位文案（传给 UniSearch） */
  fuzzySearchPlaceholder?: string
  /**
   * 是否显示高级搜索按钮（默认：true）
   */
  showAdvancedSearch?: boolean
  /**
   * uni-search 位置：`searchRow` 为表格上方独立搜索行（默认）；`toolbarLeft` 为表格工具栏左侧（模糊/高级/重置不拆分）
   */
  searchPlacement?: 'searchRow' | 'toolbarLeft'
  /**
   * 高级搜索按钮前的自定义按钮
   */
  beforeSearchButtons?: ReactNode
  /**
   * 模糊搜索与高级搜索之间的自定义节点（典型：列表快速筛选 Segmented）
   */
  betweenFuzzyAndAdvancedButtons?: ReactNode
  /**
   * 高级搜索按钮后的自定义按钮
   */
  afterSearchButtons?: ReactNode
  /**
   * 是否启用行选择（默认：false）
   */
  enableRowSelection?: boolean
  /**
   * 行选择变化回调
   */
  onRowSelectionChange?: (selectedRowKeys: React.Key[]) => void
  /**
   * 表格当前页数据变更（含 TanStack 缓存命中路径；用于列表页同步选中行解析等副作用）
   */
  onTableDataChange?: (data: T[]) => void
  /**
   * 选中的行键数组（用于受控模式，例如在外部清除选中状态）
   */
  selectedRowKeys?: React.Key[]
  /**
   * 行选择 checkbox 的 getCheckboxProps（用于树形表禁止勾选子行等）
   */
  rowSelectionGetCheckboxProps?: (record: T) => { disabled?: boolean }
  /**
   * 关闭「点击表身切换勾选」（默认 false；仅特殊交互表需要显式关闭）
   */
  disableRowClickSelection?: boolean
  /**
   * 是否启用行编辑（默认：false）
   */
  enableRowEdit?: boolean
  /**
   * 行编辑保存回调
   */
  onRowEditSave?: (key: React.Key, row: T) => Promise<void>
  /**
   * 行编辑删除回调
   */
  onRowEditDelete?: (key: React.Key, row: T) => Promise<void>
  /**
   * **3.1 左侧**，在新建按钮之前的节点（典型：从外部单据创建入口）。
   */
  toolBarActionsBeforeCreate?: ReactNode[]
  /**
   * **3.1 左侧**，紧接在新建（含 uni-pull 入口）之后的节点（典型：`UniPushToolbarButton` / uni-push）。
   */
  toolBarActionsAfterCreate?: ReactNode[]
  /**
   * **3.1 左侧**追加的功能节点（与新建、`toolBarRender` 注入、批量删除、编辑等同一 `Space`）。
   */
  toolBarActions?: ReactNode[]
  /**
   * **3.1 左侧**，紧接在批量删除（uni-batch 删除预设）之后的节点（如下推后的说明、与删除无关的按钮）。
   */
  toolBarActionsAfterDelete?: ReactNode[]
  /**
   * **3.1 左侧**，批量功能区（uni-batch）后的通用业务动作。
   */
  toolBarActionsAfterBatch?: ReactNode[]
  /**
   * 是否显示导入按钮（默认：true）
   */
  showImportButton?: boolean
  /**
   * 导入按钮点击回调
   * @param data - 导入的数据（二维数组格式）
   */
  onImport?: (data: any[][]) => void
  /**
   * 导入入库前预检（UniImport 预览弹窗内调用；返回 errors 时禁止确认入库）
   */
  onImportPrecheck?: (data: any[][]) => Promise<{
    canImport?: boolean
    errors?: string[]
    warnings?: string[]
  } | void>
  /**
   * 导入表头（可选，如果提供则自动填充第一行）
   * 如果不提供，将自动从 columns 中提取可导入的字段生成表头
   */
  importHeaders?: string[]
  /**
   * 导入示例数据（可选，如果提供则自动填充第二行作为示例）
   * 如果不提供，将自动从 columns 中提取字段生成示例数据
   */
  importExampleRow?: string[]
  /**
   * 导入模板文件名中的单据/页面名称（默认：headerTitle 或当前路由菜单标题）
   */
  importTemplateName?: string
  /**
   * 导入字段映射配置（可选）
   * 用于将表头名称映射到字段名，如果不提供，将自动从 columns 中提取
   * 格式：{ '表头名称': '字段名' } 或 { '字段名': '表头名称' }
   */
  importFieldMap?: Record<string, string>
  /**
   * 是否启用自定义导入字段选择
   */
  enableCustomImport?: boolean
  /**
   * 是否启用高级关联导入
   */
  enableRelationImport?: boolean
  /**
   * 高级关联导入配置
   */
  relationImportConfig?: {
    entities?: Array<'material' | 'processRoute' | 'operation' | 'performance'>
    defaultWriteStrategy?: 'upsert' | 'create_only' | 'link_only' | 'strict_fail'
    supportedStrategies?: Array<'upsert' | 'create_only' | 'link_only' | 'strict_fail'>
  }
  /**
   * 高级关联导入预检
   */
  onRelationImportPrecheck?: (payload: {
    rawRows: string[][]
    entities: Array<'material' | 'processRoute' | 'operation' | 'performance'>
    writeStrategy: 'upsert' | 'create_only' | 'link_only' | 'strict_fail'
  }) => Promise<{
    success?: boolean
    message?: string
    summary?: { created?: number; updated?: number; linked?: number; failed?: number }
    errors?: string[]
    warnings?: string[]
  } | void>
  /**
   * 高级关联导入提交
   */
  onRelationImportSubmit?: (payload: {
    rawRows: string[][]
    entities: Array<'material' | 'processRoute' | 'operation' | 'performance'>
    writeStrategy: 'upsert' | 'create_only' | 'link_only' | 'strict_fail'
  }) => Promise<{
    success?: boolean
    message?: string
    summary?: { created?: number; updated?: number; linked?: number; failed?: number }
    errors?: string[]
    warnings?: string[]
  } | void>
  /**
   * 导入字段验证规则（可选）
   * 用于定义哪些字段是必填的，以及字段的验证规则
   * 格式：{ '字段名': { required: true, validator?: (value: any) => boolean } }
   */
  importFieldRules?: Record<
    string,
    { required?: boolean; validator?: (value: any) => boolean | string }
  >
  /**
   * 是否自动从 columns 生成导入配置（默认：true）
   * 如果为 true，将自动从 columns 中提取可导入的字段生成表头、示例数据和字段映射
   */
  autoGenerateImportConfig?: boolean
  /**
   * 是否显示导出按钮（默认：true）
   */
  showExportButton?: boolean
  /**
   * 导出按钮点击回调
   * @param type - 导出类型：'selected' 导出选中、'currentPage' 导出本页、'all' 导出全部
   * @param selectedRowKeys - 选中的行键数组（仅当 type 为 'selected' 时有效）
   * @param currentPageData - 当前页数据（仅当 type 为 'currentPage' 时有效）
   */
  onExport?: (
    type: 'selected' | 'currentPage' | 'all',
    selectedRowKeys?: React.Key[],
    currentPageData?: T[]
  ) => void
  /**
   * 导出按钮主文案（默认：i18n 的 components.uniTable.export）
   */
  exportButtonText?: string
  /**
   * 右侧工具栏：插入在导入/导出图标组之前的附加按钮（如自定义上传）
   */
  rightToolBarActionsBeforeExport?: ReactNode[]
  /**
   * 是否显示同步按钮（默认：false）
   * 用于从数据集同步数据，仅业务主数据/单据类页面使用
   */
  showSyncButton?: boolean
  /**
   * 同步按钮点击回调
   * 可选择数据集并从其他系统同步数据
   */
  onSync?: () => void
  /**
   * 同步按钮文案（默认：'同步'）
   */
  syncButtonText?: string
  /**
   * 是否显示「数据集」配置入口按钮（默认：false；位于同步按钮之后）
   * 右侧顺序：导入 → 导出 → **本按钮** → 同步 → 打印（与「同步」同一工具区，占同步前一位）。
   */
  showDatasetConfigButton?: boolean
  /** 「数据集」配置入口点击回调（如打开绑定数据集弹窗） */
  onDatasetConfig?: () => void
  /** 按钮文案（不传则用 i18n `components.uniTable.datasetConfig`） */
  datasetConfigButtonText?: string
  /**
   * 是否显示打印按钮（默认：false，位于右侧：导入/导出/同步/打印/表格设置）。
   */
  showPrintButton?: boolean
  /**
   * 打印按钮点击回调（默认按选中行触发；未选中或多选时按钮禁用）。
   */
  onPrint?: (selectedRowKeys: React.Key[], currentPageData?: T[]) => void
  /**
   * 打印按钮文案（不传则用 i18n `components.uniTable.print`）
   */
  printButtonText?: string
  /**
   * 功能资源前缀（app:module），用于按权限隐藏工具栏/行内按钮。
   * 不传时从当前路由在导航菜单上的 permission_code 自动解析。
   */
  permissionResource?: string
  /**
   * 与 permissionResource 配合：新建按钮接受「来源单据 :complete」或「本页 :create」。
   * 值为来源单据资源前缀（app:module）。
   */
  completeCreateSourceResource?: string
  /**
   * 是否显示新建按钮（默认：false）
   */
  showCreateButton?: boolean
  /**
   * 新建按钮点击回调
   */
  onCreate?: () => void
  /**
   * 新建按钮文案（默认：'新建'，可设为 '新建用户' 等）
   */
  createButtonText?: string
  /**
   * 是否显示修改按钮（默认：false）
   * 需要先选中一行才能点击
   */
  showEditButton?: boolean
  /**
   * 修改按钮点击回调
   * @param selectedRowKeys - 选中的行键数组
   */
  onEdit?: (selectedRowKeys: React.Key[]) => void
  /**
   * 查看详情（需选中一行，行为与「修改」一致）
   */
  onDetail?: (selectedRowKeys: React.Key[]) => void | Promise<void>
  /**
   * 详情按钮文案
   */
  detailButtonText?: string
  /**
   * 是否显示删除按钮（默认：false）
   * 需要先选中一行才能点击
   */
  showDeleteButton?: boolean
  /**
   * 删除按钮点击回调
   * @param selectedRowKeys - 选中的行键数组
   */
  onDelete?: (selectedRowKeys: React.Key[]) => void
  /**
   * 删除按钮文案（默认：'删除'，可设为 '批量删除' 等）
   */
  deleteButtonText?: string
  /**
   * 批量删除二次确认标题（与仓库管理页 Popconfirm 模式对齐，不传则用 common.confirmBatchDelete）
   */
  deleteConfirmTitle?: string | ((count: number) => string)
  /**
   * 批量删除二次确认描述（不传则用 common.confirmBatchDeleteContent）
   */
  deleteConfirmDescription?: string | ((count: number) => string)
  /**
   * 批量删除按钮禁用（如选中行均不可删）；无选中时仍由组件内部 disableWhenEmpty 处理
   */
  deleteButtonDisabled?: boolean
  /**
   * 默认分页大小（默认：20）
   */
  defaultPageSize?: number
  /**
   * 是否显示快速跳转（默认：true）
   */
  showQuickJumper?: boolean
  /**
   * 视图类型配置
   * 支持：'table' | 'detailTable' | 'help' | 'card' | 'kanban' | 'stats' | 'touch' | 'gantt'
   * 默认：['table', 'help'] - 表格视图 + 帮助视图
   */
  viewTypes?: Array<
    | 'table'
    | 'detailTable'
    | 'help'
    | 'card'
    | 'kanban'
    | 'stats'
    | 'touch'
    | 'gantt'
    | (string & {})
  >
  /**
   * 默认视图类型（默认：'table'）
   */
  defaultViewType?:
    | 'table'
    | 'detailTable'
    | 'help'
    | 'card'
    | 'kanban'
    | 'stats'
    | 'touch'
    | 'gantt'
    | (string & {})
  /**
   * 视图切换回调
   */
  onViewTypeChange?: (viewType: string) => void
  /**
   * 使用表格展示的视图类型（除 table/detailTable 外，自定义视图也可复用 ProTable 展示）
   * 例如：['productBom', 'allBom'] 时，成品BOM/全部BOM 切换时仍显示同一表格，仅数据过滤不同
   */
  tableViewTypes?: string[]
  /**
   * 帮助视图配置（仅当 viewTypes 包含 'help' 时生效）
   */
  helpViewConfig?: {
    /** 自定义帮助内容 */
    content?: ReactNode
    /** 帮助标题（默认：使用帮助） */
    title?: string
  }
  /**
   * 明细表格视图列（仅当 viewTypes 包含 'detailTable' 时生效，用于明细平铺表格）
   */
  detailTableColumns?: ProColumns<T>[]
  /**
   * 甘特图视图配置（仅当 viewTypes 包含 'gantt' 时生效）
   */
  ganttViewConfig?: {
    /** 自定义甘特图渲染 */
    renderGantt?: (data: T[]) => ReactNode
  }
  /**
   * 卡片视图配置（仅当 viewTypes 包含 'card' 时生效）
   */
  cardViewConfig?: {
    /**
     * 卡片渲染函数
     * @param item - 数据项
     * @param index - 索引
     */
    renderCard?: (item: T, index: number) => ReactNode
    /**
     * 每行卡片数量（响应式，默认：[2, 3, 4]）
     */
    columns?:
      | number
      | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number }
    /**
     * 分组字段（如按生命周期分组），分组后每组内使用瀑布流布局
     */
    groupByField?: string
    /**
     * 布局：grid 网格 | waterfall 瀑布流
     */
    layout?: 'grid' | 'waterfall'
    /**
     * 卡片视图无数据时的占位（不传则使用全局默认空状态文案）
     */
    emptyCard?: ReactNode
    /**
     * 叠放组：同一组内应用合并为一个网格位（如快制造三卡叠加）
     * codes 顺序为从后到前，末项为前景
     */
    cardStackGroups?: Array<{
      codes: string[]
      renderStack: (items: T[], renderCard: (item: T, index: number) => ReactNode) => ReactNode
    }>
  }
  /**
   * 看板视图配置（仅当 viewTypes 包含 'kanban' 时生效）
   */
  kanbanViewConfig?: {
    /**
     * 状态字段名（用于分组，默认：'status'）
     */
    statusField?: string
    /**
     * 状态分组配置
     * @example { 'pending': '待处理', 'processing': '处理中', 'completed': '已完成' }
     */
    statusGroups?: Record<string, { title: string; color?: string }>
    /**
     * 卡片渲染函数
     * @param item - 数据项
     * @param status - 状态值
     */
    renderCard?: (item: T, status: string) => ReactNode
  }
  /**
   * 统计视图配置（仅当 viewTypes 包含 'stats' 时生效）
   */
  statsViewConfig?: {
    /**
     * 统计指标配置
     */
    metrics?: Array<{
      key: string
      label: string
      value: (data: T[]) => number | string
      formatter?: (value: number | string) => string
    }>
    /**
     * 图表配置
     */
    charts?: Array<{
      type: 'bar' | 'line' | 'pie' | 'area'
      title: string
      data: (data: T[]) => any[]
      config?: any
    }>
  }
  /**
   * 自定义视图配置（用于扩展视图类型，如树形表格等）
   * 每个视图需提供 key、label、icon、render 函数
   */
  customViews?: Array<{
    key: string
    label: string
    icon: React.ComponentType<any>
    render: (data: T[]) => React.ReactNode
  }>
  /**
   * 触屏视图配置（仅当 viewTypes 包含 'touch' 时生效）
   */
  touchViewConfig?: {
    /**
     * 卡片渲染函数
     * @param item - 数据项
     * @param index - 索引
     */
    renderCard?: (item: T, index: number) => ReactNode
    /**
     * 每行卡片数量（默认：1，触屏模式通常单列显示）
     */
    columns?: number
  }
  /**
   * 延迟显示 loading 的时间（毫秒）
   * 当请求在 delay 内完成时不显示 loading，避免快速请求时的闪烁
   * 设为 0 时不延迟。仅当 showLoading 为 true 时生效
   */
  loadingDelay?: number
  /**
   * 是否显示加载动画/骨架屏（默认：false，尽量不使用以提升感知性能）
   * 为 false 时表格直接展示数据，无 loading 遮罩
   */
  showLoading?: boolean
  /**
   * 是否启用 antd Table 虚拟滚动（适合单行高大致固定、单页行数较多的列表）
   * 为 true 时若未通过 scroll 传入 y，将使用 virtualTableBodyMaxHeight
   */
  virtualized?: boolean
  /**
   * 与 virtualized 配合：未传入 scroll.y 时的表体纵向滚动高度（px）
   */
  virtualTableBodyMaxHeight?: number
  /**
   * 是否允许页面层自定义 `scroll.y`（默认 false）。
   * 为 false 时，UniTable 会忽略调用方传入的 `scroll.y`，统一使用全局动态限高策略；
   * 仅在极少数白名单页面需要特例时设为 true。
   */
  allowCustomScrollY?: boolean
  /**
   * 表体始终占满视口剩余高度（忽略「当前页未装满」时的 natural-height）。
   * UniReport 等固定布局报表页使用；须配合 ListPageTemplate `tableScrollLayout="report"`。
   */
  fillViewportBody?: boolean
  /**
   * 是否允许页面层自定义 `scroll.x`（默认 false）。
   * 为 false 时，UniTable 会忽略调用方传入的 `scroll.x`，统一使用内容自适应横向策略。
   */
  allowCustomScrollX?: boolean
  /**
   * 可选：由页面持有，与钉住条件 / 指标卡筛选共用 searchParamsRef（唯一筛选数据源）
   */
  searchParamsRef?: React.MutableRefObject<Record<string, any> | undefined>
  /**
   * 工具栏按钮尺寸（新建、删除、导入、导出、同步等）
   * middle 为 Ant Design 默认尺寸
   */
  toolBarButtonSize?: 'large' | 'middle' | 'small'
  /**
   * 用 TanStack Query 管理列表请求：相同分页+筛选在并发去重；默认实时拉数（staleTime=0）。
   * 不改变 ProTable 外观，仅替换底层请求去重（与 patch 后 debounceTime=0 配合）。
   *
   * **默认启用**：当传入稳定的 `columnPersistenceId` 时，组件会自动启用：
   * - `queryKeyPrefix = [columnPersistenceId]`
   * - `staleTime = 0`，`gcTime = 300_000`，`staleWhileRevalidate = false`
   *
   * 若需关闭：传 `tanstackQuery={{ enabled: false }}`。如需自定义则传完整对象覆盖。
   */
  tanstackQuery?: {
    /** 显式 false 可关闭自动缓存（默认启用） */
    enabled?: boolean
    queryKeyPrefix?: readonly unknown[]
    staleTime?: number
    gcTime?: number
    /**
     * 当前页数据返回后，在后台预取「下一页」同一筛选/排序条件的数据；
     * 用户翻页时优先命中 TanStack 缓存。启用拼音首字母前端过滤时不预取（避免缓存与展示不一致）。
     */
    prefetchNextPage?: boolean
    /**
     * 缓存已存在但已过期时：先同步返回旧数据（即点即显），后台 fetch 完成后 reload 刷新为新数据。
     */
    staleWhileRevalidate?: boolean
  }
  /**
   * 列展示/列宽 localStorage 的稳定 key（默认用 headerTitle，易随文案变化而漂移）。
   *
   * **命名规范**（列表页必须显式传入）：
   * - 取 `src/` 下页面文件相对路径，目录用 `.` 连接；`index.tsx` 省略文件名。
   * - 例：`pages/system/users/list/index.tsx` → `pages.system.users.list`
   * - 例：`apps.kuaizhizao.pages.sales-management.sales-orders`
   * - 同文件多表 / 多 Tab 共用一表时：第二张表用 `:2`，第三张 `:3`（见 settlement、inventory-alert）。
   * - 非 index 页面文件：保留文件名，如 `...reports.BaseReport`、`...ComputationHistoryTab`。
   */
  columnPersistenceId?: string
  /**
   * 嵌入模式（Modal / Drawer / Tab 内）：去掉 ProTable 外层卡片边框，减少嵌套视觉层级。
   */
  embedded?: boolean
  /**
   * @deprecated 历史占位；组件内不使用，仅从 props 剥离以免传入 ProTable。
   */
  searchFormItems?: unknown
}

/** @see 文件顶部 JSDoc 分层（uni-search / uni-view / uni-batch / uni-import 等） */
