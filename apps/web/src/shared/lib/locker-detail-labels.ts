import { languageTag, m } from "@repo/i18n";
import type { AppLocale } from "#/shared/i18n/locales";

const NUMBER_LOCALE_BY_TAG: Record<AppLocale, string> = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
  zh: "zh-CN",
};

const formatCurrencyAmount = (amount: number): string => {
  const locale = NUMBER_LOCALE_BY_TAG[languageTag()] ?? "ko-KR";
  const formatted = amount.toLocaleString(locale);
  const unit = m.report_price_unit();

  return languageTag() === "ko" ? `${formatted}${unit}` : `${formatted} ${unit}`;
};

const trimTimeSeconds = (time: string): string =>
  /^\d{1,2}:\d{2}:\d{2}$/.test(time) ? time.slice(0, 5) : time;

export const formatLockerOperatingHoursLabel = (
  open?: string,
  close?: string,
): string => {
  if (open && close) {
    return m.locker_detail_operating_hours({
      open: trimTimeSeconds(open),
      close: trimTimeSeconds(close),
    });
  }

  return m.locker_detail_operating_hours_not_provided();
};

export const formatLockerPriceLabel = (
  minPrice?: number,
  maxPrice?: number,
): string => {
  if (minPrice === undefined && maxPrice === undefined) {
    return m.locker_detail_price_not_provided();
  }

  const minLabel =
    minPrice !== undefined ? formatCurrencyAmount(minPrice) : undefined;
  const maxLabel =
    maxPrice !== undefined ? formatCurrencyAmount(maxPrice) : undefined;

  if (minLabel && maxLabel) {
    return m.locker_detail_price_range({ min: minLabel, max: maxLabel });
  }

  if (minLabel) {
    return m.locker_detail_price_from({ min: minLabel });
  }

  return maxLabel ?? m.locker_detail_price_not_provided();
};
