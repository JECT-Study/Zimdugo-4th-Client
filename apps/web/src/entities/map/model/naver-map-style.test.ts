import { describe, expect, it } from "vitest";

import {
  getNaverMapStyleOptions,
  type NaverMapCustomStyleIds,
  withNaverMapStyleSubmodules,
} from "./naver-map-style";

const BOTH_STYLE_IDS: NaverMapCustomStyleIds = {
  light: "light-style",
  dark: "dark-style",
};
const EMPTY_STYLE_IDS: NaverMapCustomStyleIds = {
  light: undefined,
  dark: "",
};

describe("naver-map-style", () => {
  it("테마별 스타일 ID 를 GL 옵션으로 바꾼다", () => {
    expect(getNaverMapStyleOptions("light", BOTH_STYLE_IDS)).toEqual({
      gl: true,
      customStyleId: "light-style",
      background: "#ffffff",
    });
    expect(getNaverMapStyleOptions("dark", BOTH_STYLE_IDS)).toEqual({
      gl: true,
      customStyleId: "dark-style",
      background: "#111111",
    });
  });

  it("스타일 ID 가 없으면 옵션을 비워 기본 스타일로 둔다", () => {
    expect(getNaverMapStyleOptions("light", EMPTY_STYLE_IDS)).toEqual({});
    expect(
      getNaverMapStyleOptions("dark", {
        light: "light-style",
        dark: undefined,
      }),
    ).toEqual({});
  });

  it("스타일 ID 가 하나라도 있으면 gl 서브모듈을 싣는다", () => {
    expect(
      withNaverMapStyleSubmodules(["geocoder"], {
        light: undefined,
        dark: "dark-style",
      }),
    ).toEqual(["geocoder", "gl"]);
    expect(withNaverMapStyleSubmodules(["geocoder"], EMPTY_STYLE_IDS)).toEqual([
      "geocoder",
    ]);
  });

  it("이미 gl 이 있으면 중복해서 넣지 않는다", () => {
    expect(
      withNaverMapStyleSubmodules(["geocoder", "gl"], BOTH_STYLE_IDS),
    ).toEqual(["geocoder", "gl"]);
  });
});
