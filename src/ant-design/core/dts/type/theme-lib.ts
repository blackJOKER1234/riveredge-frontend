import type { commonComponentTokens } from "./token";

type ThemeLib = {
	[K in keyof commonComponentTokens]?: commonComponentTokens[K];
};

export type { ThemeLib };
