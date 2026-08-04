import React from 'react';
import { Avatar, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  getAvatarText,
  getAvatarFontSize,
  getTextAvatarCircleStyle,
  getImageAvatarCircleStyle,
} from '../../utils/avatar';

export interface UserAvatarDropdownProps {
  currentUser: any;
  avatarUrl?: string;
  headerTextAvatar: boolean;
  setAvatarImageFailed: (failed: boolean) => void;
  isLightModeLightBg: boolean;
  token: any;
  getUserMenuItems: (t: any) => MenuProps['items'];
  handleUserMenuClick: MenuProps['onClick'];
  t: any;
}

export const UserAvatarDropdown: React.FC<UserAvatarDropdownProps> = ({
  currentUser,
  avatarUrl,
  headerTextAvatar,
  setAvatarImageFailed,
  isLightModeLightBg,
  token,
  getUserMenuItems,
  handleUserMenuClick,
  t,
}) => {
  return (
    <Dropdown
      key="user"
      menu={{
        items: getUserMenuItems(t),
        onClick: handleUserMenuClick,
        className: 'user-avatar-dropdown-menu',
      }}
      placement="bottomRight"
    >
      <Space
        size={8}
        style={{
          cursor: 'pointer',
          padding: '0 12px 0 4px',
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '24px',
          background: isLightModeLightBg ? '#F3F5F7' : 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <Avatar
          size={32}
          src={headerTextAvatar ? undefined : avatarUrl}
          // @ts-ignore
          onError={() => setAvatarImageFailed(true)}
          style={{
            ...(headerTextAvatar
              ? getTextAvatarCircleStyle(token)
              : getImageAvatarCircleStyle()),
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: getAvatarFontSize(32),
            fontWeight: 500,
          }}
        >
          {headerTextAvatar
            ? getAvatarText(currentUser.full_name, currentUser.username)
            : null}
        </Avatar>
        <span
          style={{
            fontSize: token.fontSize,
            fontWeight: 500,
            color: isLightModeLightBg ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            lineHeight: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            maxWidth: 120, // ⚠️ 防止姓名过长挤压顶栏
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {/* 优先显示全名，如果全名为空则显示用户名，文字跟随系统 */}
          {(currentUser.full_name && currentUser.full_name.trim() !== '') ? currentUser.full_name : currentUser.username}
        </span>
      </Space>
    </Dropdown>

  );
};

export default UserAvatarDropdown;
