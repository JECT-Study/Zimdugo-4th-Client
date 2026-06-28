import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import type {
  SearchLockerResultItem,
  SearchLockerResultItems,
  SearchPlaceResultItem,
  SearchResultItem,
} from "#/composites/search/search-list-model";
import type {
  SearchAutocompleteItemData,
  SearchAutocompleteLockerItem,
  SearchAutocompletePlaceItem,
} from "#/entities/search";
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
import type {
  LockerBoundsRaw,
  LockerDetailRaw,
  LockerSearchItemRaw,
  LockerNestedRaw,
  LockerOperatingHoursRaw,
  LockerSuggestItemRaw,
  PlaceLockersDataRaw,
} from "./lockers";

export interface LockerSearchViewModel {
  count: number;
  bounds: LockerBoundsRaw;
  items: SearchResultItem[];
}

export interface PlaceLockersViewModel {
  placeId: number;
  placeName: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
  bounds: LockerBoundsRaw;
  lockers: SearchLockerResultItem[];
}

const getOperatingHours = (raw: {
  startTime?: string;
  endTime?: string;
  operatingHours?: LockerOperatingHoursRaw | null;
}) => {
  if (raw.startTime && raw.endTime) {
    return {
      open: normalizeOperatingTime(raw.startTime),
      close: normalizeOperatingTime(raw.endTime),
    };
  }

  if (raw.operatingHours) {
    return {
      open: normalizeOperatingTime(raw.operatingHours.open),
      close: normalizeOperatingTime(raw.operatingHours.close),
    };
  }

  return null;
};

const normalizeOperatingTime = (time: string): string =>
  time.replace(/^(\d{2}:\d{2}):\d{2}$/, "$1");

const toSearchLockerResultItem = (
  raw: LockerNestedRaw,
): SearchLockerResultItem => ({
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
  operatingHours: getOperatingHours(raw),
});

const toSearchPlaceResultItem = (
  raw: LockerSearchItemRaw,
): SearchPlaceResultItem | null => {
  if (raw.type !== "PLACE" || raw.placeId == null || !raw.placeName) {
    return null;
  }

  const lockers = raw.lockers.map(toSearchLockerResultItem);
  if (lockers.length < 2) return null;

  return {
    itemType: "PLACE",
    placeId: raw.placeId,
    title: raw.placeName,
    address: raw.roadAddress,
    latitude: raw.latitude,
    longitude: raw.longitude,
    distanceLabel: formatDistanceMeters(raw.distanceMeters),
    distanceMeters: raw.distanceMeters,
    updatedAt: raw.updatedAt,
    minPrice: raw.minPrice,
    operatingHours: getOperatingHours(raw),
    lockers: lockers as SearchLockerResultItems,
  };
};

const toTopLevelLockerResultItem = (
  raw: LockerSearchItemRaw,
): SearchLockerResultItem | null => {
  if (raw.type !== "LOCKER" || raw.lockerId == null || !raw.lockerName) {
    return null;
  }

  return {
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
    operatingHours: getOperatingHours(raw),
  };
};

export const toSearchKeywordItems = (
  items: LockerSearchItemRaw[],
): SearchResultItem[] =>
  items
    .map((item) =>
      item.type === "PLACE"
        ? toSearchPlaceResultItem(item)
        : toTopLevelLockerResultItem(item),
    )
    .filter((item): item is SearchResultItem => item !== null);

export const toLockerSearchViewModel = (payload: {
  count: number;
  bounds: LockerBoundsRaw;
  items: LockerSearchItemRaw[];
}): LockerSearchViewModel => ({
  count: payload.count,
  bounds: payload.bounds,
  items: toSearchKeywordItems(payload.items),
});

export const toPlaceLockersViewModel = (
  payload: PlaceLockersDataRaw,
): PlaceLockersViewModel => ({
  placeId: payload.placeId,
  placeName: payload.placeName,
  roadAddress: payload.roadAddress,
  latitude: payload.latitude,
  longitude: payload.longitude,
  bounds: payload.bounds,
  lockers: payload.lockers.map(toSearchLockerResultItem),
});

export const toSearchAutocompleteItem = (
  raw: LockerSuggestItemRaw,
): SearchAutocompleteItemData | null => {
  if (raw.type === "PLACE") {
    if (!raw.placeName) return null;

    const item: SearchAutocompletePlaceItem = {
      itemType: "PLACE",
      placeId: raw.placeId,
      title: raw.placeName,
      address: raw.roadAddress,
      updatedLabel: formatUpdatedLabel(raw.updatedAt),
      categoryLabel: getLockerTypeLabel(raw.lockerType),
      distanceLabel: formatDistanceMeters(raw.distanceMeters),
      distanceMeters: raw.distanceMeters,
    };
    return item;
  }

  if (!raw.lockerName) return null;

  const item: SearchAutocompleteLockerItem = {
    itemType: "LOCKER",
    lockerId: raw.lockerId,
    title: raw.lockerName,
    address: raw.roadAddress,
    updatedLabel: formatUpdatedLabel(raw.updatedAt),
    categoryLabel: getLockerTypeLabel(raw.lockerType),
    distanceLabel: formatDistanceMeters(raw.distanceMeters),
    distanceMeters: raw.distanceMeters,
  };
  return item;
};

export const toSearchAutocompleteItems = (
  items: LockerSuggestItemRaw[],
): SearchAutocompleteItemData[] =>
  items
    .map(toSearchAutocompleteItem)
    .filter((item): item is SearchAutocompleteItemData => item !== null);

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

export const toLockerDetailItem = (raw: LockerDetailRaw): LockerDetailItem => ({
  itemType: "LOCKER",
  lockerId: raw.lockerId,
  title: raw.lockerName,
  address: raw.roadAddress,
  latitude: raw.latitude,
  longitude: raw.longitude,
  categoryLabel: getLockerTypeLabel(raw.lockerType),
  updatedLabel: formatUpdatedLabel(raw.updatedAt),
  distanceLabel:
    raw.distanceMeters !== undefined
      ? formatDistanceMeters(raw.distanceMeters)
      : "",
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
  imageUrl: raw.imageUrl?.trim() || undefined,
  detailHelpText: raw.detailInfo ?? raw.detailHelpText,
  accurateCount: raw.accurateVoteCount ?? raw.accurateCount,
  inaccurateCount: raw.inaccurateVoteCount ?? raw.inaccurateCount,
  isAccurateVoted: raw.isAccurateVoted ?? false,
  isInaccurateVoted: raw.isInaccurateVoted ?? false,
  lastUpdatedLabel: formatLastUpdatedLabel(raw.updatedAt) || undefined,
});
