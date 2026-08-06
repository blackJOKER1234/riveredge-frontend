/** 行点击切换勾选：命中可操作子元素时不切换，避免误选（成本仅一次 DOM closest） */
export function shouldIgnoreRowClickForSelection(target: Element): boolean {
  return !!target.closest(
    [
      'a',
      'button',
      'input',
      'textarea',
      'select',
      'label',
      '[contenteditable="true"]',
      '[role="button"]',
      '[role="menuitemcheckbox"]',
      '[role="switch"]',
      '.ant-checkbox',
      '.ant-radio',
      '.ant-select',
      '.ant-picker',
      '.ant-btn',
      '.ant-switch',
      '.ant-table-selection-column',
      '.ant-table-row-expand-icon',
      '.ant-slider',
      '.ant-rate',
      '.ant-typography-copy',
    ].join(',')
  )
}
