import { m } from "@repo/i18n";
import type { LockerType } from "#/shared/types/locker-type";

const LOCKER_TYPE_LABEL_GETTERS: Record<LockerType, () => string> = {
  MUSEUM: () => m.search_filter_place_museum_short(),
  SUBWAY_STATION: () => m.search_filter_place_subway_short(),
  DEPARTMENT_STORE: () => m.search_filter_place_department_short(),
  CONVENIENCE_STORE: () => m.search_filter_place_convenience_short(),
  PUBLIC_OFFICE: () => m.search_filter_place_public_short(),
  PRIVATE_LOCKER: () => m.search_filter_place_private_short(),
  TRAIN_STATION: () => m.search_filter_place_train_short(),
  ETC: () => m.search_filter_place_other_short(),
};

export const getLockerTypeLabel = (lockerType: string | undefined): string => {
  if (!lockerType) return "";

  const labelGetter = LOCKER_TYPE_LABEL_GETTERS[lockerType as LockerType];
  return labelGetter?.() ?? lockerType;
};
