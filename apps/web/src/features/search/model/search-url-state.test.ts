import { describe, expect, it } from "vitest";
import {
  readSearchPlaceIdParam,
  readSearchQueryParam,
  withLockerDetailParam,
  withoutLockerDetailParams,
  withoutSearchContextParams,
  withSearchPlaceIdParam,
  withSearchQueryParam,
} from "./search-url-state";

describe("search-url-state", () => {
  it("주소의 q 를 검증하고 다듬어 읽는다", () => {
    expect(readSearchQueryParam(" 강남역 ")).toBe("강남역");
    expect(readSearchQueryParam("강남역")).toBe("강남역");
  });

  it("검색어로 쓸 수 없는 q 는 무시한다", () => {
    expect(readSearchQueryParam("ㄱㄴ")).toBeUndefined();
    expect(readSearchQueryParam("!!!")).toBeUndefined();
    expect(readSearchQueryParam("   ")).toBeUndefined();
    expect(readSearchQueryParam(123)).toBeUndefined();
  });

  it("상세 파라미터를 지키면서 q 를 붙인다", () => {
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

  it("검색어가 비면 q 만 걷어낸다", () => {
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

  it("주소의 searchPlaceId 를 양의 정수로 읽는다", () => {
    expect(readSearchPlaceIdParam("123")).toBe(123);
    expect(readSearchPlaceIdParam(456)).toBe(456);
    expect(readSearchPlaceIdParam("0")).toBeUndefined();
    expect(readSearchPlaceIdParam("-1")).toBeUndefined();
    expect(readSearchPlaceIdParam("abc")).toBeUndefined();
    expect(readSearchPlaceIdParam("123abc")).toBeUndefined();
  });

  it("주소에 searchPlaceId 를 붙이거나 뗀다", () => {
    expect(withSearchPlaceIdParam({ q: "코엑스" }, 7)).toEqual({
      q: "코엑스",
      searchPlaceId: 7,
    });

    expect(
      withSearchPlaceIdParam(
        {
          q: "코엑스",
          searchPlaceId: 7,
          locker: "1",
        },
        null,
      ),
    ).toEqual({
      q: "코엑스",
      locker: "1",
    });
  });

  it("상세 파라미터를 지키면서 q 와 searchPlaceId 를 걷어낸다", () => {
    expect(
      withoutSearchContextParams({
        q: "coex",
        searchPlaceId: 7,
        locker: "1-coex-locker",
        detailSnap: "full",
      }),
    ).toEqual({
      locker: "1-coex-locker",
      detailSnap: "full",
    });
  });

  it("검색 컨텍스트를 지키면서 상세 파라미터를 붙인다", () => {
    expect(
      withLockerDetailParam(
        {
          q: "coex",
          searchPlaceId: 7,
        },
        "123-coex-locker",
      ),
    ).toEqual({
      q: "coex",
      searchPlaceId: 7,
      locker: "123-coex-locker",
    });
  });
});

describe("withoutLockerDetailParams", () => {
  it("상세를 열 때 붙는 파라미터를 모두 뗀다", () => {
    // 지도에서 핀을 고른 뒤 뒤로 나와도 이 값들이 남아 있어, 새로고침하면 닫았던
    // 상세가 다시 열렸다.
    expect(
      withoutLockerDetailParams({
        q: "강남역",
        locker: "500-강남역",
        openLockerId: 500,
        detailSnap: "full",
        focusLat: 37.5,
        focusLng: 127,
      }),
    ).toEqual({ q: "강남역" });
  });

  it("검색 컨텍스트 파라미터는 건드리지 않는다", () => {
    expect(
      withoutLockerDetailParams({ q: "강남역", searchPlaceId: 42 }),
    ).toEqual({ q: "강남역", searchPlaceId: 42 });
  });

  it("원본을 바꾸지 않는다", () => {
    const params = { locker: "500-강남역" };

    withoutLockerDetailParams(params);

    expect(params.locker).toBe("500-강남역");
  });
});
