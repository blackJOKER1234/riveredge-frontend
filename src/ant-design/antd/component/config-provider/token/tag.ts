import type { commonComponentTokens } from "../../../../core/dts";
import type { buildAntdThemeConfig } from "../theme";

type TagToken = NonNullable<
	ReturnType<typeof buildAntdThemeConfig>["components"]
>["Tag"];

const tagToken = (themeToken: commonComponentTokens): TagToken => {
	return {
		// default
		defaultBg: themeToken.gray?.["gray 8%"],
		defaultColor: themeToken.gray?.["gray 48%"],
		// colorInfo
		colorInfoBg: themeToken.blue?.scale.blue8,
		colorInfoText: themeToken.blue?.scale.blue3,
		// colorPrimary
		colorPrimaryBg: themeToken.blue?.scale.blue8,
		colorPrimaryText: themeToken.blue?.scale.blue3,
		// colorWarning
		colorWarningBg: themeToken.orange?.scale.orange8,
		colorWarningText: themeToken.orange?.scale.orange3,
		// colorSuccess
		colorSuccessBg: themeToken.green?.scale.green8,
		colorSuccessText: themeToken.green?.scale.green3,
		// colorError
		colorErrorBg: themeToken.red?.scale.red8,
		colorErrorText: themeToken.red?.scale.red3,
	};
};

export { tagToken };
