import { describe, expect, it } from "vitest";
import { sortSizeTypes } from "./sort-size-types";

describe("sortSizeTypes", () => {
  it("SMALL → MEDIUM → LARGE 순으로 정렬한다", () => {
    expect(sortSizeTypes(["LARGE", "SMALL", "MEDIUM"])).toEqual([
      "SMALL",
      "MEDIUM",
      "LARGE",
    ]);
    expect(sortSizeTypes(["MEDIUM", "LARGE"])).toEqual(["MEDIUM", "LARGE"]);
    expect(sortSizeTypes(["LARGE", "SMALL"])).toEqual(["SMALL", "LARGE"]);
  });

  it("알 수 없는 값은 뒤에 둔다", () => {
    expect(sortSizeTypes(["XL", "SMALL", "MEDIUM"])).toEqual([
      "SMALL",
      "MEDIUM",
      "XL",
    ]);
  });
});
