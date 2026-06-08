export type SearchSortKey = "distance" | "updatedAt" | "price";
export type SearchSortDirection = "asc" | "desc";
export type SearchItemType = "PLACE" | "LOCKER";

export interface OperatingHours {
  open: string;
  close: string;
}

interface SearchResultBase {
  title: string;
  distanceLabel: string;
  address: string;
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
  updatedAt?: string;
  minPrice?: number;
  operatingHours?: OperatingHours | null;
  searchKeywords?: string[];
  isOpen?: boolean;
}

export interface SearchLockerResultItem extends SearchResultBase {
  itemType: "LOCKER";
  lockerId: number;
  categoryLabel: string;
  updatedLabel: string;
  isFavorite?: boolean;
}

export type SearchLockerResultItems = [
  SearchLockerResultItem,
  SearchLockerResultItem,
  ...SearchLockerResultItem[],
];

export interface SearchPlaceResultItem extends SearchResultBase {
  itemType: "PLACE";
  placeId: number;
  lockers: SearchLockerResultItems;
}

export type SearchResultItem = SearchPlaceResultItem | SearchLockerResultItem;

export const getSearchResultKey = (item: SearchResultItem): string =>
  item.itemType === "PLACE"
    ? `place-${item.placeId}`
    : `locker-${item.lockerId}`;

export const getSearchResultEntityId = (item: SearchResultItem): number =>
  item.itemType === "PLACE" ? item.placeId : item.lockerId;

const normalizeSearchText = (value: string) => value.trim().toLocaleLowerCase();

const isValidSearchResult = (item: SearchResultItem) =>
  item.itemType === "LOCKER" || item.lockers.length >= 2;

export const getNextExpandedPlaceId = (
  currentPlaceId: number | null,
  requestedPlaceId: number,
) => (currentPlaceId === requestedPlaceId ? null : requestedPlaceId);

export const findPlaceTitleInSearchResults = (
  items: SearchResultItem[],
  placeId: number,
): string | null => {
  const place = items.find(
    (item): item is SearchPlaceResultItem =>
      item.itemType === "PLACE" && item.placeId === placeId,
  );

  return place?.title ?? null;
};

export const filterSearchResults = (
  items: SearchResultItem[],
  query: string,
): SearchResultItem[] => {
  const validItems = items.filter(isValidSearchResult);
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return validItems;

  return validItems.filter((item) => {
    const itemTargets = [item.title, ...(item.searchKeywords ?? [])];
    const childTargets =
      item.itemType === "PLACE"
        ? item.lockers.flatMap((locker) => [
            locker.title,
            ...(locker.searchKeywords ?? []),
          ])
        : [];

    return [...itemTargets, ...childTargets].some((target) =>
      normalizeSearchText(target).includes(normalizedQuery),
    );
  });
};

export const sortSearchResults = (
  items: SearchResultItem[],
  key: SearchSortKey | null,
  direction: SearchSortDirection = "asc",
): SearchResultItem[] => {
  if (!key) return items;

  const directionMultiplier = direction === "asc" ? 1 : -1;
  const getSortValue = (item: SearchResultItem): number => {
    if (key === "distance") {
      return item.distanceMeters ?? Number.MAX_SAFE_INTEGER;
    }
    if (key === "price") {
      return item.minPrice ?? Number.MAX_SAFE_INTEGER;
    }
    return item.updatedAt ? Date.parse(item.updatedAt) : 0;
  };

  return [...items].sort(
    (left, right) =>
      (getSortValue(left) - getSortValue(right)) * directionMultiplier,
  );
};
