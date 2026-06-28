import type {
  SearchLockerResultItem,
  SearchResultItem,
} from "#/composites/search/search-list-model";
import { isOperatingNow } from "#/composites/search/sort-locker-data";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

const toLockerPin = (
  lockerId: number,
  latitude: number,
  longitude: number,
  markerStatus?: LockerPinItemResponse["markerStatus"],
): LockerPinItemResponse => ({
  pinType: "LOCKER",
  lockerId,
  placeId: null,
  latitude,
  longitude,
  isFavorite: null,
  lockerCount: null,
  pinCount: null,
  bounds: null,
  markerStatus,
});

const toPlacePin = (
  placeId: number,
  latitude: number,
  longitude: number,
  lockerCount: number,
  markerStatus?: LockerPinItemResponse["markerStatus"],
): LockerPinItemResponse => ({
  pinType: "PLACE",
  placeId,
  lockerId: null,
  latitude,
  longitude,
  isFavorite: null,
  lockerCount,
  pinCount: null,
  bounds: null,
  markerStatus,
});

const getLockerMarkerStatus = (
  item: SearchLockerResultItem,
  currentTime = new Date(),
): LockerPinItemResponse["markerStatus"] =>
  isOperatingNow(item.operatingHours, currentTime) ? "active" : "inactive";

const getPlaceMarkerStatus = (
  item: Extract<SearchResultItem, { itemType: "PLACE" }>,
  currentTime = new Date(),
): LockerPinItemResponse["markerStatus"] =>
  item.lockers.every(
    (locker) => getLockerMarkerStatus(locker, currentTime) === "inactive",
  )
    ? "inactive"
    : "active";

export const searchLockerItemToPin = (
  item: SearchLockerResultItem,
): LockerPinItemResponse | null => {
  if (item.latitude === undefined || item.longitude === undefined) {
    return null;
  }

  return toLockerPin(
    item.lockerId,
    item.latitude,
    item.longitude,
    getLockerMarkerStatus(item),
  );
};

export const searchResultItemsToPins = (
  items: SearchResultItem[],
): LockerPinItemResponse[] =>
  items.flatMap((item) => {
    if (item.latitude === undefined || item.longitude === undefined) {
      return [];
    }

    if (item.itemType === "PLACE") {
      return [
        toPlacePin(
          item.placeId,
          item.latitude,
          item.longitude,
          item.lockers.length,
          getPlaceMarkerStatus(item),
        ),
      ];
    }

    return [
      toLockerPin(
        item.lockerId,
        item.latitude,
        item.longitude,
        getLockerMarkerStatus(item),
      ),
    ];
  });

export const searchLockerItemsToPins = (
  items: SearchLockerResultItem[],
): LockerPinItemResponse[] =>
  items
    .map(searchLockerItemToPin)
    .filter((pin): pin is LockerPinItemResponse => pin !== null);
