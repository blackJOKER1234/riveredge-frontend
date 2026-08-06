import { useEffect, useRef } from 'react';
import type { QueryClient } from '@tanstack/react-query';

export function useMenuInvalidationOnAuthChange(options: {
  currentUserId?: number;
  currentTenantId?: number;
  queryClient: QueryClient;
}) {
  const { currentUserId, currentTenantId, queryClient } = options;

  // 用户登录后清除菜单缓存（invalidate 会自动触发 refetch，避免重复调用导致竞态）
  const prevUserIdRef = useRef<number | undefined>();
  useEffect(() => {
    const userId = currentUserId;
    const justLoggedIn = userId !== undefined && prevUserIdRef.current === undefined;
    prevUserIdRef.current = userId;
    if (!justLoggedIn) return;
    queryClient.invalidateQueries({ queryKey: ['navigationMenuTree'] });
    queryClient.invalidateQueries({ queryKey: ['applicationMenus'] });
  }, [currentUserId, queryClient]);

  // 监听租户ID变化，刷新菜单（invalidate 会自动触发 refetch）
  const prevTenantIdRef = useRef<number | undefined>();
  useEffect(() => {
    const tid = currentTenantId;
    if (tid !== undefined && prevTenantIdRef.current !== undefined && prevTenantIdRef.current !== tid) {
      queryClient.invalidateQueries({ queryKey: ['navigationMenuTree'] });
      queryClient.invalidateQueries({ queryKey: ['applicationMenus'] });
    }
    prevTenantIdRef.current = tid;
  }, [currentTenantId, queryClient]);
}
