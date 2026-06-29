import { describe, expect, it } from "vitest";
import { readSearchQueryParam, withSearchQueryParam } from "./search-url-state";

describe("search-url-state", () => {
  it("URL q 값을 검증하고 trim된 검색어로 읽는다", () => {
    expect(readSearchQueryParam(" 강남역 ")).toBe("강남역");
    expect(readSearchQueryParam("강ㄴ남")).toBe("강ㄴ남");
  });

  it("검색어로 사용할 수 없는 q 값은 무시한다", () => {
    expect(readSearchQueryParam("ㄱㄴ")).toBeUndefined();
    expect(readSearchQueryParam("!!!")).toBeUndefined();
    expect(readSearchQueryParam("   ")).toBeUndefined();
    expect(readSearchQueryParam(123)).toBeUndefined();
  });

  it("검색어를 URL params에 추가할 때 상세 params를 보존한다", () => {
    expect(
      withSearchQueryParam(
        {
          locker: "1",
          openLockerId: 2,
          detailSnap: "full",
          focusLat: 37.5,
          focusLng: 127,
        },
        " 강남 ",
      ),
    ).toEqual({
      locker: "1",
      openLockerId: 2,
      detailSnap: "full",
      focusLat: 37.5,
      focusLng: 127,
      q: "강남",
    });
  });

  it("검색어를 제거할 때 q만 제거하고 다른 params는 유지한다", () => {
    expect(
      withSearchQueryParam(
        {
          locker: "1",
          q: "강남",
        },
        "",
      ),
    ).toEqual({
      locker: "1",
    });
  });
});
