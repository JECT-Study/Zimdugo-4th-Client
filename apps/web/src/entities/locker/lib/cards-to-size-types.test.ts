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
});
