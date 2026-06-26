import type {
  SearchLockerResultItem,
  SearchResultItem,
} from "#/composites/search/search-list-model";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

const toLockerPin = (
  lockerId: number,
  latitude: number,
  longitude: number,
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
});

const toPlacePin = (
  placeId: number,
  latitude: number,
  longitude: number,
): LockerPinItemResponse => ({
  pinType: "PLACE",
  placeId,
  lockerId: null,
  latitude,
  longitude,
  isFavorite: null,
  lockerCount: 0,
  pinCount: null,
  bounds: null,
});

export const searchLockerItemToPin = (
  item: SearchLockerResultItem,
): LockerPinItemResponse | null => {
  if (item.latitude === undefined || item.longitude === undefined) {
    return null;
  }

  return toLockerPin(item.lockerId, item.latitude, item.longitude);
};

export const searchResultItemsToPins = (
  items: SearchResultItem[],
): LockerPinItemResponse[] =>
  items.flatMap((item) => {
    if (item.latitude === undefined || item.longitude === undefined) {
      return [];
    }

    if (item.itemType === "PLACE") {
      return [toPlacePin(item.placeId, item.latitude, item.longitude)];
    }

    return [toLockerPin(item.lockerId, item.latitude, item.longitude)];
  });

export const searchLockerItemsToPins = (
  items: SearchLockerResultItem[],
): LockerPinItemResponse[] =>
  items
    .map(searchLockerItemToPin)
    .filter((pin): pin is LockerPinItemResponse => pin !== null);
