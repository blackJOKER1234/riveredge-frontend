import React, { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TableContext } from '@ant-design/pro-table/es/Store/Provide'

export function withToolbarItemKeys(nodes: ReactNode[], keyPrefix: string): ReactNode[] {
  return React.Children.toArray(nodes).map((node, index) => {
    if (React.isValidElement(node) && node.key != null) {
      return node
    }
    const key = `${keyPrefix}-${index}`
    if (React.isValidElement(node)) {
      return React.cloneElement(node, { key })
    }
    return <React.Fragment key={key}>{node}</React.Fragment>
  })
}

/** 与 ProTable genColumnKey / 列设置持久化 key 一致（无 key 且无 dataIndex 时用列下标） */

export function TableColumnResetButton({ onResetResizable }: { onResetResizable: () => void }) {
  const { t } = useTranslation()
  const counter = React.useContext(TableContext)
  const { clearPersistenceStorage, setColumnsMap, defaultColumnKeyMap } = counter || {}
  const handleClick = () => {
    clearPersistenceStorage?.()
    setColumnsMap?.(defaultColumnKeyMap || {})
    onResetResizable()
  }
  return (
    <a
      onClick={handleClick}
      className="ant-pro-table-column-setting-action-rest-button"
      style={{ marginLeft: 8 }}
    >
      {t('components.uniTable.columnReset', '重置')}
    </a>
  )
}
