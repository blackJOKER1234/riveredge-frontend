import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserMessageStats, getUserMessages } from '../../services/userMessage';

export function useHeaderMessages(currentUser: any) {
  const [messageDropdownOpen, setMessageDropdownOpen] = useState(false);

  // 获取消息统计
  const { data: messageStats, refetch: refetchMessageStats } = useQuery({
    queryKey: ['userMessageStats'],
    queryFn: () => getUserMessageStats(),
    staleTime: 30 * 1000, // 30 秒缓存
    refetchInterval: 60 * 1000, // 每分钟自动刷新
    enabled: !!currentUser, // 只在用户登录后获取
  });

  // 获取最近的消息列表（仅在下拉菜单打开时获取）
  const {
    data: recentMessages,
    isLoading: recentMessagesLoading,
    refetch: refetchRecentMessages,
  } = useQuery({
    queryKey: ['recentUserMessages'],
    queryFn: () => getUserMessages({ page: 1, page_size: 10, unread_only: false }),
    staleTime: 30 * 1000, // 30 秒缓存
    enabled: !!currentUser && messageDropdownOpen, // 只在用户登录且下拉菜单打开时获取
  });

  // 未读消息数量
  const unreadCount = messageStats?.unread || 0;

  return {
    messageDropdownOpen,
    setMessageDropdownOpen,
    messageStats,
    refetchMessageStats,
    recentMessages,
    recentMessagesLoading,
    refetchRecentMessages,
    unreadCount,
  };
}
