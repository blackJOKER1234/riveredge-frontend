/**
 * UniTableImportModal
 *
 * 从 UniTable.tsx 拆出的导入弹窗：UniverJS chunk 继续懒加载，弹窗 props 集中在子组件内。
 */
import React, { lazy, memo, Suspense } from 'react'
import type { UniTableProps } from './types'

const LazyUniImport = lazy(() => import('../uni-import'))

export interface UniTableImportModalProps<
  T extends Record<string, any> = Record<string, any>,
> {
  visible: boolean
  onCancel: () => void
  onConfirm: (data: any[][]) => void
  headers?: string[]
  exampleRow?: string[]
  importFieldMap?: Record<string, string>
  enableCustomImport: boolean
  enableRelationImport: boolean
  relationImportConfig?: UniTableProps<T>['relationImportConfig']
  onRelationImportPrecheck?: UniTableProps<T>['onRelationImportPrecheck']
  onRelationImportSubmit?: UniTableProps<T>['onRelationImportSubmit']
  templateDocumentName?: string
  onImportPrecheck?: UniTableProps<T>['onImportPrecheck']
}

function UniTableImportModalInner<T extends Record<string, any> = Record<string, any>>({
  visible,
  onCancel,
  onConfirm,
  headers,
  exampleRow,
  importFieldMap,
  enableCustomImport,
  enableRelationImport,
  relationImportConfig,
  onRelationImportPrecheck,
  onRelationImportSubmit,
  templateDocumentName,
  onImportPrecheck,
}: UniTableImportModalProps<T>) {
  if (!visible) return null
  return (
    <Suspense fallback={null}>
      <LazyUniImport
        visible={visible}
        onCancel={onCancel}
        onConfirm={onConfirm}
        headers={headers}
        exampleRow={exampleRow}
        importFieldMap={importFieldMap}
        enableCustomImport={enableCustomImport}
        enableRelationImport={enableRelationImport}
        relationImportConfig={relationImportConfig}
        onRelationImportPrecheck={onRelationImportPrecheck}
        onRelationImportSubmit={onRelationImportSubmit}
        templateDocumentName={templateDocumentName}
        onImportPrecheck={onImportPrecheck}
      />
    </Suspense>
  )
}

export const UniTableImportModal = memo(
  UniTableImportModalInner
) as unknown as typeof UniTableImportModalInner
