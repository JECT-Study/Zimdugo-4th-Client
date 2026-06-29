import type { SearchFilterAppliedState } from "#/composites/search/SearchFilterBottomSheet";
import type { SizeCardType } from "#/entities/locker/ui/size-card/SizeCard";
import { getValidatedSearchQuery } from "../lib/sanitize-search-query";

export type SearchUrlParams = Record<string, unknown>;

const FILTER_SIZE_VALUES = ["S", "M", "L"] as const;
const FILTER_INDOOR_OUTDOOR_VALUES = ["indoor", "outdoor"] as const;
const FILTER_PLACE_TYPE_VALUES = [
  "museum",
  "subway",
  "department",
  "convenience",
  "public",
  "private",
  "train",
  "other",
] as const;

const readCsvParam = (raw: unknown): string[] => {
  if (Array.isArray(raw)) {
    return raw.flatMap(readCsvParam);
  }

  if (typeof raw !== "string") {
    return [];
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

const readAllowedValues = <T extends string>(
  raw: unknown,
  allowedValues: readonly T[],
): T[] => {
  const allowed = new Set<string>(allowedValues);
  const seen = new Set<string>();

  return readCsvParam(raw).filter((value): value is T => {
    if (!allowed.has(value) || seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
};

const writeCsvParam = (
  params: SearchUrlParams,
  key: string,
  values: string[],
) => {
  if (values.length > 0) {
    params[key] = values.join(",");
    return;
  }

  delete params[key];
};

export const readSearchQueryParam = (raw: unknown): string | undefined => {
  if (typeof raw !== "string") {
    return undefined;
  }

  return getValidatedSearchQuery(raw) ?? undefined;
};

export const readSearchPlaceIdParam = (raw: unknown): number | undefined => {
  const value =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number(raw.trim())
        : Number.NaN;

  return Number.isInteger(value) && value > 0 ? value : undefined;
};

export const withSearchQueryParam = (
  params: SearchUrlParams,
  query: string | null | undefined,
): SearchUrlParams => {
  const next = { ...params };
  const validatedQuery =
    typeof query === "string" ? getValidatedSearchQuery(query) : null;

  if (validatedQuery) {
    next.q = validatedQuery;
    return next;
  }

  delete next.q;
  return next;
};

export const withSearchPlaceIdParam = (
  params: SearchUrlParams,
  placeId: number | null | undefined,
): SearchUrlParams => {
  const next = { ...params };

  if (typeof placeId === "number" && Number.isInteger(placeId) && placeId > 0) {
    next.searchPlaceId = placeId;
    return next;
  }

  delete next.searchPlaceId;
  return next;
};

export const readSearchFilterParams = (
  params: SearchUrlParams,
): SearchFilterAppliedState => {
  const selectedSizes = readAllowedValues(
    params.filterSizes,
    FILTER_SIZE_VALUES,
  ) as SizeCardType[];
  const indoorOutdoorState = readAllowedValues(
    params.filterIndoorOutdoor,
    FILTER_INDOOR_OUTDOOR_VALUES,
  );
  const placeTypeState = readAllowedValues(
    params.filterPlaceTypes,
    FILTER_PLACE_TYPE_VALUES,
  );

  return {
    regionActive: indoorOutdoorState.length > 0,
    sizeActive: selectedSizes.length > 0,
    placeTypeActive: placeTypeState.length > 0,
    indoorOutdoorState,
    placeTypeState,
    selectedSizes,
  };
};

export const withSearchFilterParams = (
  params: SearchUrlParams,
  filters: SearchFilterAppliedState,
): SearchUrlParams => {
  const next = { ...params };
  const selectedSizes = filters.sizeActive
    ? readAllowedValues(filters.selectedSizes, FILTER_SIZE_VALUES)
    : [];
  const indoorOutdoorState = filters.regionActive
    ? readAllowedValues(
        filters.indoorOutdoorState,
        FILTER_INDOOR_OUTDOOR_VALUES,
      )
    : [];
  const placeTypeState = filters.placeTypeActive
    ? readAllowedValues(filters.placeTypeState, FILTER_PLACE_TYPE_VALUES)
    : [];

  writeCsvParam(next, "filterSizes", selectedSizes);
  writeCsvParam(next, "filterIndoorOutdoor", indoorOutdoorState);
  writeCsvParam(next, "filterPlaceTypes", placeTypeState);

  return next;
};
