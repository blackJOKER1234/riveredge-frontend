import React from 'react'
import { Card, Descriptions, Empty, theme } from 'antd'
import { ProCard } from '@ant-design/pro-components'
import {
  AppstoreOutlined,
  BarsOutlined,
  BarChartOutlined,
  TabletOutlined,
  QuestionCircleOutlined,
  ProjectOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { ProColumns } from '@ant-design/pro-components'
import { isUniTableOperationColumn } from '../uni-action'
import type { UniTableProps } from './types'

export interface UniTableViewsProps<T extends Record<string, any>> {
  currentViewType: string
  viewTypes: string[]
  tableViewTypes?: string[]
  tableData: T[]
  ganttViewConfig?: UniTableProps<T>['ganttViewConfig']
  cardViewConfig?: UniTableProps<T>['cardViewConfig']
  kanbanViewConfig?: UniTableProps<T>['kanbanViewConfig']
  statsViewConfig?: UniTableProps<T>['statsViewConfig']
  helpViewConfig?: UniTableProps<T>['helpViewConfig']
  customViews?: UniTableProps<T>['customViews']
  touchViewConfig?: UniTableProps<T>['touchViewConfig']
}

/** 非表格视图：甘特图 / 卡片 / 看板 / 统计 / 帮助 / 自定义 / 触屏 */
export function UniTableViews<T extends Record<string, any>>({
  currentViewType,
  viewTypes,
  tableViewTypes,
  tableData,
  ganttViewConfig,
  cardViewConfig,
  kanbanViewConfig,
  statsViewConfig,
  helpViewConfig,
  customViews,
  touchViewConfig,
}: UniTableViewsProps<T>) {
  const { t } = useTranslation()
  const { token } = theme.useToken()

  return (
    <>
      {/* 甘特图视图 */}
      {currentViewType === 'gantt' && viewTypes.includes('gantt') && (
        <div style={{ padding: 0, minHeight: '400px' }}>
          {ganttViewConfig?.renderGantt ? (
            ganttViewConfig.renderGantt(tableData)
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#999',
                background: '#fafafa',
                borderRadius: '4px',
                border: '1px dashed var(--river-border-color)',
              }}
            >
              <ProjectOutlined
                style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  color: 'var(--river-border-color)',
                }}
              />
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                {t('components.uniTable.ganttViewHint')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 卡片视图 */}
      {currentViewType === 'card' && viewTypes.includes('card') && (
        <div style={{ padding: '0 0 16px 0', minHeight: '400px' }}>
          {cardViewConfig?.renderCard ? (
            tableData.length > 0 ? (
              (() => {
                const layout = cardViewConfig.layout ?? 'grid'
                const groupByField = cardViewConfig.groupByField
                if (groupByField) {
                  const groups = new Map<string, T[]>()
                  tableData.forEach(item => {
                    const key = String((item as any)[groupByField] ?? '-')
                    if (!groups.has(key)) groups.set(key, [])
                    groups.get(key)!.push(item)
                  })
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {Array.from(groups.entries()).map(([groupKey, items]) => (
                        <div key={groupKey}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              marginBottom: 12,
                              color: '#666',
                            }}
                          >
                            {groupKey}
                          </div>
                          <div
                            style={
                              layout === 'waterfall'
                                ? { columns: '300px auto', columnGap: 16 }
                                : {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: '16px',
                                  }
                            }
                          >
                            {items.map((item, index) => (
                              <div
                                key={index}
                                style={
                                  layout === 'waterfall'
                                    ? { breakInside: 'avoid' as const, marginBottom: 16 }
                                    : {}
                                }
                              >
                                {cardViewConfig!.renderCard!(item, index)}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
                return (
                  <div
                    style={
                      layout === 'waterfall'
                        ? { columns: '300px auto', columnGap: 16 }
                        : {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '16px',
                          }
                    }
                  >
                    {(() => {
                      const stackGroups = cardViewConfig.cardStackGroups ?? []
                      const renderedStackKeys = new Set<string>()
                      type CardSlot =
                        | { kind: 'item'; item: T; index: number; key: string }
                        | { kind: 'stack'; items: T[]; key: string; groupIndex: number }
                      const cardSlots: CardSlot[] = []
                      tableData.forEach((item, index) => {
                        const code = String((item as Record<string, unknown>).code ?? '')
                        const groupIndex = stackGroups.findIndex(g => g.codes.includes(code))
                        if (groupIndex >= 0) {
                          const group = stackGroups[groupIndex]
                          const stackKey = group.codes.join('|')
                          if (renderedStackKeys.has(stackKey)) return
                          renderedStackKeys.add(stackKey)
                          const items = group.codes
                            .map(c =>
                              tableData.find(
                                row => String((row as Record<string, unknown>).code ?? '') === c
                              )
                            )
                            .filter((row): row is T => Boolean(row))
                          if (items.length > 0) {
                            cardSlots.push({ kind: 'stack', items, key: stackKey, groupIndex })
                          }
                          return
                        }
                        cardSlots.push({
                          kind: 'item',
                          item,
                          index,
                          key: String((item as Record<string, unknown>).uuid ?? `row-${index}`),
                        })
                      })
                      return cardSlots.map(slot => (
                        <div
                          key={slot.key}
                          style={
                            layout === 'waterfall'
                              ? { breakInside: 'avoid' as const, marginBottom: 16 }
                              : undefined
                          }
                        >
                          {slot.kind === 'stack'
                            ? stackGroups[slot.groupIndex].renderStack(
                                slot.items,
                                cardViewConfig!.renderCard!
                              )
                            : cardViewConfig!.renderCard!(slot.item, slot.index)}
                        </div>
                      ))
                    })()}
                  </div>
                )
              })()
            ) : (
              (cardViewConfig?.emptyCard ?? (
                <Empty
                  description={t('components.uniTable.emptyCard')}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ marginTop: '60px' }}
                />
              ))
            )
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#999',
                background: '#fafafa',
                borderRadius: '4px',
                border: '1px dashed var(--river-border-color)',
              }}
            >
              <AppstoreOutlined
                style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  color: 'var(--river-border-color)',
                }}
              />
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                {t('components.uniTable.cardViewTitle')}
              </div>
              <div style={{ fontSize: '14px', color: '#999' }}>
                {t('components.uniTable.cardViewHint')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 看板视图 */}
      {currentViewType === 'kanban' && viewTypes.includes('kanban') && (
        <div style={{ minHeight: '400px' }}>
          {kanbanViewConfig?.renderCard && kanbanViewConfig.statusGroups ? (
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', minHeight: '400px' }}>
              {Object.entries(kanbanViewConfig.statusGroups).map(([status, config]) => {
                const statusData = tableData.filter(
                  item => (item as any)[kanbanViewConfig?.statusField || 'status'] === status
                )
                return (
                  <div
                    key={status}
                    style={{
                      flex: '0 0 300px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      padding: '16px',
                      background: '#fafafa',
                      minHeight: '400px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '16px',
                        paddingBottom: '12px',
                        borderBottom: '2px solid #d9d9d9',
                      }}
                    >
                      {config.title}
                      <span
                        style={{
                          marginLeft: '8px',
                          fontSize: '12px',
                          color: '#999',
                          fontWeight: 'normal',
                        }}
                      >
                        ({statusData.length})
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {statusData.map(item => kanbanViewConfig.renderCard!(item, status))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#999',
                background: '#fafafa',
                borderRadius: '4px',
                border: '1px dashed var(--river-border-color)',
              }}
            >
              <BarsOutlined
                style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  color: 'var(--river-border-color)',
                }}
              />
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                {t('components.uniTable.kanbanViewTitle')}
              </div>
              <div style={{ fontSize: '14px', color: '#999' }}>
                {t('components.uniTable.kanbanViewHint')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 统计视图 */}
      {currentViewType === 'stats' && viewTypes.includes('stats') && (
        <div style={{ minHeight: '400px' }}>
          {statsViewConfig?.metrics ? (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                {statsViewConfig.metrics.map(metric => (
                  <div
                    key={metric.key}
                    style={{
                      padding: '20px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      background: '#fff',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      {metric.label}
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}>
                      {metric.formatter
                        ? metric.formatter(metric.value(tableData))
                        : metric.value(tableData)}
                    </div>
                  </div>
                ))}
              </div>
              {statsViewConfig.charts && statsViewConfig.charts.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  {/* TODO: 实现图表渲染 */}
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#999',
                      border: '1px dashed #d9d9d9',
                      borderRadius: '4px',
                    }}
                  >
                    {t('components.uniTable.chartDeveloping')}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#999',
                background: '#fafafa',
                borderRadius: '4px',
                border: '1px dashed var(--river-border-color)',
              }}
            >
              <BarChartOutlined
                style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  color: 'var(--river-border-color)',
                }}
              />
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                {t('components.uniTable.statsViewTitle')}
              </div>
              <div style={{ fontSize: '14px', color: '#999' }}>
                {t('components.uniTable.statsViewHint')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 帮助视图 */}
      {currentViewType === 'help' && viewTypes.includes('help') && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            border: `1px solid rgba(0, 0, 0, 0.12)`,
            boxShadow: 'none',
          }}
        >
          {helpViewConfig?.content ?? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <QuestionCircleOutlined
                style={{ fontSize: '48px', marginBottom: '16px', color: '#1890ff' }}
              />
              <div style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 500 }}>
                {helpViewConfig?.title ?? t('components.uniTable.helpTitle')}
              </div>
              <div style={{ fontSize: '14px', color: '#666', maxWidth: 400, margin: '0 auto' }}>
                {t('components.uniTable.helpHint')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 自定义视图（customViews）- 与表格视图保持相同容器结构（操作按钮、导入导出等） */}
      {/* 若视图在 tableViewTypes 中，则已由 ProTable 展示，不重复渲染 */}
      {customViews?.map(
        cv =>
          currentViewType === cv.key &&
          viewTypes.includes(cv.key) &&
          !(tableViewTypes && tableViewTypes.includes(cv.key)) && (
            <div
              key={cv.key}
              className="uni-table-pro-table"
              style={{
                display: 'block',
                width: '100%',
                margin: 0,
                padding: 0,
              }}
            >
              <ProCard
                bordered
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  boxShadow:
                    '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
                  borderRadius: token.borderRadius,
                  overflow: 'visible',
                }}
                styles={{ body: { paddingLeft: 16, paddingRight: 16, paddingBottom: 16 } }}
              >
                <div style={{ minHeight: '200px' }}>{cv.render(tableData)}</div>
              </ProCard>
            </div>
          )
      )}

      {/* 触屏视图 (移动端/平板优化) */}
      {currentViewType === 'touch' && viewTypes.includes('touch') && (
        <div
          style={{
            padding: '16px',
            minHeight: '400px',
            fontSize: '16px',
          }}
        >
          {touchViewConfig?.renderCard ? (
            tableData.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {tableData.map((item, index) => (
                  <div key={index}>{touchViewConfig.renderCard!(item, index)}</div>
                ))}
              </div>
            ) : (
              <Empty
                description={t('components.uniTable.emptyData')}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ marginTop: '60px' }}
              />
            )
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#999',
                background: '#fafafa',
                borderRadius: '8px',
                border: '1px dashed var(--river-border-color)',
              }}
            >
              <TabletOutlined
                style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  color: 'var(--ant-colorTextQuaternary)',
                }}
              />
              <div style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 500 }}>
                {t('components.uniTable.touchViewTitle')}
              </div>
              <div style={{ fontSize: '14px', color: '#999' }}>
                {t('components.uniTable.touchViewHint')}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export interface UniTableMobileCardsProps<T extends Record<string, any>> {
  isMobile: boolean | undefined
  currentViewType: string
  tableViewTypes?: string[]
  tableData: T[]
  effectiveTableColumns: ProColumns<T>[]
  rowKey: string | ((record: T, index?: number) => string)
}

/** 手机端专用卡片视图：以卡片替代 ProTable 表身 */
export function UniTableMobileCards<T extends Record<string, any>>({
  isMobile,
  currentViewType,
  tableViewTypes,
  tableData,
  effectiveTableColumns,
  rowKey,
}: UniTableMobileCardsProps<T>) {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const isOperationColumn = isUniTableOperationColumn

  return (
    <>
      {/* 手机端专用卡片视图 - 自动触发 */}
      {isMobile &&
        (currentViewType === 'table' ||
          currentViewType === 'detailTable' ||
          (tableViewTypes && tableViewTypes.includes(currentViewType))) && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0 16px 0' }}
          >
            {tableData.length > 0 ? (
              tableData.map((record, index) => {
                // 找到主显示列（通常是第一列，排除索引、勾选等）
                const mainCol = effectiveTableColumns.find(
                  c => c.dataIndex && !c.hideInTable && !isUniTableOperationColumn(c)
                )
                const otherCols = effectiveTableColumns
                  .filter(
                    c =>
                      c.dataIndex &&
                      !c.hideInTable &&
                      !isUniTableOperationColumn(c) &&
                      c !== mainCol
                  )
                  .slice(0, 5)
                const opCol = effectiveTableColumns.find(c => isUniTableOperationColumn(c))

                const getVal = (col: any) => {
                  const di = col.dataIndex
                  if (!di) return null
                  const val = Array.isArray(di)
                    ? di.reduce((acc, k) => acc?.[k], record)
                    : record[di]
                  if (col.render) return col.render(val, record, index)
                  if (col.valueEnum) {
                    const enumItem = col.valueEnum[val]
                    return enumItem?.text || val
                  }
                  return val
                }

                return (
                  <Card
                    key={record[rowKey as string] || index}
                    variant="borderless"
                    styles={{ body: { padding: '16px' } }}
                    style={{
                      borderRadius: 12,
                      background: token.colorBgContainer,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      border: `1px solid ${token.colorBorderSecondary}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 600, color: token.colorText }}>
                        {mainCol ? getVal(mainCol) : `#${index + 1}`}
                      </div>
                      {opCol && <div className="uni-table-mobile-op">{getVal(opCol)}</div>}
                    </div>

                    <Descriptions
                      column={1}
                      size="small"
                      colon={false}
                      labelStyle={{ color: token.colorTextSecondary, width: 80 }}
                      contentStyle={{ color: token.colorText }}
                    >
                      {otherCols.map((col, idx) => (
                        <Descriptions.Item key={idx} label={col.title as string}>
                          {getVal(col)}
                        </Descriptions.Item>
                      ))}
                    </Descriptions>
                  </Card>
                )
              })
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
            {/* 手机端简单的分页提示 */}
            <div style={{ textAlign: 'center', padding: '16px 0', opacity: 0.5, fontSize: 12 }}>
              {t('components.uniTable.paginationTotal', {
                total: tableData.length,
                start: 1,
                end: tableData.length,
              })}
            </div>
          </div>
        )}
    </>
  )
}
