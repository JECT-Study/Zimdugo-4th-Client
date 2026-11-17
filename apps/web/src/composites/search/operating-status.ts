import type {
  OperatingHours,
  SearchLockerResultItem,
  SearchPlaceResultItem,
  SearchResultItem,
} from "./search-list-model";

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

const markLocker = (
  locker: SearchLockerResultItem,
  currentTime: Date,
): SearchLockerResultItem => ({
  ...locker,
  isOpen: isOperatingNow(locker.operatingHours, currentTime),
});

/**
 * 검색 결과마다 지금 운영 중인지를 붙인다. 순서는 건드리지 않는다.
 *
 * 순서는 서버가 정한다. 서버 응답에는 운영 여부가 없어서, 운영이 끝난 결과를
 * 흐리게 보이려면 화면에서 운영시간으로 판정해야 한다. 장소는 보관함 중 하나라도
 * 운영 중이면 운영 중으로 본다.
 */
export const markOperatingStatus = (
  items: SearchResultItem[],
  currentTime: Date,
): SearchResultItem[] =>
  items.map((item) => {
    if (item.itemType === "LOCKER") return markLocker(item, currentTime);

    const lockers = item.lockers.map((locker) =>
      markLocker(locker, currentTime),
    ) as SearchPlaceResultItem["lockers"];

    return {
      ...item,
      lockers,
      isOpen: lockers.some((locker) => locker.isOpen),
    };
  });
