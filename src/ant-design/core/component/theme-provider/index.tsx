import { type ReactNode, createContext, useEffect, useMemo } from "react";
import type { ThemeLib, commonComponentTokens } from "../../dts";
import { token as defaultToken } from "../../theme";

interface Props {
	children: ReactNode;
	theme: string;
	themeLib: Record<string, ThemeLib>;
}

const context = createContext<commonComponentTokens>(defaultToken);
const Provider = context.Provider;

function ThemeProvider({ children, theme, themeLib }: Props) {
	const token = useMemo(() => {
		let result = defaultToken;

		if (!theme)
			result = {
				...result,
				...themeLib.light,
			};
		if (themeLib[theme]) {
			result = {
				...defaultToken,
				...themeLib[theme],
			};
		}

		return result;
	}, [theme, themeLib]);

	useEffect(() => {
		if (typeof document === "undefined") return;
		const scrollBg = token.black?.["black 10%"];
		if (scrollBg) {
			document.body.style.setProperty("--scroll-bg", scrollBg);
		}
	}, [token]);

	return <Provider value={token}>{children}</Provider>;
}

export default ThemeProvider;
export { context };
