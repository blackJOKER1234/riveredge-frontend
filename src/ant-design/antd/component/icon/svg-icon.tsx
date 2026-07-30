import clsx from "clsx";
import type { CSSProperties, SVGProps } from "react";

interface SvgIconProps extends SVGProps<SVGSVGElement> {
  prefix?: string;
  icon: string;
  color?: string;
  size?: string | number;
  className?: string;
  style?: CSSProperties;
}

function SvgIcon({
  icon,
  prefix = "PHM",
  size = "16px",
  className = "",
  style = {},
  onClick,
  ...prop
}: SvgIconProps) {
  const symbolId = `#${icon.startsWith(prefix) ? "" : `${prefix}-`}${icon}`;
  const svgStyle: CSSProperties = {
    verticalAlign: "middle",
    width: size,
    height: size,
    ...style,
  };

  return (
    <svg
      ref={prop.ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={clsx(
        "inline-block fill-current outline-none overflow-hidden anticon",
        className,
      )}
      style={svgStyle}
      aria-label={icon}
      onClick={onClick}
    >
      <use xlinkHref={symbolId} fill="currentColor" />
    </svg>
  );
}

export { SvgIcon };
export type { SvgIconProps };

export default SvgIcon;