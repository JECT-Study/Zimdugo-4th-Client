import { describe, expect, it } from "vitest";
import {
  applyLockerSearchDraft,
  createKeywordSearchSelection,
  createPlaceSearchSelection,
  syncSearchDraft,
} from "./search-selection";

describe("search-selection", () => {
  it("키워드 검색을 draft와 query에 반영한다", () => {
    expect(createKeywordSearchSelection("  강남역 ")).toEqual({
      searchDraft: "강남역",
      searchQuery: "강남역",
    });
  });

  it("장소 검색은 draft를 유지하고 query에 장소명을 넣는다", () => {
    expect(createPlaceSearchSelection("코엑", "코엑스")).toEqual({
      searchDraft: "코엑",
      searchQuery: "코엑스",
    });
  });

  it("syncSearchDraft는 draft만 동기화한다", () => {
    expect(syncSearchDraft("  강남 ")).toEqual({
      searchDraft: "강남",
    });
  });

  it("보관함 검색은 draft와 query를 함께 검색창에 반영한다", () => {
    expect(applyLockerSearchDraft("  보관함 ")).toEqual({
      searchDraft: "보관함",
      searchQuery: "보관함",
    });
  });
});
