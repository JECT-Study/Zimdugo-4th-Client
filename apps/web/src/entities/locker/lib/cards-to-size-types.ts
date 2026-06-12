import type { SizeCardType } from "#/entities/locker/ui/size-card/SizeCard";
import { sortSizeTypes } from "./sort-size-types";

export type LockerSizeApiType = "SMALL" | "MEDIUM" | "LARGE";

const SIZE_CARD_TO_API: Record<SizeCardType, LockerSizeApiType> = {
  S: "SMALL",
  M: "MEDIUM",
  L: "LARGE",
};

/** UI 사이즈 카드(S/M/L)를 API sizeTypes 값으로 변환 */
export const cardsToSizeTypes = (
  selectedSizes: SizeCardType[],
): LockerSizeApiType[] =>
  sortSizeTypes(
    selectedSizes
      .map((value) => SIZE_CARD_TO_API[value])
      .filter((value): value is LockerSizeApiType => !!value),
  );
