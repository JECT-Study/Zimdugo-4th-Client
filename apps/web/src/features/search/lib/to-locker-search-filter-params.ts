import type { SearchFilterAppliedState } from "#/composites/search/SearchFilterBottomSheet";
import { cardsToSizeTypes } from "#/entities/locker/lib/cards-to-size-types";
import type { LockerType } from "#/shared/types/locker-type";
import type {
  LockerSearchFilterParams,
  PlaceLockersFilterParams,
} from "#/shared/api/lockers";

const PLACE_FILTER_TO_LOCKER_TYPE: Record<string, LockerType> = {
  museum: "MUSEUM",
  subway: "SUBWAY_STATION",
  department: "DEPARTMENT_STORE",
  convenience: "CONVENIENCE_STORE",
  public: "PUBLIC_OFFICE",
  private: "PRIVATE_LOCKER",
  train: "TRAIN_STATION",
  other: "ETC",
};

const INDOOR_OUTDOOR_FILTER_TO_API: Record<string, "INDOOR" | "OUTDOOR"> = {
  indoor: "INDOOR",
  outdoor: "OUTDOOR",
};

const toIndoorOutdoorTypes = (
  indoorOutdoorState: string[],
): Array<"INDOOR" | "OUTDOOR"> =>
  indoorOutdoorState
    .map((value) => INDOOR_OUTDOOR_FILTER_TO_API[value])
    .filter((value): value is "INDOOR" | "OUTDOOR" => !!value);

const toLockerTypes = (placeTypeState: string[]): LockerType[] =>
  placeTypeState
    .map((value) => PLACE_FILTER_TO_LOCKER_TYPE[value])
    .filter((value): value is LockerType => !!value);

export const toLockerSearchFilterParams = (
  filters: SearchFilterAppliedState,
): LockerSearchFilterParams => {
  const params: LockerSearchFilterParams = {};

  if (filters.sizeActive && filters.selectedSizes.length > 0) {
    params.sizeTypes = cardsToSizeTypes(filters.selectedSizes);
  }

  const indoorOutdoorTypes = toIndoorOutdoorTypes(filters.indoorOutdoorState);
  if (indoorOutdoorTypes.length > 0) {
    params.indoorOutdoorTypes = indoorOutdoorTypes;
  }

  if (filters.placeTypeActive) {
    const lockerTypes = toLockerTypes(filters.placeTypeState);
    if (lockerTypes.length > 0) {
      params.lockerTypes = lockerTypes;
    }
  }

  return params;
};

export const toPlaceLockersFilterParams = (
  filters: SearchFilterAppliedState,
): PlaceLockersFilterParams => {
  const params: PlaceLockersFilterParams = {};

  if (filters.sizeActive && filters.selectedSizes.length > 0) {
    params.sizeTypes = cardsToSizeTypes(filters.selectedSizes);
  }

  const indoorOutdoorTypes = toIndoorOutdoorTypes(filters.indoorOutdoorState);
  if (indoorOutdoorTypes.length > 0) {
    params.indoorOutdoorTypes = indoorOutdoorTypes;
  }

  const lockerTypes = toLockerTypes(filters.placeTypeState);
  if (lockerTypes.length > 0) {
    params.lockerTypes = lockerTypes;
  }

  return params;
};
