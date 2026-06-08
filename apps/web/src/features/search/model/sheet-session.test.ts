import { describe, expect, it } from "vitest";
import {
  createDetailBackTarget,
  createKeywordListContext,
  createMapLockerPinBackTarget,
  createPlaceListContext,
  resolveActiveListContext,
} from "./sheet-session";

describe("sheet-session", () => {
  it("keyword list 컨텍스트에서 active list를 해석한다", () => {
    expect(
      resolveActiveListContext(
        "list",
        "search",
        "keyword",
        null,
        null,
      ),
    ).toEqual(createKeywordListContext("search"));
  });

  it("detail back target에서 active list를 해석한다", () => {
    const backTarget = createDetailBackTarget(
      createPlaceListContext(158, "search"),
    );

    expect(
      resolveActiveListContext("detail", "search", "place", 158, backTarget),
    ).toEqual(createPlaceListContext(158, "search"));
  });

  it("idle back target은 active list가 없다", () => {
    expect(
      resolveActiveListContext(
        "detail",
        "map",
        null,
        null,
        createMapLockerPinBackTarget(),
      ),
    ).toBeNull();
  });
});
