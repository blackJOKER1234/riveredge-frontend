import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MenuDataItem } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { Icon as IconifyIcon } from '@iconify/react/dist/offline';
import type { NavigateFunction } from 'react-router-dom';
import { getTenantById } from '../../services/tenant';
import { isInfraSuperAdminUser, isInfraSuperAdminFromToken } from '../../utils/auth';
import { resolveSystemPanelIconName } from '../config/systemSettingsPanel';
import {
  buildSystemSettingsGroups,
  calcSystemSettingsPanelGridColumns,
  calcSystemSettingsPanelWidth,
  resolveTenantExpiresLabel,
  resolveTenantPlanLabel,
} from '../utils/systemSettingsGroups';

export function useSystemSettingsPanelController(options: {
  filteredMenuData: MenuDataItem[];
  currentUser: any;
  navigate: NavigateFunction;
  pathname: string;
  t: (key: string, options?: any) => any;
}) {
  const { filteredMenuData, currentUser, navigate, pathname, t } = options;

  const [systemSettingsPanelMounted, setSystemSettingsPanelMounted] = useState(false);
  const [systemSettingsPanelExiting, setSystemSettingsPanelExiting] = useState(false);
  const systemSettingsPanelRef = useRef<HTMLDivElement>(null);
  const systemSettingsTriggerRef = useRef<HTMLButtonElement>(null);

  const closeSystemSettingsPanelAnimated = useCallback(() => {
    if (!systemSettingsPanelMounted || systemSettingsPanelExiting) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSystemSettingsPanelMounted(false);
      setSystemSettingsPanelExiting(false);
      return;
    }
    setSystemSettingsPanelExiting(true);
  }, [systemSettingsPanelMounted, systemSettingsPanelExiting]);

  const openSystemSettingsPanel = useCallback(() => {
    if (systemSettingsPanelExiting) return;
    setSystemSettingsPanelExiting(false);
    setSystemSettingsPanelMounted(true);
  }, [systemSettingsPanelExiting]);

  const unmountSystemSettingsPanel = useCallback(() => {
    setSystemSettingsPanelExiting(false);
    setSystemSettingsPanelMounted(false);
  }, []);

  const handleSystemSettingsPanelAnimationEnd = useCallback((e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.animationName !== 'riveredgeSystemPanelOut') return;
    setSystemSettingsPanelMounted(false);
    setSystemSettingsPanelExiting(false);
  }, []);

  const systemMenuEntry = useMemo(
    () => filteredMenuData.find((item) => item.path === '/system'),
    [filteredMenuData],
  );

  const systemSettingsGroups = useMemo(
    () => buildSystemSettingsGroups(systemMenuEntry),
    [systemMenuEntry],
  );

  const systemSettingsPanelGridColumns = useMemo(
    () => calcSystemSettingsPanelGridColumns(systemSettingsGroups),
    [systemSettingsGroups],
  );

  const isInfraSuperAdmin = isInfraSuperAdminUser(currentUser) || isInfraSuperAdminFromToken();

  const { data: infraTenantInfo } = useQuery({
    queryKey: ['systemPanelTenantInfo', currentUser?.tenant_id],
    queryFn: () => getTenantById(currentUser!.tenant_id!, true),
    enabled: systemSettingsPanelMounted && !!currentUser?.tenant_id && isInfraSuperAdmin,
    staleTime: 60_000,
  });

  const systemSettingsTenantPlan = infraTenantInfo?.plan ?? currentUser?.tenant_plan;
  const systemSettingsTenantExpiresAt = infraTenantInfo?.expires_at ?? currentUser?.tenant_expires_at;

  const systemSettingsPlanLabel = useMemo(
    () => resolveTenantPlanLabel(systemSettingsTenantPlan, t),
    [systemSettingsTenantPlan, t],
  );

  const systemSettingsExpiresLabel = useMemo(
    () => resolveTenantExpiresLabel(systemSettingsTenantExpiresAt),
    [systemSettingsTenantExpiresAt],
  );

  const showSystemSettingsTenantMeta = !!currentUser?.tenant_id;

  const systemSettingsPanelWidth = useMemo(
    () => calcSystemSettingsPanelWidth(systemSettingsPanelGridColumns),
    [systemSettingsPanelGridColumns],
  );

  const handleSystemSettingsNavigate = useCallback((path?: string) => {
    if (!path) return;
    unmountSystemSettingsPanel();
    if (path.startsWith('http://') || path.startsWith('https://')) {
      window.open(path, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(path);
  }, [navigate, unmountSystemSettingsPanel]);

  const getSystemPanelIcon = useCallback((path?: string): React.ReactNode => {
    return <IconifyIcon icon={resolveSystemPanelIconName(path)} />;
  }, []);

  useEffect(() => {
    unmountSystemSettingsPanel();
  }, [pathname, unmountSystemSettingsPanel]);

  useEffect(() => {
    if (!systemSettingsPanelMounted) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        systemSettingsPanelRef.current?.contains(target) ||
        systemSettingsTriggerRef.current?.contains(target)
      ) {
        return;
      }
      closeSystemSettingsPanelAnimated();
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSystemSettingsPanelAnimated();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [systemSettingsPanelMounted, closeSystemSettingsPanelAnimated]);

  return {
    systemSettingsPanelMounted,
    systemSettingsPanelExiting,
    systemSettingsPanelRef,
    systemSettingsTriggerRef,
    closeSystemSettingsPanelAnimated,
    openSystemSettingsPanel,
    unmountSystemSettingsPanel,
    handleSystemSettingsPanelAnimationEnd,
    systemMenuEntry,
    systemSettingsGroups,
    systemSettingsPanelGridColumns,
    systemSettingsPlanLabel,
    systemSettingsExpiresLabel,
    showSystemSettingsTenantMeta,
    systemSettingsPanelWidth,
    handleSystemSettingsNavigate,
    getSystemPanelIcon,
  };
}
