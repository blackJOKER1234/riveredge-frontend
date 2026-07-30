import { useTheme } from "../../../core";
import type { ReactNode } from "react";

export interface BreadcrumbItemType {
  // id: string;
  key: string;
  href: string;
  title: string | ReactNode;
  onClick: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItemType[];
  CollapsedIcon: () => ReactNode;
}

function Breadcrumb({ items, CollapsedIcon }: BreadcrumbProps) {
  const { colorBodyText, colorBgDisabledButton } = useTheme();

  return (
    <div className="flex items-center">
      <CollapsedIcon />
      {/* <SvgIcon icon="Halo-shouye" className="pr-1" size={16} /> */}
      <div
        style={{
          color: colorBgDisabledButton,
        }}
      >
        当前位置：
      </div>
      <div className="flex items-center">
        {items.map((item, index) => (
          <div
            key={item.key}
            style={{
              color:
                index === items.length - 1
                  ? colorBodyText
                  : colorBgDisabledButton,
            }}
          >
            <span>{item.title}</span>
            {index < items.length - 1 && <span className="px-2">/</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export { Breadcrumb };

export default Breadcrumb;
