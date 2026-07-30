import type { commonComponentTokens } from "../dts";

const baseToken: commonComponentTokens = {
	colorWhite: "#FFFFFF",
	colorPrimary: "#0958D9FF", // 主题色
	colorSubBlue: "#0F1931", // 辅助色
	colorSubGreen: "#52C41AFF", // 辅助色
	colorSuccess: "#52C41AFF",
	colorWarning: "#FAAD14",
	colorError: "#FF4D4FFF",
	colorBorder: "#D9D9D9",
	colorBgDisabled: "#F3F5F7",
	colorBgDisabledButton: "#00000033", // 禁用按钮背景色
	colorBgActiveButton: "#1A69E8",
	colorMenuItemIcon: "#1F1F1F",
	colorActiveMenuItemIcon: "#FFFFFF",
	colorTipsText: "#ADADADFF", // 提示文本色
	colorActiveTipsText: "#FFFFFF59", // 提示文本交互色
	colorBodyText: "#000000E0", // 标题/正文色
	colorBgContainer: "#F3F5F7", // 背景板色
	colorSplitLine: "#0505050F", // 文字/分割线
	colorActiveTableRow: "#F5F9FE", // 表格交互色
	colorBlack: "#000000",
	borderRadiusSM: 4,
	borderRadius: 8,
	borderRadiusLG: 16,
	borderRadiusXL: 24,
	controlHeight: 40,
	fontSize: 14,
	scrollBarColor: "#EDEDED",
	modalBg: "#FAFBFC", //#FAFBFC
	colorHeader: "rgba(0, 0, 0, 0.35)",
	baseColor: {
		primary: "rgba(9, 88, 217, 1)",
		secondary: "rgba(15, 25, 49, 1)",
		bg: "rgba(243, 245, 247, 1)",
		primary_green: "rgba(120, 240, 128, 1)",
	},
	status: {
		red5: "#FF4D4FFF",
		red1: "#FFF3F0",
		orange6: "#FA8C16",
		orange1: "#FFF6ED",
		blue1: "#ECF2FC",
		blue7: "#0958D9",
		green7: "#389E0D",
		green1: "#EFF8EC",
		yellow7: "#F0BB0E",
		yellow1: "#FFF9E8",
	},
	text: {
		title: "rgba(0, 0, 0, 0.88)",
		tip: "rgba(0, 0, 0, 0.35)",
		smTip: "rgba(255, 255, 255, 0.35)",
		input: "rgba(0, 0, 0, 0.2)",
		border: "rgba(217, 217, 217, 1)",
	},
};

export default baseToken;
