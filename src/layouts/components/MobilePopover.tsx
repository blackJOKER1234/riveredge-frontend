import React, { useMemo, useState } from 'react'
import { MobileOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Popover, Spin, Typography, theme } from 'antd'
import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from 'react-i18next'

import {
  getClientDownloadQrOrigin,
  getTenantClientDownloads,
  type TenantClientDownload,
} from '../../services/clientRelease'
import { useGlobalStore } from '../../stores'
import { getTenantId } from '../../utils/auth'
import {
  isLoopbackDownloadUrl,
  isPageLoopback,
  resolvePublicDownloadUrl,
} from '../../utils/resolvePublicDownloadUrl'

const { Text } = Typography

function formatFileSize(bytes?: number | null): string {
  if (bytes == null || bytes <= 0) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface DownloadQrCardProps {
  item: TenantClientDownload
  qrOrigin?: string
  originLoading: boolean
  showName: boolean
}

const DownloadQrCard: React.FC<DownloadQrCardProps> = ({
  item,
  qrOrigin,
  originLoading,
  showName,
}) => {
  const { t } = useTranslation()
  const downloadUrl = resolvePublicDownloadUrl(item.url, qrOrigin)
  const sizeLabel = formatFileSize(item.size_bytes)
  const blocked = isPageLoopback() && !qrOrigin && !originLoading
  const showQr = !originLoading && !blocked && !isLoopbackDownloadUrl(downloadUrl)

  return (
    <div className="flex flex-col items-center px-0 pt-0 pb-0">
      {showName ? (
        <Text strong className="!text-[16px] !leading-6">
          {item.display_name}
        </Text>
      ) : null}
      <Text type="secondary" className="!text-[12px] !leading-4">
        v{item.app_version}
        {sizeLabel ? ` · ${sizeLabel}` : ''}
      </Text>

      {originLoading ? (
        <div className="flex justify-center items-center bg-[#f5f6f7] my-3 rounded-[12px] w-full h-[164px]">
          <Spin size="small" />
        </div>
      ) : blocked ? (
        <Alert
          className="my-3 w-full"
          type="warning"
          showIcon
          title={t('ui.header.clientDownload.lanOriginFailed')}
        />
      ) : showQr ? (
        <div className="flex justify-center items-center my-2 p-1 rounded-[10px] w-full min-h-[124px]">
          <QRCodeSVG value={downloadUrl} size={112} level="M" />
        </div>
      ) : (
        <Alert
          className="my-3 w-full"
          type="error"
          showIcon
          title={t('ui.header.clientDownload.loopbackBlocked')}
        />
      )}

      {showQr ? (
        <Text type="secondary" className="!text-[12px] !text-center !leading-4">
          {t('ui.header.clientDownload.subtitle')}
        </Text>
      ) : null}
    </div>
  )
}

const MobilePopover: React.FC = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const currentUser = useGlobalStore(state => state.currentUser)
  const tenantId =
    getTenantId() ?? (currentUser?.tenant_id != null ? Number(currentUser.tenant_id) : null)
  const [open, setOpen] = useState(false)
  const frontendPort =
    typeof window !== 'undefined' && window.location.port ? Number(window.location.port) : undefined

  const {
    data: downloads = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['tenantClientDownloads', tenantId],
    queryFn: getTenantClientDownloads,
    enabled: tenantId != null,
    staleTime: 60_000,
    retry: 1,
  })

  const {
    data: qrOrigin,
    isLoading: originLoading,
    refetch: refetchOrigin,
  } = useQuery({
    queryKey: ['clientDownloadQrOrigin', tenantId, frontendPort],
    queryFn: async () => {
      const origin = await getClientDownloadQrOrigin(frontendPort)
      try {
        const host = new URL(origin).hostname
        if (host && !/^(localhost|127\.0\.0\.1|::1)$/i.test(host)) {
          localStorage.setItem('client_download_public_host', host)
        }
      } catch {
        return origin
      }
      return origin
    },
    enabled: tenantId != null && open,
    staleTime: 300_000,
    retry: 1,
  })

  const visibleDownloads = useMemo(() => downloads.filter(item => Boolean(item.url)), [downloads])

  if (!tenantId || (!isLoading && visibleDownloads.length === 0)) {
    return null
  }

  const popup = (
    <div className="px-4 pt-3 pb-4 overflow-y-auto">
      <Text strong className="block !text-[18px] !text-center !leading-6">
        {t('ui.header.clientDownload.mobileTitle')}
      </Text>

      {isLoading ? (
        <div className="flex justify-center items-center">
          <Spin />
        </div>
      ) : (
        visibleDownloads.map((item) => (
          <div key={item.client_key}>
            <DownloadQrCard
              item={item}
              qrOrigin={qrOrigin}
              originLoading={originLoading}
              showName={visibleDownloads.length > 1}
            />
          </div>
        ))
      )}
    </div>
  )

  return (
    <Popover
      open={open}
      onOpenChange={nextOpen => {
        setOpen(nextOpen)
        if (nextOpen) {
          void refetch()
          void refetchOrigin()
        }
      }}
      content={popup}
      trigger="hover"
      placement="bottom"
      arrow={{ pointAtCenter: true }}
      color={token.colorBgElevated}
      zIndex={1100}
      styles={{
        root: {
          background: 'transparent',
          boxShadow: 'none',
        },
        container: {
          width: 200,
          boxSizing: 'border-box',
          padding: `${token.sizeXS}px 0 0`,
          background: token.colorBgElevated,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
        },
        content: {
          padding: 0,
          background: 'transparent',
        },
      }}
    >
      <Button
        type="text"
        size="small"
        icon={
          <svg
            width="22"
            height="22"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 2.5C14.3807 2.5 15.5 3.61929 15.5 5V15C15.5 16.3807 14.3807 17.5 13 17.5H7C5.61929 17.5 4.5 16.3807 4.5 15V5C4.5 3.61929 5.61929 2.5 7 2.5H13ZM7 3.5C6.17157 3.5 5.5 4.17157 5.5 5V15C5.5 15.8284 6.17157 16.5 7 16.5H13C13.8284 16.5 14.5 15.8284 14.5 15V5C14.5 4.17157 13.8284 3.5 13 3.5H7ZM12 13.5C12.2761 13.5 12.5 13.7239 12.5 14C12.5 14.2761 12.2761 14.5 12 14.5H8C7.72386 14.5 7.5 14.2761 7.5 14C7.5 13.7239 7.72386 13.5 8 13.5H12Z"
              fill="var(--ant-color-text)"
            />
          </svg>
        }
        aria-label={t('ui.header.clientDownload.tooltip')}
        // className={`!flex !h-11 !w-11 !items-center !justify-center !rounded-full !p-0 ${
        //   open ? '!bg-[#dedfe1]' : '!bg-[#f3f5f7] hover:!bg-[#e9edf1]'
        // } focus:!outline-none focus:!shadow-none`}
      />
    </Popover>
  )
}

export default MobilePopover
