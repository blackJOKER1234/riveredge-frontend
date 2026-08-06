import type { commonComponentTokens } from "../../../../core/dts";
import type { buildAntdThemeConfig } from "../theme";

type ButtonToken = NonNullable<
	ReturnType<typeof buildAntdThemeConfig>["components"]
>["Button"];

const buttonToken = (themeToken: commonComponentTokens): ButtonToken => {
	return {
		// 派生色
		colorInfoBg: themeToken.blue?.scale.blue8,
		colorInfoBorder: themeToken.blue?.scale.blue6,
		colorInfoText: themeToken.blue?.scale.blue3,

		// colorPrimary
		colorPrimaryBg: themeToken.blue?.scale.blue8,
		colorPrimaryBorder: themeToken.blue?.scale.blue6,
		colorPrimaryTextHover: themeToken?.other?.white,
		colorPrimaryActive: themeToken.blue?.scale.blue2,
		colorPrimaryText: themeToken?.other?.white,
		colorPrimaryBgHover: themeToken.blue?.scale.blue4,

		// colorWarning
		colorWarningBg: themeToken.orange?.scale.orange3,
		colorWarningBorder: themeToken.orange?.scale.orange6,
		colorWarningText: themeToken.orange?.scale.orange3,

		// colorSuccess
		colorSuccessBg: themeToken.green?.scale.green8,
		colorSuccessBorder: themeToken.green?.scale.green6,
		colorSuccessText: themeToken.green?.scale.green3,

		// colorError
		colorErrorBg: themeToken.red?.scale.red3,
		colorErrorBorder: themeToken.red?.scale.red3,
		colorErrorText: themeToken?.other?.white,
		// 悬停态
		colorErrorBorderHover: themeToken.red?.scale.red4,
		colorErrorTextHover: themeToken?.other?.white,
		colorErrorBgHover: themeToken.red?.scale.red4,
		// 激活态
		colorErrorActive: themeToken.red?.scale.red2,
		colorErrorBgActive: themeToken.red?.scale.red4,
		colorErrorTextActive: themeToken?.other?.white,
	};
};

export { buttonToken };
