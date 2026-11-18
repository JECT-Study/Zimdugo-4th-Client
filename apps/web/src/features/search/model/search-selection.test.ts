import { describe, expect, it } from "vitest";
import {
  createKeywordSearchSelection,
  createLockerSearchSelection,
  createPlaceSearchSelection,
  syncSearchDraft,
} from "./search-selection";

describe("search-selection", () => {
  it("키워드 검색을 draft와 query에 반영한다", () => {
    expect(createKeywordSearchSelection("강남역")).toEqual({
      searchDraft: "강남역",
      searchQuery: "강남역",
    });
  });

  it("장소를 고르면 입력하던 글자가 아니라 장소 이름이 검색창과 검색어가 된다", () => {
    expect(createPlaceSearchSelection("코엑", "코엑스")).toEqual({
      searchDraft: "코엑스",
      searchQuery: "코엑스",
    });
  });

  it("syncSearchDraft는 draft만 동기화한다", () => {
    expect(syncSearchDraft("강남")).toEqual({
      searchDraft: "강남",
    });
  });

  it("보관함을 고르면 입력하던 글자가 아니라 보관함 이름이 검색창과 검색어가 된다", () => {
    expect(
      createLockerSearchSelection("강남", "강남역 4번 출구 보관함"),
    ).toEqual({
      searchDraft: "강남역 4번 출구 보관함",
      searchQuery: "강남역 4번 출구 보관함",
    });
  });

  it("이름에 검색어가 받지 않는 글자가 있으면 공백으로 바꿔 쓴다", () => {
    expect(createLockerSearchSelection("강남", "강남역 1, 12번 출구")).toEqual({
      searchDraft: "강남역 1 12번 출구",
      searchQuery: "강남역 1 12번 출구",
    });
  });

  it("이름이 검색어가 될 수 없으면 입력하던 글자를 쓴다", () => {
    expect(createPlaceSearchSelection("삼성", "###")).toEqual({
      searchDraft: "삼성",
      searchQuery: "삼성",
    });
  });
});
