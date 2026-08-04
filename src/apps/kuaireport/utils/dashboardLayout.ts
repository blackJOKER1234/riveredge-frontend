import type { LayoutItem } from 'react-grid-layout'

const responsiveBreakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isLayoutItem(value: unknown): value is LayoutItem {
  return isRecord(value) && typeof value.i === 'string'
}

export function normalizeDashboardLayout(value: unknown): LayoutItem[] {
  if (typeof value === 'string') {
    try {
      return normalizeDashboardLayout(JSON.parse(value))
    } catch {
      return []
    }
  }

  if (Array.isArray(value)) {
    return value.filter(isLayoutItem)
  }

  if (!isRecord(value)) {
    return []
  }

  for (const breakpoint of responsiveBreakpoints) {
    const breakpointLayout = value[breakpoint]
    if (Array.isArray(breakpointLayout) && breakpointLayout.length > 0) {
      return normalizeDashboardLayout(breakpointLayout)
    }
  }

  const nestedLayout = value.layout ?? value.layout_config
  if (nestedLayout !== undefined) {
    return normalizeDashboardLayout(nestedLayout)
  }

  return []
}
