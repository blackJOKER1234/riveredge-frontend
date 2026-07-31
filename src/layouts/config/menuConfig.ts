import type { MenuDataItem } from '@ant-design/pro-components';
import { getMenuIcon } from '../utils/menuIcons';

/**
 * 平台级 + 系统级菜单配置（原有写法，硬编号）
 * 仅应用级 APP 使用数据库统一源（manifest 同步 → core_menus）
 */
export type PermissionMenuDataItem = MenuDataItem & {
  permissionCodes?: string[];
};

export const getMenuConfig = (t: (key: string) => string): PermissionMenuDataItem[] => [
  {
    path: '/system/dashboard',
    name: t('menu.dashboard'),
    icon: getMenuIcon(t('menu.dashboard'), '/system/dashboard'),
    permissionCodes: ['system:application:read', 'system:menu:read'],
    children: [
      {
        path: '/system/dashboard/workplace',
        name: t('menu.dashboard.workplace'),
        icon: getMenuIcon(t('menu.dashboard.workplace'), '/system/dashboard/workplace'),
        permissionCodes: ['system:application:read', 'system:menu:read'],
      },
      {
        path: '/system/dashboard/analysis',
        name: t('menu.dashboard.analysis'),
        icon: getMenuIcon(t('menu.dashboard.analysis'), '/system/dashboard/analysis'),
        permissionCodes: ['system:application:read', 'system:menu:read'],
      },
    ],
  },
  {
    path: '/system',
    name: t('menu.system'),
    icon: getMenuIcon(t('menu.system'), '/system'),
    permissionCodes: [
      'system:application:read',
      'system:menu:read',
      'system:site-setting:read',
      'system:config-center:read',
      'system:data-dictionary:read',
      'system:language:read',
      'system:code-rule:read',
      'system:custom-field:read',
      'system:department:read',
      'system:position:read',
      'system:role:read',
      'system:user:read',
      'system:file:read',
      'system:api:read',
      'system:data-source:read',
      'system:application-connection:read',
      'system:dataset:read',
      'system:approval-process:read',
      'system:approval-instance:read',
      'system:message-template:read',
      'system:message-config:read',
      'system:print-device:read',
      'system:print-template:read',
      'system:operation-log:read',
      'system:login-log:read',
      'system:online-user:read',
      'system:data-backup:read',
      'kuaizhizao:warehouse-management-initial-data:read',
      'system:user-profile:read',
      'system:user-preference:read',
      'system:user-message:read',
      'system:user-task:read',
    ],
    children: [
      { key: 'core-config-group', type: 'group', name: t('menu.group.core-config'), label: t('menu.group.core-config'), className: 'riveredge-menu-group-title', children: [
        { path: '/system/applications', name: t('menu.system.applications'), icon: getMenuIcon(t('menu.system.applications'), '/system/applications'), permissionCodes: ['system:application:create', 'system:application:read', 'system:application:update', 'system:application:delete'] },
        { path: '/system/menus', name: t('menu.system.menus'), icon: getMenuIcon(t('menu.system.menus'), '/system/menus'), permissionCodes: ['system:menu:create', 'system:menu:read', 'system:menu:update', 'system:menu:delete'] },
        { path: '/system/site-settings', name: t('menu.system.site-settings'), icon: getMenuIcon(t('menu.system.site-settings'), '/system/site-settings'), permissionCodes: ['system:site-setting:read', 'system:site-setting:update'] },
        { path: '/system/config-center', name: t('menu.system.business-config'), icon: getMenuIcon(t('menu.system.business-config'), '/system/config-center'), permissionCodes: ['system:config-center:read', 'system:config-center:update'] },
        { path: '/system/data-dictionaries', name: t('menu.system.data-dictionaries'), icon: getMenuIcon(t('menu.system.data-dictionaries'), '/system/data-dictionaries'), permissionCodes: ['system:data-dictionary:create', 'system:data-dictionary:read', 'system:data-dictionary:update', 'system:data-dictionary:delete'] },
        { path: '/system/languages', name: t('menu.system.languages'), icon: getMenuIcon(t('menu.system.languages'), '/system/languages'), permissionCodes: ['system:language:create', 'system:language:read', 'system:language:update', 'system:language:delete'] },
        { path: '/system/code-rules', name: t('menu.system.code-rules'), icon: getMenuIcon(t('menu.system.code-rules'), '/system/code-rules'), permissionCodes: ['system:code-rule:create', 'system:code-rule:read', 'system:code-rule:update', 'system:code-rule:delete'] },
        { path: '/system/custom-fields', name: t('menu.system.custom-fields'), icon: getMenuIcon(t('menu.system.custom-fields'), '/system/custom-fields'), permissionCodes: ['system:custom-field:create', 'system:custom-field:read', 'system:custom-field:update', 'system:custom-field:delete'] },
        { path: '/system/onboarding-wizard', name: t('menu.system.onboarding-wizard'), icon: getMenuIcon(t('menu.system.onboarding-wizard'), '/system/onboarding-wizard'), permissionCodes: ['system:onboarding-wizard:read', 'system:onboarding-wizard:update'] },
      ]},
      { key: 'user-management-group', type: 'group', name: t('menu.group.user-management'), label: t('menu.group.user-management'), className: 'riveredge-menu-group-title', children: [
        { path: '/system/departments', name: t('menu.system.departments'), icon: getMenuIcon(t('menu.system.departments'), '/system/departments'), permissionCodes: ['system:department:create', 'system:department:read', 'system:department:update', 'system:department:delete', 'system:department:import', 'system:department:export'] },
        { path: '/system/positions', name: t('menu.system.positions'), icon: getMenuIcon(t('menu.system.positions'), '/system/positions'), permissionCodes: ['system:position:create', 'system:position:read', 'system:position:update', 'system:position:delete', 'system:position:import', 'system:position:export'] },
        { path: '/system/roles', name: t('menu.system.roles-permissions'), icon: getMenuIcon(t('menu.system.roles-permissions'), '/system/roles'), permissionCodes: ['system:role:create', 'system:role:read', 'system:role:update', 'system:role:delete', 'system:role:assign', 'system:role:import', 'system:role:export'] },
        { path: '/system/users', name: t('menu.system.users'), icon: getMenuIcon(t('menu.system.users'), '/system/users'), permissionCodes: ['system:user:create', 'system:user:read', 'system:user:update', 'system:user:delete', 'system:user:import', 'system:user:export'] },
      ]},
      { key: 'data-center-group', type: 'group', name: t('menu.group.data-center'), label: t('menu.group.data-center'), className: 'riveredge-menu-group-title', children: [
        {
          path: '/system/initial-data',
          name: t('menu.system.initial-data'),
          icon: getMenuIcon(t('menu.system.initial-data'), '/system/initial-data'),
          permissionCodes: ['kuaizhizao:warehouse-management-initial-data:read'],
        },
        { path: '/system/files', name: t('menu.system.files'), icon: getMenuIcon(t('menu.system.files'), '/system/files'), permissionCodes: ['system:file:create', 'system:file:read', 'system:file:update', 'system:file:delete', 'system:file:export'] },
        { path: '/system/apis', name: t('menu.system.apis'), icon: getMenuIcon(t('menu.system.apis'), '/system/apis'), permissionCodes: ['system:api:create', 'system:api:read', 'system:api:update', 'system:api:delete'] },
        { path: '/system/data-sources', name: t('menu.system.data-sources'), icon: getMenuIcon(t('menu.system.data-sources'), '/system/data-sources'), permissionCodes: ['system:data-source:create', 'system:data-source:read', 'system:data-source:update', 'system:data-source:delete'] },
        { path: '/system/application-connections', name: t('menu.system.application-connections'), icon: getMenuIcon(t('menu.system.application-connections'), '/system/application-connections'), permissionCodes: ['system:application-connection:create', 'system:application-connection:read', 'system:application-connection:update', 'system:application-connection:delete'] },
        { path: '/system/datasets', name: t('menu.system.datasets'), icon: getMenuIcon(t('menu.system.datasets'), '/system/datasets'), permissionCodes: ['system:dataset:create', 'system:dataset:read', 'system:dataset:update', 'system:dataset:delete'] },
      ]},
      { key: 'process-management-group', type: 'group', name: t('menu.group.process-management'), label: t('menu.group.process-management'), className: 'riveredge-menu-group-title', children: [
        { path: '/system/approval-processes', name: t('menu.system.approval-processes'), icon: getMenuIcon(t('menu.system.approval-processes'), '/system/approval-processes'), permissionCodes: ['system:approval-process:create', 'system:approval-process:read', 'system:approval-process:update', 'system:approval-process:delete'], children: [{ path: '/system/approval-processes/designer', name: t('path.system.approval-processes.designer'), hideInMenu: true, permissionCodes: ['system:approval-process:update'] }] },
        { path: '/system/messages/template', name: t('menu.system.messages.template'), icon: getMenuIcon(t('menu.system.messages.template'), '/system/messages/template'), permissionCodes: ['system:message-template:create', 'system:message-template:read', 'system:message-template:update', 'system:message-template:delete'] },
        { path: '/system/print-templates', name: t('menu.system.print-templates'), icon: getMenuIcon(t('menu.system.print-templates'), '/system/print-templates'), permissionCodes: ['system:print-template:create', 'system:print-template:read', 'system:print-template:update', 'system:print-template:delete'], children: [{ path: '/system/print-templates/design', name: t('path.system.print-templates.design'), hideInMenu: true, permissionCodes: ['system:print-template:update'] }] },
        { path: '/system/approval-instances', name: t('menu.system.approval-instances'), icon: getMenuIcon(t('menu.system.approval-instances'), '/system/approval-instances'), permissionCodes: ['system:approval-instance:read', 'system:approval-instance:update'] },
        { path: '/system/messages/config', name: t('menu.system.messages.config'), icon: getMenuIcon(t('menu.system.messages.config'), '/system/messages/config'), permissionCodes: ['system:message-config:create', 'system:message-config:read', 'system:message-config:update', 'system:message-config:delete'] },
        { path: '/system/print-devices', name: t('menu.system.print-devices'), icon: getMenuIcon(t('menu.system.print-devices'), '/system/print-devices'), permissionCodes: ['system:print-device:create', 'system:print-device:read', 'system:print-device:update', 'system:print-device:delete'] },
      ]},
      { key: 'monitoring-ops-group', type: 'group', name: t('menu.group.monitoring-ops'), label: t('menu.group.monitoring-ops'), className: 'riveredge-menu-group-title', children: [
        { path: '/system/operation-logs', name: t('menu.system.operation-logs'), icon: getMenuIcon(t('menu.system.operation-logs'), '/system/operation-logs'), permissionCodes: ['system:operation-log:read'] },
        { path: '/system/login-logs', name: t('menu.system.login-logs'), icon: getMenuIcon(t('menu.system.login-logs'), '/system/login-logs'), permissionCodes: ['system:login-log:read'] },
        { path: '/system/online-users', name: t('menu.system.online-users'), icon: getMenuIcon(t('menu.system.online-users'), '/system/online-users'), permissionCodes: ['system:online-user:read'] },
        { path: '/system/data-backups', name: t('menu.system.data-backups'), icon: getMenuIcon(t('menu.system.data-backups'), '/system/data-backups'), permissionCodes: ['system:data-backup:read'] },
      ]},
      { key: 'personal-center-group', type: 'group', name: t('menu.personal'), label: t('menu.personal'), className: 'riveredge-menu-group-title', children: [
        {
          path: '/personal/profile',
          name: t('menu.personal.profile'),
          icon: getMenuIcon(t('menu.personal.profile'), '/personal/profile'),
          permissionCodes: ['system:user-profile:read', 'system:user-profile:update'],
        },
        {
          path: '/personal/preferences',
          name: t('menu.personal.preferences'),
          icon: getMenuIcon(t('menu.personal.preferences'), '/personal/preferences'),
          permissionCodes: ['system:user-preference:read', 'system:user-preference:update'],
        },
        {
          path: '/personal/messages',
          name: t('menu.personal.messages'),
          icon: getMenuIcon(t('menu.personal.messages'), '/personal/messages'),
          permissionCodes: ['system:user-message:read', 'system:user-message:update'],
        },
        {
          path: '/personal/tasks',
          name: t('menu.personal.tasks'),
          icon: getMenuIcon(t('menu.personal.tasks'), '/personal/tasks'),
          permissionCodes: ['system:user-task:read', 'system:user-task:update'],
        },
      ]},
    ],
  },
  {
    name: t('menu.infra'),
    icon: getMenuIcon(t('menu.infra'), '/infra/operation'),
    children: [
      { path: '/infra/operation', name: t('menu.infra.operation'), icon: getMenuIcon(t('menu.infra.operation'), '/infra/operation') },
      { path: '/infra/admin', name: t('menu.infra.admin'), icon: getMenuIcon(t('menu.infra.admin'), '/infra/admin') },
      { path: '/infra/tenants', name: t('menu.infra.tenants'), icon: getMenuIcon(t('menu.infra.tenants'), '/infra/tenants') },
      { path: '/infra/packages', name: t('menu.infra.packages'), icon: getMenuIcon(t('menu.infra.packages'), '/infra/packages') },
      { path: '/infra/scripts', name: t('menu.infra.scripts'), icon: getMenuIcon(t('menu.infra.scripts'), '/infra/scripts') },
      { path: '/infra/scheduled-tasks', name: t('menu.infra.scheduled-tasks'), icon: getMenuIcon(t('menu.infra.scheduled-tasks'), '/infra/scheduled-tasks') },
      { path: '/infra/client-releases', name: t('menu.infra.client-releases'), icon: getMenuIcon(t('menu.infra.client-releases'), '/infra/client-releases') },
    ],
  },
];
