/**
 * 在制工序卡（工作台展示）
 */

import React, { useMemo } from 'react';
import { Card, Progress, theme } from 'antd';
import type { TFunction } from 'i18next';
import type { ProcessProgressItem } from '../../../services/dashboard';
import { getQuickEntryHeaderColors } from '../../../components/quick-entry/quickEntryGradients';
import { useThemeStore } from '../../../stores/themeStore';

function formatQty(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
type ProductionCardProps = {
  processName: string;
  plannedQuantity: number;
  progressPct: number;
  completedQuantity: number;
  qualifiedQuantity: number;
  unqualifiedQuantity: number;
  taskQtyLabel: string;
  completedQtyLabel: string;
  qualifiedQtyLabel: string;
  unqualifiedQtyLabel: string;
  accentColor: string;
};

const ProductionCard = ({
  processName,
  plannedQuantity,
  progressPct,
  completedQuantity,
  qualifiedQuantity,
  unqualifiedQuantity,
  taskQtyLabel,
  completedQtyLabel,
  qualifiedQtyLabel,
  unqualifiedQtyLabel,
  accentColor,
}: ProductionCardProps) => {
  return (
    <Card
      bordered={false}
      className="w-full rounded-3xl bg-white shadow-none"
      styles={{
        body: {
          padding: "20px 20px 20px",
        },
      }}
    >
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <div className="h-5 w-1.5 rounded-full bg-blue-500" />

        <div className="text-lg font-semibold text-gray-700">
          {processName}
        </div>
      </div>


      {/* 主数据区域 */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-[32px] font-bold leading-none text-gray-900">
            {formatQty(plannedQuantity)}
          </div>

          <div className="mt-2 text-base text-gray-400">
            {taskQtyLabel}
          </div>
        </div>


        {/* 环形进度 */}
        <Progress
          type="circle"
          percent={progressPct}
          size={70}
          strokeWidth={10}
          format={(percent) => (
            <span className="text-base text-gray-700">
              {percent}%
            </span>
          )}
          strokeColor={accentColor}
          trailColor="#edf3ff"
        />
      </div>


      {/* 分割线 */}
      <div className="my-3 h-px bg-gray-100" />


      {/* 底部统计 */}
      <div className="grid grid-cols-3">
        <div>
          <div className="text-base text-gray-400">
            {completedQtyLabel}
          </div>
          <div className="mt-1 text-xl font-semibold text-gray-900">
            {formatQty(completedQuantity)}
          </div>
        </div>


        <div>
          <div className="text-base text-gray-400">
            {qualifiedQtyLabel}
          </div>
          <div className="mt-1 text-xl font-semibold text-green-600">
            {formatQty(qualifiedQuantity)}
          </div>
        </div>


        <div>
          <div className="text-base text-gray-400">
            {unqualifiedQtyLabel}
          </div>
          <div className="mt-1 text-xl font-semibold text-red-500">
            {formatQty(unqualifiedQuantity)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export interface WipOperationCardViewProps {
  item: ProcessProgressItem;
  colorIndex: number;
  isDark?: boolean;
  t: TFunction;
  onClick?: () => void;
}

export function WipOperationCardView({
  item,
  colorIndex,
  isDark = false,
  t,
  onClick,
}: WipOperationCardViewProps) {
  const { token } = theme.useToken();
  const themeStyle = useThemeStore((s) => s.resolved.themeStyle);
  const isPlain = themeStyle === 'plain';
  const completed = item.completed_quantity ?? 0;
  const qualified = item.qualified_quantity ?? 0;
  const unqualified = item.unqualified_quantity ?? 0;
  const headerColors = useMemo(
    () =>
      getQuickEntryHeaderColors(
        colorIndex,
        isDark,
        themeStyle,
        token.colorPrimary,
        token.colorPrimaryBg,
      ),
    [colorIndex, isDark, themeStyle, token.colorPrimary, token.colorPrimaryBg],
  );
  const progressPct = Math.min(100, Math.max(0, Math.round(item.current_progress ?? 0)));

  return (
    <button
      type="button"
      className={['dashboard-wip-operation-card', isPlain ? 'dashboard-wip-operation-card--plain' : '']
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      disabled={!onClick}
    >
      <ProductionCard
        processName={item.process_name}
        plannedQuantity={item.planned_quantity}
        progressPct={progressPct}
        completedQuantity={completed}
        qualifiedQuantity={qualified}
        unqualifiedQuantity={unqualified}
        taskQtyLabel={t('pages.dashboard.wipOperationTaskQty')}
        completedQtyLabel={t('pages.dashboard.wipOperationCompletedQty')}
        qualifiedQtyLabel={t('pages.dashboard.wipOperationQualifiedQty')}
        unqualifiedQtyLabel={t('pages.dashboard.wipOperationUnqualifiedQty')}
        accentColor={headerColors.solid}
      />
      {/* <div
        className="dashboard-wip-operation-card__head"
        // style={{ background: headerColors.progressBackground }}
      >
        <div
          className="dashboard-wip-operation-card__head-fill"
          // style={{
          //   width: `${progressPct}%`,
          //   background: headerColors.solid,
          // }}
        />
        <div className="dashboard-wip-operation-card__head-content">
          <span
            className="dashboard-wip-operation-card__head-name"
            title={item.process_name}
          >
            {item.process_name}
          </span>
          <span className="dashboard-wip-operation-card__head-progress">
            {t('pages.dashboard.wipOperationCurrentProgress', { value: progressPct })}
          </span>
        </div>
      </div>

      <div className="dashboard-wip-operation-card__body">
        <div className="dashboard-wip-operation-card__main">
          <div className="dashboard-wip-operation-card__main-value">
            {formatQty(item.planned_quantity)}
          </div>
          <div className="dashboard-wip-operation-card__main-label">
            {t('pages.dashboard.wipOperationTaskQty')}
          </div>
        </div>

        <div className="dashboard-wip-operation-card__metrics">
          <div className="dashboard-wip-operation-card__metric-row">
            <span className="dashboard-wip-operation-card__metric-label">
              {t('pages.dashboard.wipOperationCompletedQty')}
            </span>
            <span className="dashboard-wip-operation-card__metric-value dashboard-wip-operation-card__metric-value--primary">
              {formatQty(completed)}
            </span>
          </div>
          <div className="dashboard-wip-operation-card__metric-row">
            <span className="dashboard-wip-operation-card__metric-label">
              {t('pages.dashboard.wipOperationQualifiedQty')}
            </span>
            <span className="dashboard-wip-operation-card__metric-value dashboard-wip-operation-card__metric-value--success">
              {formatQty(item.qualified_quantity)}
            </span>
          </div>
          <div className="dashboard-wip-operation-card__metric-row">
            <span className="dashboard-wip-operation-card__metric-label">
              {t('pages.dashboard.wipOperationUnqualifiedQty')}
            </span>
            <span className="dashboard-wip-operation-card__metric-value dashboard-wip-operation-card__metric-value--danger">
              {formatQty(item.unqualified_quantity)}
            </span>
          </div>
        </div>
      </div> */}
    </button>
  );
}

export default WipOperationCardView;
