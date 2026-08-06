import React from 'react';
import type { MenuProps } from 'antd';
import { UserOutlined, DeleteOutlined, LogoutOutlined } from '@ant-design/icons';

/** 顶栏用户头像下拉菜单项（静态结构，文案由 t 注入） */
export function getUserMenuItems(t: (key: string) => string): MenuProps['items'] {
  return [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('ui.user.profile'),
    },
    // {
    //   key: 'copyright',
    //   icon: <FileTextOutlined />,
    //   label: t('ui.copyright'),
    // },
    {
      key: 'clear-menu-cache',
      icon: <DeleteOutlined />,
      label: t('ui.clearCache'),
    },
    // {
    //   key: 'lock-screen',
    //   icon: <LockOutlined />,
    //   label: t('ui.lock.screen'),
    //   onClick: handleLockScreen,
    // },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('ui.logout'),
    },
  ];
}
