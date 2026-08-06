import { useRef } from 'react'
import { ActionType, ProFormInstance } from '@ant-design/pro-components'

// 内联的 useProTableSearch hook（简化实现）
export const useProTableSearch = () => {
  const searchParamsRef = useRef<Record<string, any> | undefined>(undefined)
  const formRef = useRef<ProFormInstance>()
  const actionRef = useRef<ActionType>()

  return {
    searchParamsRef,
    formRef,
    actionRef,
  }
}
import { useConfigStore } from '../../stores/configStore'
