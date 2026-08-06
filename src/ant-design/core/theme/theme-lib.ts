import type { ThemeLib, commonComponentTokens } from "../dts/index.ts";
import darkTokens from "./Dark.tokens.ts";
import lightTokens from "./Light.tokens.ts";
import baseToken from "./token.ts";

type LightTokens = typeof lightTokens;
type DarkTokens = typeof darkTokens;
type ThemeTokens = LightTokens | DarkTokens;

type OtherValues = {
	pageBg: string;
	panelBg: string;
	tagBg: string;
	modalBg: string;
	disabledButton: string;
};

const hexToRgba = (hex: string) => {
	const red = Number.parseInt(hex.slice(1, 3), 16);
	const green = Number.parseInt(hex.slice(3, 5), 16);
	const blue = Number.parseInt(hex.slice(5, 7), 16);

	return `rgba(${red}, ${green}, ${blue}, 1)`;
};

const createTheme = <T extends ThemeTokens>(
	source: T,
	mode: "light" | "dark",
	otherValues: OtherValues,
): commonComponentTokens => {
	const isDark = mode === "dark";
	const other = source.other;
	const blue = source.blue.scale;
	const red = source.red.scale;
	const green = source.green.scale;
	const orange = source.orange.scale;
	const black = source.black;
	const gray = source.gray;
	const { disabledButton, modalBg, pageBg, panelBg, tagBg } = otherValues;

	return {
		...baseToken,
		colorWhite: panelBg,
		colorPrimary: blue.blue3,
		colorSubBlue: blue.blue0,
		colorSubGreen: green.green3,
		colorSuccess: green.green3,
		colorWarning: orange.orange3,
		colorError: red.red3,
		colorBorder: isDark ? black["black 16%"] : gray["gray 15%"],
		colorBgDisabled: tagBg,
		colorBgDisabledButton: isDark ? disabledButton : black["black 20%"],
		colorBgActiveButton: blue.blue2,
		colorMenuItemIcon: isDark ? black["black 65%"] : black["black 88%"],
		colorActiveMenuItemIcon: other.white,
		colorTipsText: black["black 45%"],
		colorActiveTipsText: black["black 65%"],
		colorBodyText: isDark ? black["black 85%"] : black["black 88%"],
		colorBgContainer: pageBg,
		colorSplitLine: black["black 6%"],
		colorActiveTableRow: blue.blue9,
		colorBlack: gray["gray 100%"],
		scrollBarColor: isDark ? gray["gray 20%"] : gray["gray 8%"],
		modalBg,
		colorHeader: isDark ? black["black 65%"] : black["black 35%"],
		baseColor: {
			primary: hexToRgba(blue.blue3),
			secondary: hexToRgba(blue.blue0),
			bg: hexToRgba(pageBg),
			primary_green: hexToRgba(green.green3),
		},
		status: {
			red5: red.red3,
			red1: red.red8,
			orange6: orange.orange3,
			orange1: orange.orange8,
			blue1: blue.blue8,
			blue7: blue.blue3,
			green7: green.green3,
			green1: green.green8,
			yellow7: baseToken.status.yellow7,
			yellow1: baseToken.status.yellow1,
		},
		text: {
			title: black["black 88%"],
			tip: black["black 45%"],
			smTip: black["black 35%"],
			input: black["black 25%"],
			border: isDark ? black["black 16%"] : gray["gray 15%"],
		},
		...source,
	};
};

const lightTheme: commonComponentTokens = createTheme(lightTokens, "light", {
	pageBg: lightTokens.other.pageBg,
	panelBg: lightTokens.other.panelBg,
	tagBg: lightTokens.other.tagBg,
	modalBg: lightTokens.other.modalBg,
	disabledButton: lightTokens.other.disabledBtn,
});
const darkTheme: commonComponentTokens = createTheme(darkTokens, "dark", {
	pageBg: darkTokens.other.pageBg,
	panelBg: darkTokens.other.panelBg,
	tagBg: darkTokens.other.tagBg,
	modalBg: darkTokens.other.modalBg,
	disabledButton: darkTokens.other.disabledBtn,
});

const themeLib: Record<string, ThemeLib> = {
	light: lightTheme,
	dark: darkTheme,
};

export { darkTheme, lightTheme, themeLib };
