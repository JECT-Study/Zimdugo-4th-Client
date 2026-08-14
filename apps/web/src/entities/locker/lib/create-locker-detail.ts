import type {
  LockerDetailItem,
  LockerSummaryItem,
} from "#/entities/locker/model/locker-detail";
import {
  formatLockerOperatingHoursLabel,
  formatLockerPriceLabel,
} from "#/shared/lib/locker-detail-labels";

interface LockerPinSummary {
  lockerId: number;
  latitude: number;
  longitude: number;
}

interface LockerHistorySummary {
  lockerId: number;
  title: string;
}

interface LockerAutocompleteSummary extends LockerHistorySummary {
  itemType: "LOCKER";
  address: string;
  categoryLabel: string;
  updatedLabel: string;
  distanceLabel: string;
  distanceMeters?: number;
}

export const createLockerDetailFromSearchItem = (
  item: LockerSummaryItem,
): LockerDetailItem => ({
  ...item,
  operatingHoursLabel: item.operatingHours
    ? formatLockerOperatingHoursLabel(
        item.operatingHours.open,
        item.operatingHours.close,
      )
    : formatLockerOperatingHoursLabel(),
  priceLabel: formatLockerPriceLabel(item.minPrice),
});

/** 지도 핀 선택 직후 API 응답 전에 쓰는 낙관적 상세 */
export const createLockerDetailFromPin = (
  pin: LockerPinSummary,
): LockerDetailItem => ({
  ...createLockerDetailPlaceholder(pin.lockerId),
  latitude: pin.latitude,
  longitude: pin.longitude,
});

/** API 응답 전 마커 등 lockerId만 알 때 쓰는 플레이스홀더 */
export const createLockerDetailPlaceholder = (
  lockerId: number,
): LockerDetailItem => ({
  itemType: "LOCKER",
  lockerId,
  title: "...",
  address: "",
  categoryLabel: "",
  updatedLabel: "",
  distanceLabel: "",
  operatingHoursLabel: formatLockerOperatingHoursLabel(),
  floorLabel: "",
  priceLabel: formatLockerPriceLabel(),
  sizeLabel: "",
  detailHelpText: "",
});

export const createLockerDetailFromHistoryEntry = (
  entry: LockerHistorySummary,
): LockerDetailItem => ({
  ...createLockerDetailPlaceholder(entry.lockerId),
  title: entry.title,
});

export const createLockerDetailFromAutocompleteItem = (
  item: LockerAutocompleteSummary,
): LockerDetailItem => ({
  itemType: "LOCKER",
  lockerId: item.lockerId,
  title: item.title,
  address: item.address,
  categoryLabel: item.categoryLabel,
  updatedLabel: item.updatedLabel,
  distanceLabel: item.distanceLabel,
  distanceMeters: item.distanceMeters,
  operatingHoursLabel: formatLockerOperatingHoursLabel(),
  priceLabel: formatLockerPriceLabel(),
});
