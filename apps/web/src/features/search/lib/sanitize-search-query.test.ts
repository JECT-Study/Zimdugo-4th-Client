import { describe, expect, it } from "vitest";
import {
  capSearchQueryDraft,
  getSearchQueryIssue,
  getValidatedSearchQuery,
  trimSearchQueryDraft,
  isSearchQueryDraftValid,
  isSearchQueryDraftWellFormed,
  isSearchQuerySubmittable,
  resolveSearchQuerySubmitAttempt,
  SEARCH_QUERY_MAX_LENGTH,
  SEARCH_QUERY_MIN_LENGTH,
} from "./sanitize-search-query";

describe("sanitize-search-query", () => {
  it("입력 중에는 IME 조합용 자모를 유지하고 길이만 제한한다", () => {
    expect(capSearchQueryDraft("ㄱ")).toBe("ㄱ");
    expect(capSearchQueryDraft("ㄱㅏ")).toBe("ㄱㅏ");
    expect(capSearchQueryDraft("코엑스😀")).toBe("코엑스😀");
  });

  it("검증 시 trim하고 통과하면 trim된 검색어를 반환한다", () => {
    expect(trimSearchQueryDraft("  강남역  ")).toBe("강남역");
    expect(getValidatedSearchQuery("  강남역  ")).toBe("강남역");
    expect(isSearchQueryDraftValid("  강남역  ")).toBe(true);
    expect(resolveSearchQuerySubmitAttempt("  강남역  ")).toEqual({
      ok: true,
      query: "강남역",
    });
    expect(capSearchQueryDraft("  강남역  ")).toBe("  강남역  ");
  });

  it("well-formed 검사는 trim된 문자열 기준으로 형식만 판별한다", () => {
    expect(isSearchQueryDraftWellFormed("강남")).toBe(true);
    expect(isSearchQueryDraftWellFormed("강남 역")).toBe(true);
    expect(isSearchQueryDraftWellFormed("강남  역")).toBe(false);
    expect(isSearchQueryDraftWellFormed("강남!")).toBe(false);
    expect(isSearchQueryDraftWellFormed("ㄱㄴㄷ")).toBe(false);
    expect(isSearchQueryDraftWellFormed("!!!")).toBe(false);
  });

  it("입력 이슈를 길이 부족과 형식 오류로 구분한다", () => {
    expect(getSearchQueryIssue("")).toBeNull();
    expect(getSearchQueryIssue("가")).toBe("too-short");
    expect(getSearchQueryIssue("강남")).toBeNull();
    expect(getSearchQueryIssue("강남!")).toBe("invalid-format");
    expect(getSearchQueryIssue("!!!")).toBe("invalid-format");
    expect(getSearchQueryIssue("ㄱㅏ")).toBe("invalid-format");
  });

  it("규칙을 통과한 draft만 자동완성·제출 가능하다", () => {
    expect(isSearchQueryDraftValid("강남")).toBe(true);
    expect(isSearchQueryDraftValid("강남!")).toBe(false);
    expect(isSearchQuerySubmittable("가")).toBe(false);
    expect(isSearchQuerySubmittable("강남")).toBe(true);
    expect(SEARCH_QUERY_MIN_LENGTH).toBe(2);
    expect(SEARCH_QUERY_MAX_LENGTH).toBe(30);
  });

  it("최대 30자까지만 유지한다", () => {
    const longQuery = "가".repeat(SEARCH_QUERY_MAX_LENGTH + 5);
    expect(capSearchQueryDraft(longQuery)).toHaveLength(SEARCH_QUERY_MAX_LENGTH);
  });

  it("제출 시도는 유효한 검색어만 통과시키고 화면 입력값은 바꾸지 않는다", () => {
    expect(resolveSearchQuerySubmitAttempt("!!!")).toEqual({
      ok: false,
      reason: "invalid-format",
    });
    expect(resolveSearchQuerySubmitAttempt("가")).toEqual({
      ok: false,
      reason: "too-short",
    });
    expect(resolveSearchQuerySubmitAttempt("강남!")).toEqual({
      ok: false,
      reason: "invalid-format",
    });
    expect(resolveSearchQuerySubmitAttempt("강남")).toEqual({
      ok: true,
      query: "강남",
    });
  });
});
