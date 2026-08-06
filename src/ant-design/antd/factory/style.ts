import type { RedcoastToken } from "../component/config-provider";

declare module "antd-style" {
	export interface CustomToken extends RedcoastToken {}
}

export { createStyles } from "antd-style";
