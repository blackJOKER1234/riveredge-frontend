import { LocalEnum } from "../types/enum";
import type { Locale as AntdLocal } from "antd/es/locale";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import {
	enUSAntdLocale,
	syncDayjsLocale,
	zhCNAntdLocale,
} from "./antd-locale";

type Locale = keyof typeof LocalEnum;
type Language = {
	locale: keyof typeof LocalEnum;
	icon: string;
	label: string;
	antdLocal: AntdLocal;
	dayjsLocale: "zh-cn" | "en";
};

export const LANGUAGE_MAP: Record<Locale, Language> = {
	[LocalEnum.zh_CN]: {
		locale: LocalEnum.zh_CN,
		label: "Chinese",
		icon: "line-plus",
		antdLocal: zhCNAntdLocale,
		dayjsLocale: "zh-cn",
	},
	[LocalEnum.en_US]: {
		locale: LocalEnum.en_US,
		label: "English",
		icon: "line-plus",
		antdLocal: enUSAntdLocale,
		dayjsLocale: "en",
	},
};
export const { t } = i18n;

function normalizeLocale(raw?: string | null): Locale {
	if (!raw) return LocalEnum.zh_CN;

	const value = raw.replace(/-/g, "_");
	if (value === LocalEnum.zh_CN || value.startsWith("zh")) {
		return LocalEnum.zh_CN;
	}
	if (value === LocalEnum.en_US || value.startsWith("en")) {
		return LocalEnum.en_US;
	}

	return LocalEnum.zh_CN;
}

export default function useLocale() {
	const { i18n } = useTranslation();

	/**
	 * localstorage -> i18nextLng change
	 */
	const setLocale = (locale: Locale) => {
		void i18n.changeLanguage(locale);
		syncDayjsLocale(LANGUAGE_MAP[locale].dayjsLocale);
	};

	const locale = normalizeLocale(i18n.resolvedLanguage || i18n.language);
	const language = LANGUAGE_MAP[locale];

	return {
		locale,
		language,
		setLocale,
	};
}
