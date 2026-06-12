import type { LockerSizeApiType } from "./cards-to-size-types";

const SIZE_TYPE_ORDER: LockerSizeApiType[] = ["SMALL", "MEDIUM", "LARGE"];

const SIZE_TYPE_ORDER_INDEX = new Map(
  SIZE_TYPE_ORDER.map((sizeType, index) => [sizeType, index]),
);

/** SMALL → MEDIUM → LARGE 순으로 정렬한다. 알 수 없는 값은 뒤에 둔다. */
export const sortSizeTypes = <T extends string>(sizeTypes: readonly T[]): T[] =>
  [...sizeTypes].sort((left, right) => {
    const leftIndex =
      SIZE_TYPE_ORDER_INDEX.get(left as LockerSizeApiType) ??
      SIZE_TYPE_ORDER.length;
    const rightIndex =
      SIZE_TYPE_ORDER_INDEX.get(right as LockerSizeApiType) ??
      SIZE_TYPE_ORDER.length;

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.localeCompare(right);
  });
