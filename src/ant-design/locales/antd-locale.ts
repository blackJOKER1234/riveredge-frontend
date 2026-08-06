import type { Locale as AntdLocale } from "antd/es/locale";
import en_US from "antd/locale/en_US";
import zh_CN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/zh-cn";

const ZH_SHORT_MONTHS = [
	"1月",
	"2月",
	"3月",
	"4月",
	"5月",
	"6月",
	"7月",
	"8月",
	"9月",
	"10月",
	"11月",
	"12月",
] as const;

const ZH_SHORT_WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"] as const;

const EN_SHORT_MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
] as const;

const EN_SHORT_WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

type DayjsLocaleName = "zh-cn" | "en";

type PickerLang = NonNullable<NonNullable<AntdLocale["DatePicker"]>["lang"]>;

/**
 * antd DatePicker 月份/星期短名依赖 dayjs locale。
 * monorepo 中 antd 可能使用嵌套 dayjs 实例，仅给业务侧 dayjs 设置 locale 时
 * 会出现「年已是中文、月仍是 Nov」的情况。这里直接补齐 shortMonths/shortWeekDays。
 */
function withPickerLocale(
	base: AntdLocale,
	options: {
		shortMonths: readonly string[];
		shortWeekDays: readonly string[];
		monthFormat?: string;
	},
): AntdLocale {
	const patchLang = (lang?: PickerLang): PickerLang | undefined => {
		if (!lang) return lang;
		return {
			...lang,
			shortMonths: [...options.shortMonths],
			shortWeekDays: [...options.shortWeekDays],
			...(options.monthFormat ? { monthFormat: options.monthFormat } : {}),
		};
	};

	return {
		...base,
		DatePicker: base.DatePicker
			? {
					...base.DatePicker,
					lang: patchLang(base.DatePicker.lang) as PickerLang,
				}
			: base.DatePicker,
		Calendar: base.Calendar
			? {
					...base.Calendar,
					lang: patchLang(base.Calendar.lang) as PickerLang,
				}
			: base.Calendar,
	};
}

const zhCNAntdLocale = withPickerLocale(zh_CN, {
	shortMonths: ZH_SHORT_MONTHS,
	shortWeekDays: ZH_SHORT_WEEK_DAYS,
	monthFormat: "M月",
});

const enUSAntdLocale = withPickerLocale(en_US, {
	shortMonths: EN_SHORT_MONTHS,
	shortWeekDays: EN_SHORT_WEEK_DAYS,
});

function syncDayjsLocale(locale: DayjsLocaleName) {
	dayjs.locale(locale);
}

export {
	zhCNAntdLocale,
	enUSAntdLocale,
	syncDayjsLocale,
	ZH_SHORT_MONTHS,
	ZH_SHORT_WEEK_DAYS,
};
