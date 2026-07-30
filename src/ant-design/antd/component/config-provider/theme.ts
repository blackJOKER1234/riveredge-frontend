import type { ThemeConfig } from "antd";
import type { commonComponentTokens } from "../../../core/dts";
import { buttonToken } from "./token/button";
import { tagToken } from "./token/tag";

function buildAntdThemeConfig(
  redcoastToken: commonComponentTokens,
): ThemeConfig {
  const antdToken: ThemeConfig = {
    token: {
      colorPrimary: redcoastToken.colorPrimary,
      colorSuccess: redcoastToken.colorSuccess,
      colorInfo: redcoastToken.colorPrimary,
      colorWarning: redcoastToken.colorWarning,
      colorError: redcoastToken.colorError,
      colorText: redcoastToken.colorBodyText,
      colorTextBase: redcoastToken.colorBodyText,
      colorTextHeading: redcoastToken.text.title,
      colorTextDescription: redcoastToken.colorTipsText,
      colorTextPlaceholder: redcoastToken.colorTipsText,
      colorTextDisabled: redcoastToken.black?.["black 12%"],
      colorBgBase: redcoastToken.colorBgContainer,
      colorBgContainer: redcoastToken.colorWhite,
      colorBgElevated: redcoastToken.modalBg,
      colorBgLayout: redcoastToken.colorBgContainer,
      colorBgSpotlight: redcoastToken.colorSubBlue,
      colorBgContainerDisabled: redcoastToken.black?.["black 4%"],
      colorBorder: redcoastToken.colorBorder,
      colorBorderSecondary: redcoastToken.colorSplitLine,
      colorBorderDisabled: redcoastToken.black?.["black 12%"],
      colorSplit: redcoastToken.colorSplitLine,
      colorFillTertiary: redcoastToken.colorBgDisabled,
      colorBgTextHover: redcoastToken.colorActiveTableRow,
      colorBgTextActive: redcoastToken.status.blue1,
      borderRadius: redcoastToken.borderRadius,
      borderRadiusLG: redcoastToken.borderRadiusLG,
      controlHeight: redcoastToken.controlHeight,
      controlInteractiveSize: 16,
      lineWidthFocus: 0,
      paddingSM: 13,

      // // 派生色
      colorInfoBg: redcoastToken.blue?.scale.blue8,
      colorInfoBorder: redcoastToken.blue?.scale.blue6,
      colorInfoText: redcoastToken.blue?.scale.blue3,
      // // colorInfo

      colorPrimaryBg: redcoastToken.blue?.scale.blue8,
      colorPrimaryBorder: redcoastToken.blue?.scale.blue6,
      colorPrimaryText: redcoastToken.blue?.scale.blue3,

      colorWarningBg: redcoastToken.orange?.scale.orange8,
      colorWarningBorder: redcoastToken.orange?.scale.orange6,
      colorWarningText: redcoastToken.orange?.scale.orange3,

      colorSuccessBg: redcoastToken.green?.scale.green8,
      colorSuccessText: redcoastToken.green?.scale.green3,
      colorSuccessBorder: redcoastToken.green?.scale.green6,

      colorErrorBg: redcoastToken.red?.scale.red8,
      colorErrorText: redcoastToken.red?.scale.red3,
      colorErrorBorder: redcoastToken.red?.scale.red6,
    },
    components: {
      Checkbox: {
        borderRadiusSM: 4,
      },
      Upload: {
        marginXS: 0,
      },
      Alert: {
        borderRadiusLG: 8,
      },
      Form: {
        labelHeight: 20,
        labelRequiredMarkColor: redcoastToken.status.red5,
      },
      Popconfirm: {
        borderRadiusLG: 12,
        colorText: redcoastToken.colorTipsText,
        fontWeightStrong: 400,
        colorTextHeading: redcoastToken.colorBodyText,
      },
      Layout: {
        footerPadding: "12px 0",
      },
      Message: {
        borderRadiusLG: 8,
        contentPadding: "9px 12px",
        // contentBg: redcoastToken?.other?.messageBg,
        // colorText: redcoastToken.black?.["black 100%"],
      },
      Divider: {
        colorSplit: redcoastToken.black?.["black 6%"],
      },
      Input: {
        colorText: redcoastToken.colorBodyText,
        colorTextDescription: redcoastToken.colorBgDisabledButton,
        colorTextDisabled: redcoastToken.colorBgDisabledButton,
        colorTextPlaceholder: redcoastToken.colorBgDisabledButton,
        activeBg: redcoastToken.colorWhite,
        hoverBg: redcoastToken.colorWhite,
        colorBgContainer: redcoastToken.colorWhite,
        colorFillTertiary: redcoastToken.colorBgContainer,
      },
      Menu: {
        horizontalItemBorderRadius: 24,
        itemBorderRadius: 8,
        subMenuItemBorderRadius: 24,
        itemSelectedBg: redcoastToken.blue?.mix.blue3Mix4,
        itemSelectedColor: redcoastToken.blue?.scale.blue3,
        itemActiveBg: redcoastToken.blue?.mix.blue3Mix4,
        itemColor: redcoastToken.colorBodyText,
        itemHoverBg: redcoastToken.black?.["black 4%"],
        iconSize: 20,
        itemHeight: 44,
        controlHeightLG: 200,
        horizontalItemHoverBg: redcoastToken.colorActiveTableRow,
        collapsedIconSize: 20,
        iconMarginInlineEnd: 8,
        horizontalLineHeight: "44px",
        borderRadius: 24,
        colorSplit: redcoastToken.colorWhite,
        subMenuItemBg: redcoastToken.colorWhite,
        borderRadiusLG: 8,
        controlItemBgHover: redcoastToken.black?.["black 4%"],
        // darkItemHoverBg: redcoastToken.colorBgContainer,
      },
      Tabs: {
        colorBorderSecondary: redcoastToken.black?.["black 20%"],
        horizontalItemPadding: "3px 28px 13px 28px",
        horizontalItemGutter: 12,
        titleFontSize: 16,
        itemColor: redcoastToken.gray?.["gray 48%"],
        borderRadiusLG: 20,
        inkBarColor: redcoastToken.blue?.scale.blue3,
      },
      Tooltip: {
        controlHeight: 32,
        borderRadius: 8,
        colorBgSpotlight: redcoastToken.colorSubBlue,
      },
      Table: {
        headerBorderRadius: redcoastToken.borderRadius,
        headerColor: redcoastToken.colorHeader,
        headerBg: redcoastToken.other?.tableHeaderBg,
        headerSplitColor: "transparent",
        borderColor: redcoastToken.colorSplitLine,
        colorText: redcoastToken.colorBodyText,
        selectionColumnWidth: "20px",
        fontWeightStrong: 400,
        rowSelectedBg: redcoastToken.colorActiveTableRow,
        rowHoverBg: redcoastToken.colorActiveTableRow,
        rowSelectedHoverBg: redcoastToken.colorActiveTableRow,
        cellPaddingInline: 8,
        headerSortActiveBg: "none",
        borderRadiusSM: 4,
        cellPaddingBlock: 14,
      },
      Segmented: {
        // itemSelectedBg: redcoastToken.colorPrimary,
        itemSelectedBg: redcoastToken.blue?.scale.blue3,
        itemSelectedColor: redcoastToken.colorActiveMenuItemIcon,
        trackBg: undefined,
        itemColor: redcoastToken.black?.["black 48%"],
        trackPadding: 4,
        colorBorder: redcoastToken.black?.["black 12%"],
      },
      Popover: {
        borderRadiusLG: redcoastToken.borderRadius,
        padding: 8,
      },
      Select: {
        borderRadiusSM: redcoastToken.borderRadius,
        optionHeight: 36,
        optionPadding: "8px",
        borderRadiusLG: redcoastToken.borderRadius,
        multipleItemBg: redcoastToken.status.blue1,
        fontWeightStrong: 400,
        paddingXXS: 9,
        optionActiveBg: redcoastToken.black?.["black 8%"],
        optionSelectedBg: redcoastToken.black?.["black 4%"],
        optionSelectedColor: redcoastToken.gray?.["gray 88%"],
      },
      TreeSelect: {
        nodeSelectedBg: redcoastToken.status.blue1,
      },
      DatePicker: {
        borderRadiusLG: redcoastToken.borderRadius,
        paddingInline: 20,
        // 与 Figma 日期格子 24px 对齐，避免范围连线按 controlHeightSM 居中错位
        cellHeight: 24,
        cellWidth: 24,
        // Figma：范围胶囊底 = 8%blue03
        cellActiveWithRangeBg: redcoastToken.blue?.mix?.blue3Mix8,
        borderRadiusSM: 12,
      },
      QRCode: {},
      Drawer: {
        colorBgMask: "",
      },
      Modal: {
        borderRadiusLG: 16,
        marginXS: 20,
      },
      InputNumber: {
        paddingInline: 20,
      },
      Tree: {
        nodeSelectedBg: redcoastToken.status.blue1,
        nodeHoverBg: redcoastToken.colorActiveTableRow,
        colorBorder: redcoastToken.colorPrimary,
      },
      Pagination: {
        itemSize: 36,
      },
      Tag: tagToken(redcoastToken),
      Button: {
        colorTextDisabled: redcoastToken.colorBgDisabledButton,
        borderColorDisabled: "transparent",
        colorBgContainerDisabled: redcoastToken.colorBgDisabled,
        fontSize: redcoastToken.fontSize,
        primaryShadow: "none",
        dangerShadow: "none",
        defaultShadow: "none",

        paddingInline: 20,
        marginXS: 8,

        boxShadow: "none",
        boxShadowSecondary: "none",
        boxShadowTertiary: "none",
        defaultBg: redcoastToken.gray?.["gray 4%"],
        // colorFillTertiary: redcoastToken.colorBgContainer,

        ...buttonToken(redcoastToken),
      },
    },
  };

  return antdToken;
}

export { buildAntdThemeConfig };
