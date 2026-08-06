import { describe, expect, it } from 'vitest'
import { normalizeDashboardLayout } from './dashboardLayout'

describe('normalizeDashboardLayout', () => {
  it('保留数组格式的布局', () => {
    const layout = [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3 }]

    expect(normalizeDashboardLayout(layout)).toEqual(layout)
  })

  it('提取响应式布局对象中的 lg 布局', () => {
    const layout = [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3 }]

    expect(normalizeDashboardLayout({ lg: layout, md: [] })).toEqual(layout)
  })

  it('解析 JSON 字符串形式的布局', () => {
    const layout = [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3 }]

    expect(normalizeDashboardLayout(JSON.stringify({ lg: layout }))).toEqual(layout)
  })

  it('对无效布局返回空数组', () => {
    expect(normalizeDashboardLayout({ invalid: true })).toEqual([])
    expect(normalizeDashboardLayout('invalid-json')).toEqual([])
    expect(normalizeDashboardLayout(null)).toEqual([])
  })
})
