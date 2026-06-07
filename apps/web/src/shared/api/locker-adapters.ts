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
import { formatUpdatedLabel } from "#/shared/lib/format-updated-label";
import { getLockerTypeLabel } from "#/shared/lib/locker-type-label";
import type {
  LockerBoundsRaw,
  LockerDetailRaw,
  LockerKeywordItemRaw,
  LockerNestedRaw,
  LockerSuggestItemRaw,
} from "./lockers";

export interface LockerKeywordViewModel {
  count: number;
  bounds: LockerBoundsRaw;
  items: SearchResultItem[];
}

export interface PlaceLockersViewModel {
  bounds: LockerBoundsRaw;
  lockers: SearchLockerResultItem[];
}

const toSearchLockerResultItem = (
  raw: LockerNestedRaw,
): SearchLockerResultItem => ({
  itemType: "LOCKER",
  lockerId: raw.lockerId,
  title: raw.lockerName,
  address: raw.roadAddress,
  categoryLabel: getLockerTypeLabel(raw.lockerType),
  updatedLabel: formatUpdatedLabel(raw.updatedAt),
  distanceLabel: formatDistanceMeters(raw.distanceMeters),
  distanceMeters: raw.distanceMeters,
  updatedAt: raw.updatedAt,
  minPrice: raw.minPrice,
  isFavorite: raw.isFavorite,
});

const toSearchPlaceResultItem = (
  raw: LockerKeywordItemRaw,
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
    distanceLabel: formatDistanceMeters(raw.distanceMeters),
    distanceMeters: raw.distanceMeters,
    updatedAt: raw.updatedAt,
    minPrice: raw.minPrice,
    lockers: lockers as SearchLockerResultItems,
  };
};

const toTopLevelLockerResultItem = (
  raw: LockerKeywordItemRaw,
): SearchLockerResultItem | null => {
  if (raw.type !== "LOCKER" || raw.lockerId == null || !raw.lockerName) {
    return null;
  }

  return {
    itemType: "LOCKER",
    lockerId: raw.lockerId,
    title: raw.lockerName,
    address: raw.roadAddress,
    categoryLabel: getLockerTypeLabel(raw.lockerType),
    updatedLabel: formatUpdatedLabel(raw.updatedAt),
    distanceLabel: formatDistanceMeters(raw.distanceMeters),
    distanceMeters: raw.distanceMeters,
    updatedAt: raw.updatedAt,
    minPrice: raw.minPrice,
    isFavorite: raw.isFavorite,
  };
};

export const toSearchKeywordItems = (
  items: LockerKeywordItemRaw[],
): SearchResultItem[] =>
  items
    .map((item) =>
      item.type === "PLACE"
        ? toSearchPlaceResultItem(item)
        : toTopLevelLockerResultItem(item),
    )
    .filter((item): item is SearchResultItem => item !== null);

export const toLockerKeywordViewModel = (payload: {
  count: number;
  bounds: LockerBoundsRaw;
  items: LockerKeywordItemRaw[];
}): LockerKeywordViewModel => ({
  count: payload.count,
  bounds: payload.bounds,
  items: toSearchKeywordItems(payload.items),
});

export const toPlaceLockersViewModel = (payload: {
  bounds: LockerBoundsRaw;
  lockers: LockerNestedRaw[];
}): PlaceLockersViewModel => ({
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

export const toLockerDetailItem = (raw: LockerDetailRaw): LockerDetailItem => ({
  itemType: "LOCKER",
  lockerId: raw.lockerId,
  title: raw.lockerName,
  address: raw.roadAddress,
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
  operatingHoursLabel: raw.operatingHours
    ? `운영시간 ${raw.operatingHours.open} ~ ${raw.operatingHours.close}`
    : undefined,
  floorLabel: raw.floorLabel,
  priceLabel:
    raw.minPrice !== undefined
      ? `${raw.minPrice.toLocaleString("ko-KR")}원 ~`
      : undefined,
  sizeLabel: raw.sizeLabel,
  detailHelpText: raw.detailHelpText,
  accurateCount: raw.accurateCount,
  inaccurateCount: raw.inaccurateCount,
  lastUpdatedLabel: raw.updatedAt
    ? `최근 업데이트 ${formatUpdatedLabel(raw.updatedAt)}`
    : undefined,
});
