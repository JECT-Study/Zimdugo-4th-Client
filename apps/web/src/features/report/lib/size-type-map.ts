import type { SizeCardType } from "#/entities/locker/ui/size-card/SizeCard";
import type { SizeType } from "#/features/report/model/report-types";

const SIZE_TYPE_TO_CARD: Record<SizeType, SizeCardType> = {
  SMALL: "S",
  MEDIUM: "M",
  LARGE: "L",
};

const CARD_TO_SIZE_TYPE: Record<SizeCardType, SizeType> = {
  S: "SMALL",
  M: "MEDIUM",
  L: "LARGE",
};

export function sizeTypesToCards(sizeTypes: SizeType[]): SizeCardType[] {
  return sizeTypes.map((size) => SIZE_TYPE_TO_CARD[size]);
}

export function cardsToSizeTypes(cards: SizeCardType[]): SizeType[] {
  return cards.map((card) => CARD_TO_SIZE_TYPE[card]);
}
