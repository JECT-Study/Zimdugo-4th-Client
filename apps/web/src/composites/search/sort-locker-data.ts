import type {
  OperatingHours,
  SearchLockerResultItem,
  SearchPlaceResultItem,
  SearchResultItem,
} from "./search-list-model";

export type LockerPrimarySortType = "DISTANCE" | "UPDATED_AT" | "PRICE";
export type LockerSortDirection = "ASC" | "DESC";

interface DecoratedResult<T extends SearchResultItem> {
  item: T;
  isOpen: boolean;
  distance: number | null;
  updatedAt: number | null;
  price: number | null;
  name: string;
  originalIndex: number;
}

const parseTimeToMinutes = (
  value: string,
  options: { allow24Hour: boolean },
): number | null => {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (minute < 0 || minute > 59) return null;
  if (hour === 24) {
    return options.allow24Hour && minute === 0 ? 24 * 60 : null;
  }
  return hour >= 0 && hour <= 23 ? hour * 60 + minute : null;
};

export const isOperatingNow = (
  operatingHours: OperatingHours | null | undefined,
  currentTime: Date,
): boolean => {
  if (!operatingHours) return true;

  const openMinutes = parseTimeToMinutes(operatingHours.open, {
    allow24Hour: false,
  });
  const closeMinutes = parseTimeToMinutes(operatingHours.close, {
    allow24Hour: false,
  });
  if (
    openMinutes === null ||
    closeMinutes === null ||
    closeMinutes <= openMinutes
  ) {
    return false;
  }

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

const cloneLocker = (item: SearchLockerResultItem): SearchLockerResultItem => ({
  ...item,
  operatingHours: item.operatingHours
    ? { ...item.operatingHours }
    : item.operatingHours,
  searchKeywords: item.searchKeywords ? [...item.searchKeywords] : undefined,
});

const cloneResult = (item: SearchResultItem): SearchResultItem => {
  if (item.itemType === "LOCKER") return cloneLocker(item);

  return {
    ...item,
    operatingHours: item.operatingHours
      ? { ...item.operatingHours }
      : item.operatingHours,
    searchKeywords: item.searchKeywords ? [...item.searchKeywords] : undefined,
    lockers: item.lockers.map(cloneLocker) as SearchPlaceResultItem["lockers"],
  };
};

const compareNullableNumber = (
  left: number | null,
  right: number | null,
  direction: LockerSortDirection,
) => {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return (left - right) * (direction === "ASC" ? 1 : -1);
};

const toFiniteNumber = (value: number | undefined): number | null =>
  value !== undefined && Number.isFinite(value) ? value : null;

const toTimestamp = (value: string | undefined): number | null => {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
};

const decorateItems = (
  items: SearchResultItem[],
  currentTime: Date,
): DecoratedResult<SearchResultItem>[] =>
  items.map((item, originalIndex) => {
    const isOpen =
      item.itemType === "PLACE"
        ? item.lockers.some((locker) =>
            isOperatingNow(locker.operatingHours, currentTime),
          )
        : isOperatingNow(item.operatingHours, currentTime);

    return {
      item,
      isOpen,
      distance: toFiniteNumber(item.distanceMeters),
      updatedAt: toTimestamp(item.updatedAt),
      price: toFiniteNumber(item.minPrice),
      name: item.title,
      originalIndex,
    };
  });

const getPrimaryValue = (
  item: DecoratedResult<SearchResultItem>,
  primarySortType: LockerPrimarySortType,
) => {
  if (primarySortType === "DISTANCE") return item.distance;
  if (primarySortType === "UPDATED_AT") return item.updatedAt;
  return item.price;
};

const compareDecoratedResults = (
  left: DecoratedResult<SearchResultItem>,
  right: DecoratedResult<SearchResultItem>,
  primarySortType: LockerPrimarySortType,
  sortDirection: LockerSortDirection,
) => {
  const primaryComparison = compareNullableNumber(
    getPrimaryValue(left, primarySortType),
    getPrimaryValue(right, primarySortType),
    sortDirection,
  );
  if (primaryComparison !== 0) return primaryComparison;

  const secondaryComparison =
    primarySortType === "DISTANCE"
      ? compareNullableNumber(left.updatedAt, right.updatedAt, "DESC")
      : compareNullableNumber(left.distance, right.distance, "ASC");
  if (secondaryComparison !== 0) return secondaryComparison;

  const priceComparison = compareNullableNumber(left.price, right.price, "ASC");
  if (priceComparison !== 0) return priceComparison;

  const nameComparison = left.name.localeCompare(right.name, "ko");
  if (nameComparison !== 0) return nameComparison;

  return left.originalIndex - right.originalIndex;
};

const sortDecoratedItems = (
  items: DecoratedResult<SearchResultItem>[],
  primarySortType: LockerPrimarySortType,
  sortDirection: LockerSortDirection,
) =>
  [...items].sort((left, right) =>
    compareDecoratedResults(left, right, primarySortType, sortDirection),
  );

const sortByOperatingStatus = (
  items: SearchResultItem[],
  primarySortType: LockerPrimarySortType,
  sortDirection: LockerSortDirection,
  currentTime: Date,
): SearchResultItem[] => {
  const decoratedItems = decorateItems(items, currentTime);
  const openItems: DecoratedResult<SearchResultItem>[] = [];
  const closedItems: DecoratedResult<SearchResultItem>[] = [];

  for (const item of decoratedItems) {
    if (item.isOpen) {
      openItems.push(item);
    } else {
      closedItems.push(item);
    }
  }

  return [
    ...sortDecoratedItems(openItems, primarySortType, sortDirection),
    ...sortDecoratedItems(closedItems, primarySortType, sortDirection),
  ].map(({ item, isOpen }) => ({ ...item, isOpen }));
};

export const sortLockerData = (
  items: SearchResultItem[],
  primarySortType: LockerPrimarySortType,
  sortDirection: LockerSortDirection,
  currentTime: Date,
): SearchResultItem[] => {
  const clonedItems = items.map(cloneResult);
  const recursivelySortedItems = clonedItems.map((item) => {
    if (item.itemType === "LOCKER") return item;

    const sortedLockers = sortByOperatingStatus(
      item.lockers,
      primarySortType,
      sortDirection,
      currentTime,
    ) as SearchLockerResultItem[];

    return {
      ...item,
      lockers: sortedLockers as SearchPlaceResultItem["lockers"],
    };
  });

  return sortByOperatingStatus(
    recursivelySortedItems,
    primarySortType,
    sortDirection,
    currentTime,
  );
};
