import { describe, expect, it } from "vitest";
import {
  createKeywordSearchSelection,
  createPlaceSearchSelection,
  syncSearchDraft,
} from "./search-selection";

describe("search-selection", () => {
  it("commits keyword search to draft and query", () => {
    expect(createKeywordSearchSelection("  강남역 ")).toEqual({
      searchDraft: "강남역",
      searchQuery: "강남역",
    });
  });

  it("keeps draft and applies place title to query", () => {
    expect(createPlaceSearchSelection("코엑", "코엑스")).toEqual({
      searchDraft: "코엑",
      searchQuery: "코엑스",
    });
  });

  it("syncs draft only for suggest locker (Q10)", () => {
    expect(syncSearchDraft("  강남 ")).toEqual({
      searchDraft: "강남",
    });
  });
});
