import { useTheme } from "../../../core";
import type { BaseSizeType } from "../../../types/type";
import clsx from "clsx";
import { Button as BaseButton } from "antd";
import type {
  ButtonColorType,
  ButtonProps,
  ButtonShape,
  ButtonType,
  ButtonVariantType,
} from "antd/es/button";
import { type CSSProperties, forwardRef } from "react";

type sizeMapFont = {
  size: BaseSizeType;
} & {
  style: Required<Pick<CSSProperties, "padding">> & CSSProperties;
  className?: string;
};

const sizeMap: sizeMapFont[] = [
  {
    // 大按钮
    size: "lg",
    style: {
      padding: "12px 20px",
    },
    className: "text-md rounded-[8px] !h-11",
  },
  {
    // 中按钮
    size: "md",
    style: {
      padding: "12px 20px",
    },
    className: "text-md rounded-[8px] !h-10",
  },
  {
    // 小按钮
    size: "sm",
    style: {
      padding: "8px 12px",
    },
    className: "text-sm !rounded-[4px] !h-8",
  },
  {
    size: "xs",
    style: {
      padding: "6px 10px",
    },
    className: "text-sm !rounded-[4px] !h-7",
  },
  {
    size: "xxs",
    style: {
      padding: "0px 4px",
    },
    className: "text-xs! !rounded-[4px] !h-6",
  },
];

type VariantStyleConfig = {
  className?: string;
  style?: CSSProperties;
};

export type ButtonPresetColorType =
  | "blue"
  | "purple"
  | "cyan"
  | "green"
  | "magenta"
  | "pink"
  | "red"
  | "orange"
  | "yellow"
  | "volcano"
  | "geekblue"
  | "lime"
  | "gold";

export type ButtonSimpleColorType =
  | "default"
  | "primary"
  | "danger"
  | ButtonPresetColorType;

export type myBaseButtonProps = Omit<ButtonProps, "size"> & {
  size?: BaseSizeType;
};

const getButtonFontBySize = (
  size: BaseSizeType = "md",
  shape?: ButtonShape,
) => {
  const _data = sizeMap.find((val) => val.size === size);
  if (!_data) return;
  if (shape === "circle") {
    const verticalPx = String(_data.style?.padding).split(" ")[0];
    return { ..._data, style: { ..._data.style, padding: verticalPx || "" } };
  }
  return _data;
};

const typeToVariantColorMap: Record<
  ButtonType,
  { variant: ButtonVariantType; color: ButtonSimpleColorType }
> = {
  primary: { variant: "solid", color: "primary" },
  link: { variant: "link", color: "primary" },
  default: { variant: "outlined", color: "default" },
  dashed: { variant: "dashed", color: "default" },
  text: { variant: "text", color: "default" },
};

export const Button = forwardRef<HTMLButtonElement, myBaseButtonProps>(
  (prop, ref) => {
    const baseStyleData = getButtonFontBySize(prop.size, prop.shape);
    const themeToken = useTheme();
    const resolvedFromType = prop.type
      ? typeToVariantColorMap[prop.type]
      : undefined;
    const effectiveVariant =
      prop.variant ?? resolvedFromType?.variant ?? "outlined";
    const effectiveColor = prop.color ?? resolvedFromType?.color ?? "default";

    type BaseButtonColorType = "default" | "primary" | "danger";

    const variantColorStyleMap: Record<
      ButtonVariantType,
      Record<BaseButtonColorType, VariantStyleConfig>
    > = {
      outlined: {
        default: {
          style: {
            // 去除底色
            "--ant-btn-bg-color": "transparent",
            // "--ant-btn-bg-color": themeToken.gray?.["gray 4%"],
            // "--ant-btn-bg-color-hover": themeToken.gray?.["gray 8%"],
            // "--ant-btn-bg-color-active": themeToken.gray?.["gray 12%"],
          } as any,
        },
        primary: {},
        danger: {},
      },
      solid: {
        default: {},
        primary: {},
        danger: {},
      },
      dashed: { default: {}, primary: {}, danger: {} },
      filled: {
        default: {
          style: {
            "--ant-btn-bg-color": themeToken.black?.["black 4%"],
          } as any,
        },
        primary: {
          style: {
            "--ant-btn-color-base": themeToken.gray?.["gray 88%"],
            "--ant-color-primary-bg": themeToken.black?.["black 4%"],
            "--ant-btn-bg-color-hover": themeToken.black?.["black 8%"],
            "--ant-btn-bg-color-active": themeToken.black?.["black 12%"],
          } as any,
        },
        danger: {
          style: {
            "--ant-color-error": themeToken.other?.white,
            "--ant-btn-bg-color-hover": themeToken.red?.scale.red4,
          } as any,
        },
      },
      text: {
        default: {
          style: {
            "--ant-btn-bg-color-hover": "none",
          } as any,
        },
        primary: {},
        danger: {
          style: {
            "--ant-btn-text-color": themeToken.red?.scale.red3,
            "--ant-btn-bg-color-hover": themeToken.red?.mix.red3Mix4,
            "--ant-btn-bg-color-active": themeToken.red?.mix.red3Mix8,
          } as any,
        },
      },
      link: { default: {}, primary: {}, danger: {} },
    };

    function getVariantColorStyle(
      variant: ButtonVariantType | undefined,
      color: ButtonColorType | undefined,
    ): VariantStyleConfig | undefined {
      if (!variant || !color) return undefined;
      if (color === "default" || color === "primary" || color === "danger") {
        return variantColorStyleMap[variant][color];
      }
      return undefined;
    }
    const variantStyleData = getVariantColorStyle(
      effectiveVariant,
      effectiveColor,
    );
    return (
      <BaseButton
        ref={ref}
        {...prop}
        variant={effectiveVariant}
        color={effectiveColor}
        size="middle"
        style={{
          ...baseStyleData?.style,
          ...variantStyleData?.style,
          ...prop.style,
        }}
        autoInsertSpace={prop?.autoInsertSpace ?? false}
        className={clsx(
          // styles.button,
          baseStyleData?.className,
          variantStyleData?.className,
          prop.className,
          "h-fit",
          effectiveVariant === "link" ? "p-0!" : "",
        )}
        classNames={{
          icon: "flex justify-center items-center h-full -mx-1 aspect-square",
        }}
        styles={{
          root: {
            cursor: prop.disabled ? "not-allowed" : undefined,
            borderColor:
              prop.disabled &&
              !["solid", "link"].includes(prop.type || effectiveVariant || "")
                ? themeToken.black?.["black 6%"]
                : undefined,
            backgroundColor: prop.disabled ? "transparent" : undefined,
          },
        }}
      >
        {prop.children}
      </BaseButton>
    );
  },
);

export { Button as ButtonRC };
