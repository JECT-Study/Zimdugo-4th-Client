import type { SearchFilterAppliedState } from "#/composites/search/SearchFilterBottomSheet";
import type { SizeCardType } from "#/entities/locker/ui/size-card/SizeCard";
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

const SIZE_FILTER_TO_API: Record<SizeCardType, "SMALL" | "MEDIUM" | "BIG"> = {
  S: "SMALL",
  M: "MEDIUM",
  L: "BIG",
};

const toSearchSizeTypes = (
  selectedSizes: SizeCardType[],
): Array<"SMALL" | "MEDIUM" | "BIG"> =>
  selectedSizes
    .map((value) => SIZE_FILTER_TO_API[value])
    .filter((value): value is "SMALL" | "MEDIUM" | "BIG" => !!value);

const parsePriceInput = (value: string): number | undefined => {
  const normalized = value.replace(/[^\d]/g, "");
  if (!normalized) return undefined;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const toLockerSearchFilterParams = (
  filters: SearchFilterAppliedState,
): LockerSearchFilterParams => {
  const params: LockerSearchFilterParams = {};

  if (filters.sizePriceActive) {
    if (filters.selectedSizes.length > 0) {
      params.sizeTypes = toSearchSizeTypes(filters.selectedSizes);
    }

    if (filters.priceType === "free") {
      params.isFree = true;
    } else if (filters.priceType === "paid") {
      const minPrice = parsePriceInput(filters.minPrice);
      const maxPrice = parsePriceInput(filters.maxPrice);
      if (minPrice !== undefined) params.minPrice = minPrice;
      if (maxPrice !== undefined) params.maxPrice = maxPrice;
    }
  }

  if (filters.indoorOutdoorState.length > 0) {
    params.indoorOutdoorTypes = filters.indoorOutdoorState
      .map((value) => INDOOR_OUTDOOR_FILTER_TO_API[value])
      .filter((value): value is "INDOOR" | "OUTDOOR" => !!value);
  }

  if (filters.placeTypeActive && filters.placeTypeState.length > 0) {
    params.lockerTypes = filters.placeTypeState
      .map((value) => PLACE_FILTER_TO_LOCKER_TYPE[value])
      .filter((value): value is LockerType => !!value);
  }

  return params;
};

export const toPlaceLockersFilterParams = (
  filters: SearchFilterAppliedState,
): PlaceLockersFilterParams => {
  const params: PlaceLockersFilterParams = {};

  if (filters.sizePriceActive && filters.selectedSizes.length > 0) {
    params.sizeTypes = toSearchSizeTypes(filters.selectedSizes);
  }

  if (filters.indoorOutdoorState.length > 0) {
    const indoorOutdoorType =
      INDOOR_OUTDOOR_FILTER_TO_API[filters.indoorOutdoorState[0]];
    if (indoorOutdoorType) {
      params.indoorOutdoorType = indoorOutdoorType;
    }
  }

  if (filters.placeTypeState.length > 0) {
    const lockerType = PLACE_FILTER_TO_LOCKER_TYPE[filters.placeTypeState[0]];
    if (lockerType) {
      params.lockerType = lockerType;
    }
  }

  return params;
};
