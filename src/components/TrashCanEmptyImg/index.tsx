import React, { useMemo } from 'react';
import { useToken } from 'antd/es/theme/internal';
import { getAsSolidColor } from 'antd/es/empty/utils';

/**
 * 垃圾桶 SVG 空状态图标
 * 使用与 Ant Design Empty 默认图标相同的主题色系，
 * 可通过 ConfigProvider empty.image 全局替换默认空状态图标。
 */
const TrashCanEmptyImg: React.FC = () => {
  const [, token] = useToken();
  const {
    colorBgContainer,
    colorFill,
    colorFillSecondary,
    colorFillTertiary,
    colorTextQuaternary,
  } = token;

  const colors = useMemo(
    () => ({
      panelBgColor: getAsSolidColor(colorFillTertiary, colorBgContainer),
      borderColor: getAsSolidColor(colorTextQuaternary, colorBgContainer),
      detailColor: getAsSolidColor(colorFill, colorBgContainer),
      shadowColor: getAsSolidColor(colorFillSecondary, colorBgContainer),
      iconColor: colorBgContainer,
    }),
    [colorBgContainer, colorFill, colorFillSecondary, colorFillTertiary, colorTextQuaternary],
  );

  const { panelBgColor, borderColor, detailColor, shadowColor, iconColor } = colors;

  return (
    <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        {/* 底部阴影 */}
        <ellipse fillOpacity=".8" fill={shadowColor} cx={92} cy={127} rx={62} ry={9} />

        {/* 桶身 */}
        <path
          d="M48 40 L136 40 L126 119 Q124 127 116 127 L68 127 Q60 127 58 119 Z"
          fill={panelBgColor}
        />
        <path
          d="M48 40 L136 40 L126 119 Q124 127 116 127 L68 127 Q60 127 58 119 Z"
          stroke={borderColor}
          strokeWidth={2}
        />

        {/* 桶盖 */}
        <path
          d="M36 25 L148 25 Q152 25 152 29 L152 40 Q152 44 148 44 L36 44 Q32 44 32 40 L32 29 Q32 25 36 25 Z"
          fill={detailColor}
        />

        {/* 桶盖提手 */}
        <path
          d="M76 25 Q76 18 84 16 L100 16 Q108 18 108 25"
          stroke={detailColor}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* 桶身横纹细节 */}
        <line x1={68} y1={61} x2={116} y2={61} stroke={detailColor} strokeWidth={3} strokeLinecap="round" />
        <line x1={66} y1={79} x2={118} y2={79} stroke={detailColor} strokeWidth={3} strokeLinecap="round" />
        <line x1={64} y1={97} x2={120} y2={97} stroke={detailColor} strokeWidth={3} strokeLinecap="round" />

        {/* 桶身回收标识小图标 */}
        <g fill={iconColor} transform="translate(84 107)">
          <path d="M0 4 L4 0 L8 4 Z" />
          <path d="M4 0 L4 8" stroke={iconColor} strokeWidth={1.5} />
        </g>
      </g>
    </svg>
  );
};

export default TrashCanEmptyImg;
