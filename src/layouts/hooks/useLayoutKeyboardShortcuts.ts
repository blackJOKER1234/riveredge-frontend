import { useEffect } from 'react';
import { triggerNew, hasNewHandler } from '../../utils/globalNewShortcut';
import { triggerSubmit, hasSubmitHandler } from '../../utils/globalSubmitShortcut';

export function useLayoutKeyboardShortcuts(options: {
  hasAiAssistantEntry: boolean;
  setAiAssistantOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setShortcutHelpOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}) {
  const { hasAiAssistantEntry, setAiAssistantOpen, setShortcutHelpOpen } = options;

  /**
   * 键盘快捷键：/ 聚焦侧栏搜索；Ctrl+K 同上；Alt+N 新建；Ctrl+Enter/Ctrl+S 提交弹窗；? 显示快捷键帮助
   * 使用捕获阶段并阻止默认，避免 Alt 被系统/浏览器抢走（如 Windows 菜单栏）
   */
  useEffect(() => {
    const isInputLike = (target: EventTarget | null) => {
      if (!target || !(target instanceof HTMLElement)) return false;
      const el = target as HTMLElement;
      const tag = el.tagName?.toLowerCase();
      const role = el.getAttribute?.('role');
      const editable = el.isContentEditable;
      return tag === 'input' || tag === 'textarea' || tag === 'select' || role === 'textbox' || editable;
    };

    const focusSearchInput = () => {
      const sidebarSearch = document.querySelector('.riveredge-sidebar-search-wrapper .ant-input') as HTMLInputElement;
      if (sidebarSearch) {
        sidebarSearch.focus();
        return true;
      }
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // 接管 F1 控制，开启 AI 助手（仅在 AI 应用已启用时）
      if (e.key === 'F1' && hasAiAssistantEntry) {
        e.preventDefault();
        e.stopPropagation();
        setAiAssistantOpen(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        focusSearchInput();
        return;
      }
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !isInputLike(e.target)) {
        e.preventDefault();
        focusSearchInput();
        return;
      }
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setShortcutHelpOpen((open) => !open);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (hasSubmitHandler()) {
          e.preventDefault();
          e.stopPropagation();
          triggerSubmit();
        }
        return;
      }
      if (e.ctrlKey && e.key === 'Enter') {
        if (hasSubmitHandler()) {
          e.preventDefault();
          e.stopPropagation();
          triggerSubmit();
        }
      }
      if (e.altKey && e.key.toLowerCase() === 'n') {
        if (hasNewHandler()) {
          e.preventDefault();
          e.stopPropagation();
          triggerNew();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [hasAiAssistantEntry, setAiAssistantOpen, setShortcutHelpOpen]);
}
