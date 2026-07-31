import React from 'react';
import { Spin, Button, Tooltip, Badge, Avatar, Dropdown, Space, Typography, Empty } from 'antd';
import { BellOutlined, RightOutlined } from '@ant-design/icons';
import type { NavigateFunction } from 'react-router-dom';
import { markMessagesRead, type UserMessage } from '../../services/userMessage';
import { formatDateTime } from '../../utils/format';

export interface NotificationDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recentMessages: { items?: UserMessage[] } | undefined | null;
  loading: boolean;
  unreadCount: number;
  refetchRecentMessages: () => void;
  refetchMessageStats: () => void;
  token: any;
  t: (key: string, options?: any) => any;
  navigate: NavigateFunction;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  open,
  onOpenChange,
  recentMessages,
  loading,
  unreadCount,
  refetchRecentMessages,
  refetchMessageStats,
  token,
  t,
  navigate,
}) => {
  return (
    <Dropdown
      key="notifications"
      placement="bottomRight"
      trigger={['click']}
      arrow={false}
      classNames={{ root: 'header-actions-dropdown' }}
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (nextOpen) {
          refetchRecentMessages();
          refetchMessageStats();
        }
      }}
      popupRender={() => {
        const messages = recentMessages?.items || [];
        const isUnread = (msg: UserMessage) =>
          msg.status === 'pending' || msg.status === 'sending' || msg.status === 'success';

        return (
          <div
            style={{
              width: 400,
              maxHeight: 500,
              backgroundColor: token.colorBgElevated,
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadowSecondary,
              overflow: 'hidden',
            }}
          >
            {/* 标题栏 */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${token.colorBorder}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Space size={8} align="center">
                <Typography.Text strong style={{ fontSize: 16 }}>
                  {t('ui.message.notification')}
                </Typography.Text>
                {unreadCount > 0 && (
                  <Badge
                    count={unreadCount}
                    size="small"
                  />
                )}
              </Space>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  onOpenChange(false);
                  navigate('/personal/messages');
                }}
              >
                {t('pages.dashboard.viewAll')} <RightOutlined />
              </Button>
            </div>

            {/* 消息列表 */}
            <div
              style={{
                maxHeight: 400,
                overflowY: 'auto',
              }}
            >
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <Spin />
                </div>
              ) : messages.length > 0 ? (
                <div>
                  {messages.map((item: UserMessage) => {
                    const unread = isUnread(item);
                    return (
                      <div
                        key={item.uuid}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          backgroundColor: unread ? token.colorFillAlter : 'transparent',
                          borderBottom: `1px solid ${token.colorBorderSecondary}`,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                        }}
                        onClick={async () => {
                          onOpenChange(false);
                          navigate('/personal/messages');
                          if (unread) {
                            try {
                              await markMessagesRead({
                                message_uuids: [item.uuid],
                              });
                              refetchMessageStats();
                              refetchRecentMessages();
                            } catch (error) {
                              // 静默失败
                            }
                          }
                        }}
                      >
                        <Badge dot={unread}>
                          <Avatar
                            size={40}
                            style={{
                              backgroundColor: unread ? token.colorPrimary : token.colorFillTertiary,
                            }}
                            icon={<BellOutlined />}
                          />
                        </Badge>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Typography.Text strong={unread} ellipsis style={{ maxWidth: 250 }}>
                            {item.subject || t('common.noSubject')}
                          </Typography.Text>
                          <Typography.Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{
                              marginBottom: 4,
                              marginTop: 2,
                              fontSize: 12,
                              color: token.colorTextSecondary,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {item.content}
                          </Typography.Paragraph>
                          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                            {item.sent_at
                              ? formatDateTime(item.sent_at, 'YYYY-MM-DD HH:mm')
                              : formatDateTime(item.created_at, 'YYYY-MM-DD HH:mm')}
                          </Typography.Text>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty
                  description={t('common.noMessages')}
                  style={{ padding: '40px 0' }}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </div>
        );
      }}
    >
      <Tooltip title={t('ui.message.notification')} open={open ? false : undefined}>
        <Button
          type="text"
          size="small"
          icon={<BellOutlined />}
          className={
            unreadCount > 0
              ? 'riveredge-header-notification-bell riveredge-header-notification-btn--has-count'
              : 'riveredge-header-notification-bell'
          }
          {...(unreadCount > 0
            ? {
                'data-unread-count': unreadCount > 99 ? '99+' : String(unreadCount),
              }
            : {})}
          onClick={() => {
                    onOpenChange(!open);
                  }}
        />
      </Tooltip>
    </Dropdown>

  );
};

export default NotificationDropdown;
