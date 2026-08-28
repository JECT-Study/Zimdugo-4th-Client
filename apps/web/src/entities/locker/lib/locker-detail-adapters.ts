import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import type { LockerDetailRaw } from "#/shared/api/lockers";
import { formatDistanceMeters } from "#/shared/lib/format-distance-meters";
import {
  formatLastUpdatedLabel,
  formatUpdatedLabel,
} from "#/shared/lib/format-updated-label";
import {
  formatLockerFloorLabel,
  formatLockerOperatingHoursLabel,
  formatLockerPriceLabel,
  formatLockerSizeTypesLabel,
} from "#/shared/lib/locker-detail-labels";
import { getLockerTypeLabel } from "#/shared/lib/locker-type-label";

const formatOperatingHoursLabel = (raw: LockerDetailRaw): string => {
  if (raw.startTime && raw.endTime) {
    return formatLockerOperatingHoursLabel(raw.startTime, raw.endTime);
  }

  if (raw.operatingHours) {
    return formatLockerOperatingHoursLabel(
      raw.operatingHours.open,
      raw.operatingHours.close,
    );
  }

  return formatLockerOperatingHoursLabel();
};

/** 서버 순서를 그대로 두고 빈 문자열과 중복만 걷어낸다. */
const normalizeImageUrls = (imageUrls: string[] | undefined): string[] => {
  if (!imageUrls) {
    return [];
  }

  const seen = new Set<string>();

  return imageUrls.reduce<string[]>((acc, imageUrl) => {
    const trimmed = imageUrl?.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      acc.push(trimmed);
    }

    return acc;
  }, []);
};

export const toLockerDetailItem = (raw: LockerDetailRaw): LockerDetailItem => ({
  itemType: "LOCKER",
  lockerId: raw.lockerId,
  title: raw.lockerName,
  address: raw.roadAddress,
  latitude: raw.latitude,
  longitude: raw.longitude,
  categoryLabel: getLockerTypeLabel(raw.lockerType),
  updatedLabel: formatUpdatedLabel(raw.updatedAt),
  distanceLabel: formatDistanceMeters(raw.distanceMeters),
  distanceMeters: raw.distanceMeters,
  updatedAt: raw.updatedAt,
  minPrice: raw.minPrice,
  isFavorite: raw.isFavorite,
  operatingHoursLabel: formatOperatingHoursLabel(raw),
  floorLabel: formatLockerFloorLabel(
    raw.floor,
    raw.groundLevelType,
    raw.floorLabel,
  ),
  priceLabel: formatLockerPriceLabel(raw.minPrice, raw.maxPrice),
  sizeLabel:
    raw.lockerSizes && raw.lockerSizes.length > 0
      ? formatLockerSizeTypesLabel(raw.lockerSizes)
      : raw.sizeLabel,
  images: normalizeImageUrls(raw.imageUrls),
  detailHelpText: raw.detailInfo ?? raw.detailHelpText,
  accurateCount: raw.accurateVoteCount ?? raw.accurateCount,
  inaccurateCount: raw.inaccurateVoteCount ?? raw.inaccurateCount,
  isAccurateVoted: raw.isAccurateVoted ?? false,
  isInaccurateVoted: raw.isInaccurateVoted ?? false,
  lastUpdatedLabel: formatLastUpdatedLabel(raw.updatedAt) || undefined,
  realtimeAvailability: raw.realtimeAvailability,
});
