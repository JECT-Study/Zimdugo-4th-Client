import { describe, expect, it } from "vitest";
import {
  parseSearchString,
  stringifySearchParams,
} from "./search-serialization";

describe("parseSearchString", () => {
  it("값을 JSON 으로 읽어 숫자는 숫자로 둔다", () => {
    expect(parseSearchString("?place=9&locker=164")).toEqual({
      place: 9,
      locker: 164,
    });
  });

  it("검색어는 JSON 으로 읽히는 모양이어도 문자열로 둔다", () => {
    // 숫자가 되면 검색어 검증에서 탈락해 `/search?q=123` 이 홈으로 튕긴다.
    expect(parseSearchString("?q=123")).toEqual({ q: "123" });
    expect(parseSearchString("?q=true").q).toBe("true");
    expect(parseSearchString("?q=null").q).toBe("null");
  });

  it("같은 키가 겹치면 마지막 값을 남긴다", () => {
    expect(parseSearchString("?q=a&q=b").q).toBe("b");
  });
});

describe("stringifySearchParams", () => {
  it("숫자처럼 보이는 검색어도 읽고 쓰기를 왕복하면 그대로다", () => {
    expect(parseSearchString(stringifySearchParams({ q: "123" }))).toEqual({
      q: "123",
    });
  });
});
