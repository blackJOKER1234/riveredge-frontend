interface Token {
	colorWhite: string;
	colorPrimary: string;
	colorSubBlue: string;
	colorSubGreen: string;
	colorSuccess: string;
	colorWarning: string;
	colorError: string;
	colorBorder: string;
	colorBgDisabled: string;
	colorBgDisabledButton: string;
	colorBgActiveButton: string;
	borderRadiusSM: number;
	borderRadius: number;
	borderRadiusLG: number;
	borderRadiusXL: number;
	controlHeight: number;
	fontSize: number;
	modalBg: string;
	colorHeader: string;
	colorMenuItemIcon: string;
	colorActiveMenuItemIcon: string;
	colorTipsText: string;
	colorActiveTipsText: string;
	colorBodyText: string;
	colorBgContainer: string;
	colorSplitLine: string;
	colorActiveTableRow: string;
	scrollBarColor: string;
	colorBlack: string;
	baseColor: {
		primary: string;
		secondary: string;
		bg: string;
		primary_green: string;
	};
	status: {
		red5: string;
		red1: string;
		orange6: string;
		orange1: string;
		green7: string;
		green1: string;
		blue7: string;
		blue1: string;
		yellow7: string;
		yellow1: string;
	};
	text: {
		title: string;
		tip: string;
		smTip: string;
		input: string;
		border: string;
	};
}

type TokenValue = string;

type DarkOtherTokens = {
	white: TokenValue;
	pageBg: TokenValue;
	panelBg: TokenValue;
	tableHeaderBg: TokenValue;
	tagBg: TokenValue;
	darkGrayBg: TokenValue;
	modalBg: TokenValue;
	uploadHeaderBg: TokenValue;
	uploadBg: TokenValue;
	disabledBtn: TokenValue;
	tooltipBg: TokenValue;
	messageBg: TokenValue;
};

type BlueTokens = {
	scale: {
		blue0: TokenValue;
		blue1: TokenValue;
		blue2: TokenValue;
		blue3: TokenValue;
		blue4: TokenValue;
		blue5: TokenValue;
		blue6: TokenValue;
		blue7: TokenValue;
		blue8: TokenValue;
		blue9: TokenValue;
	};
	mix: {
		blue3Mix60: TokenValue;
		blue3Mix40: TokenValue;
		blue3Mix8: TokenValue;
		blue3Mix6: TokenValue;
		blue3Mix4: TokenValue;
	};
};

type RedTokens = {
	scale: {
		red1: TokenValue;
		red2: TokenValue;
		red3: TokenValue;
		red4: TokenValue;
		red5: TokenValue;
		red6: TokenValue;
		red7: TokenValue;
		red8: TokenValue;
		red9: TokenValue;
	};
	mix: {
		red3Mix40: TokenValue;
		red3Mix8: TokenValue;
		red3Mix6: TokenValue;
		red3Mix4: TokenValue;
	};
};

type GreenTokens = {
	mix: {
		green3Mix8: TokenValue;
	};
	scale: {
		green1: TokenValue;
		green2: TokenValue;
		green3: TokenValue;
		green4: TokenValue;
		green5: TokenValue;
		green6: TokenValue;
		green7: TokenValue;
		green8: TokenValue;
		green9: TokenValue;
	};
};

type OrangeTokens = {
	scale: {
		orange1: TokenValue;
		orange2: TokenValue;
		orange3: TokenValue;
		orange4: TokenValue;
		orange5: TokenValue;
		orange6: TokenValue;
		orange7: TokenValue;
		orange8: TokenValue;
		orange9: TokenValue;
	};
	mix: {
		orange3Mix8: TokenValue;
	};
};

type CyanTokens = {
	scale: {
		cyan3: TokenValue;
		cyan8: TokenValue;
	};
	mix: {
		cyan3Mix8: TokenValue;
	};
};

type OpacityTokens = {
	"black 2%": TokenValue;
	"black 4%": TokenValue;
	"black 6%": TokenValue;
	"black 8%": TokenValue;
	"black 10%": TokenValue;
	"black 12%": TokenValue;
	"black 15%": TokenValue;
	"black 16%": TokenValue;
	"black 20%": TokenValue;
	"black 24%": TokenValue;
	"black 25%": TokenValue;
	"black 26%": TokenValue;
	"black 28%": TokenValue;
	"black 30%": TokenValue;
	"black 32%": TokenValue;
	"black 35%": TokenValue;
	"black 40%": TokenValue;
	"black 45%": TokenValue;
	"black 48%": TokenValue;
	"black 52%": TokenValue;
	"black 55%": TokenValue;
	"black 60%": TokenValue;
	"black 65%": TokenValue;
	"black 68%": TokenValue;
	"black 80%": TokenValue;
	"black 85%": TokenValue;
	"black 88%": TokenValue;
	"black 92%": TokenValue;
	"black 100%": TokenValue;
};

type GrayScaleTokens = {
	"gray 0%": TokenValue;
	"gray 2%": TokenValue;
	"gray 4%": TokenValue;
	"gray 6%": TokenValue;
	"gray 8%": TokenValue;
	"gray 10%": TokenValue;
	"gray 12%": TokenValue;
	"gray 14%": TokenValue;
	"gray 15%": TokenValue;
	"gray 16%": TokenValue;
	"gray 18%": TokenValue;
	"gray 20%": TokenValue;
	"gray 22%": TokenValue;
	"gray 24%": TokenValue;
	"gray 25%": TokenValue;
	"gray 26%": TokenValue;
	"gray 28%": TokenValue;
	"gray 30%": TokenValue;
	"gray 32%": TokenValue;
	"gray 34%": TokenValue;
	"gray 36%": TokenValue;
	"gray 38%": TokenValue;
	"gray 40%": TokenValue;
	"gray 42%": TokenValue;
	"gray 44%": TokenValue;
	"gray 45%": TokenValue;
	"gray 46%": TokenValue;
	"gray 48%": TokenValue;
	"gray 50%": TokenValue;
	"gray 52%": TokenValue;
	"gray 54%": TokenValue;
	"gray 55%": TokenValue;
	"gray 56%": TokenValue;
	"gray 58%": TokenValue;
	"gray 60%": TokenValue;
	"gray 62%": TokenValue;
	"gray 64%": TokenValue;
	"gray 66%": TokenValue;
	"gray 68%": TokenValue;
	"gray 70%": TokenValue;
	"gray 72%": TokenValue;
	"gray 74%": TokenValue;
	"gray 75%": TokenValue;
	"gray 76%": TokenValue;
	"gray 78%": TokenValue;
	"gray 80%": TokenValue;
	"gray 82%": TokenValue;
	"gray 84%": TokenValue;
	"gray 85%": TokenValue;
	"gray 86%": TokenValue;
	"gray 88%": TokenValue;
	"gray 90%": TokenValue;
	"gray 92%": TokenValue;
	"gray 94%": TokenValue;
	"gray 96%": TokenValue;
	"gray 98%": TokenValue;
	"gray 100%": TokenValue;
};

type DesignTokens = {
	other: DarkOtherTokens;
	blue: BlueTokens;
	red: RedTokens;
	green: GreenTokens;
	orange: OrangeTokens;
	Cyan: CyanTokens;
	black: OpacityTokens;
	gray: GrayScaleTokens;
};

type commonComponentTokens = Token & Partial<DesignTokens>;
// 通过给 antd-style 扩展 CustomToken 对象类型定义，可以为 useTheme 中增加相应的 token 对象
declare module "antd-style" {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	export interface CustomToken extends commonComponentTokens {}
}

export type { DesignTokens, Token, commonComponentTokens };
