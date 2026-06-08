import type { SearchFilterAppliedState } from "#/composites/search/SearchFilterBottomSheet";
import { cardsToSizeTypes } from "#/features/report/lib/size-type-map";
import type { LockerType } from "#/features/report/model/report-types";
import type { LockerSearchFilterParams } from "#/shared/api/lockers";

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
      params.sizeTypes = cardsToSizeTypes(filters.selectedSizes);
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

  if (filters.regionActive && filters.indoorOutdoorState.length > 0) {
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
