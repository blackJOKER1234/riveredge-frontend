import { useTheme } from "../../../core";
import { Empty as BaseEmpty, type EmptyProps } from "antd";
import clsx from "clsx";
import { memo } from "react";
import empty404Light from "./image/404_light.webp";
import emptyNoDataDark from "./image/no_data_dark.webp";
import emptyNoDataLight from "./image/no_data_light.webp";
import emptyNoMessageDark from "./image/no_message_dark.png";
import emptyNoMessageLight from "./image/no_message_light.webp";
import emptyNoNetDark from "./image/not_net_dark.png";
import emptyNoNetLight from "./image/no_net_light.webp";
import emptyNoSearchDark from "./image/search_error_dark.webp";
import emptyNoSearchLight from "./image/search_error_light.webp";

export type emptyStatus = "404" | "noNet" | "noMessage" | "noData" | "noSearch";

type ThemeMode = "light" | "dark";

type EmptyImageMap = Record<
	emptyStatus,
	Partial<Record<ThemeMode, string>> & { light: string }
>;

const emptyImages: EmptyImageMap = {
	"404": {
		light: empty404Light,
	},
	noNet: {
		light: emptyNoNetLight,
		dark: emptyNoNetDark,
	},
	noMessage: {
		light: emptyNoMessageLight,
		dark: emptyNoMessageDark,
	},
	noData: {
		light: emptyNoDataLight,
		dark: emptyNoDataDark,
	},
	noSearch: {
		light: emptyNoSearchLight,
		dark: emptyNoSearchDark,
	},
};

interface BaseEmptyProp extends EmptyProps {
	Statu?: emptyStatus;
	hiddenImage?: true;
}

const Empty = ({ Statu: Status, ...pro }: BaseEmptyProp) => {
	const token = useTheme();
	const isDark = token.colorWhite !== "#FFFFFF";
	const emptyStatus: emptyStatus = Status || "noData";
	const themeImages = emptyImages[emptyStatus];
	const emptyImg = (isDark && themeImages.dark) || themeImages.light;

	return (
		<BaseEmpty
			{...pro}
			description={
				pro.description ??
				(emptyStatus === "noSearch" ? "暂无搜索结果" : "暂无数据")
			}
			image={
				<img
					src={emptyImg}
					className={clsx(
						"w-auto h-auto object-contain",
						pro.hiddenImage && "hidden",
					)}
					alt={emptyStatus}
				/>
			}
			styles={{
				image: {
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				},
			}}
		>
			{pro.children}
		</BaseEmpty>
	);
};

interface ShowEmptyProps extends BaseEmptyProp {
	component: React.ReactNode;
	showCondition: boolean;
}

export const ShowEmpty = memo(
	({ component, showCondition, ...prop }: ShowEmptyProps) => {
		if (!showCondition) return <Empty {...prop}></Empty>;
		return component;
	},
);

export default Empty;
