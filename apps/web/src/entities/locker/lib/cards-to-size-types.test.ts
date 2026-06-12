import { describe, expect, it } from "vitest";
import { cardsToSizeTypes } from "./cards-to-size-types";

describe("cardsToSizeTypes", () => {
  it("S/M/L 카드를 SMALL/MEDIUM/LARGE로 변환한다", () => {
    expect(cardsToSizeTypes(["S", "M", "L"])).toEqual([
      "SMALL",
      "MEDIUM",
      "LARGE",
    ]);
  });

  it("선택 순서와 관계없이 SMALL → MEDIUM → LARGE 순으로 정렬한다", () => {
    expect(cardsToSizeTypes(["L", "S"])).toEqual(["SMALL", "LARGE"]);
    expect(cardsToSizeTypes(["M", "L", "S"])).toEqual([
      "SMALL",
      "MEDIUM",
      "LARGE",
    ]);
  });
});
