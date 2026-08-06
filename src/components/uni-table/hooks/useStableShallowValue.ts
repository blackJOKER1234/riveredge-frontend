import { useRef } from 'react'

/**
 * 浅比较稳定引用：对象键值链未变化时复用上一次对象引用。
 * 用于避免父组件每次渲染重建 props 对象，导致 memo 子组件无效重渲染。
 */
export function useStableShallowValue<T>(value: T): T {
  const ref = useRef<T>(value)
  const prev = ref.current
  if (value === prev) return value
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    ref.current = value
    return value
  }
  const prevObj = prev as Record<string, unknown>
  const nextObj = value as Record<string, unknown>
  const prevKeys = Object.keys(prevObj)
  const nextKeys = Object.keys(nextObj)
  const same =
    prevKeys.length === nextKeys.length &&
    nextKeys.every(
      (key, index) => key === prevKeys[index] && Object.is(prevObj[key], nextObj[key])
    )
  if (same) return prev
  ref.current = value
  return value
}
