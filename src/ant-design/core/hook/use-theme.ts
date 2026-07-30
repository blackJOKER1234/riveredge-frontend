import { useContext } from "react";
import { context } from "../component";
import type { commonComponentTokens } from "../dts";

function useTheme() {
	return useContext<commonComponentTokens>(context);
}

export default useTheme;
