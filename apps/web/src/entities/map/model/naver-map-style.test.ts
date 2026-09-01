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
    expect(
      getNaverMapStyleOptions("light", BOTH_STYLE_IDS, false, true),
    ).toEqual({
      gl: true,
      customStyleId: "light-style",
      background: "#ffffff",
    });
    expect(
      getNaverMapStyleOptions("dark", BOTH_STYLE_IDS, false, true),
    ).toEqual({
      gl: true,
      customStyleId: "dark-style",
      background: "#111111",
    });
  });

  it("스타일 ID 가 없으면 옵션을 비워 기본 스타일로 둔다", () => {
    expect(
      getNaverMapStyleOptions("light", EMPTY_STYLE_IDS, false, true),
    ).toEqual({});
    expect(
      getNaverMapStyleOptions(
        "dark",
        { light: "light-style", dark: undefined },
        false,
        true,
      ),
    ).toEqual({});
  });

  // FORCE_VECTOR_MAP 이 켜져 있는 동안만 유효한 검증용 동작이다.
  it("벡터맵을 강제하면 스타일 ID 없이도 GL 을 켠다", () => {
    expect(
      getNaverMapStyleOptions("light", EMPTY_STYLE_IDS, true, true),
    ).toEqual({
      gl: true,
      background: "#ffffff",
    });
    expect(
      withNaverMapStyleSubmodules(["geocoder"], EMPTY_STYLE_IDS, true, true),
    ).toEqual(["geocoder", "gl"]);
  });

  it("스타일 ID 가 하나라도 있으면 gl 서브모듈을 싣는다", () => {
    expect(
      withNaverMapStyleSubmodules(
        ["geocoder"],
        { light: undefined, dark: "dark-style" },
        false,
        true,
      ),
    ).toEqual(["geocoder", "gl"]);
    expect(
      withNaverMapStyleSubmodules(["geocoder"], EMPTY_STYLE_IDS, false, true),
    ).toEqual(["geocoder"]);
  });

  it("WebGL 을 못 쓰면 스타일 ID 가 있어도 기본 지도로 둔다", () => {
    expect(
      getNaverMapStyleOptions("light", BOTH_STYLE_IDS, false, false),
    ).toEqual({});
    expect(
      withNaverMapStyleSubmodules(["geocoder"], BOTH_STYLE_IDS, false, false),
    ).toEqual(["geocoder"]);
  });

  it("WebGL 을 못 쓰면 부르는 쪽이 넣어 둔 gl 도 뺀다", () => {
    expect(
      withNaverMapStyleSubmodules(
        ["geocoder", "gl"],
        BOTH_STYLE_IDS,
        false,
        false,
      ),
    ).toEqual(["geocoder"]);
  });

  it("WebGL 을 못 쓰면 벡터맵 강제도 따르지 않는다", () => {
    expect(
      getNaverMapStyleOptions("light", EMPTY_STYLE_IDS, true, false),
    ).toEqual({});
    expect(
      withNaverMapStyleSubmodules(["geocoder"], EMPTY_STYLE_IDS, true, false),
    ).toEqual(["geocoder"]);
  });

  it("이미 gl 이 있으면 중복해서 넣지 않는다", () => {
    expect(
      withNaverMapStyleSubmodules(
        ["geocoder", "gl"],
        BOTH_STYLE_IDS,
        false,
        true,
      ),
    ).toEqual(["geocoder", "gl"]);
  });
});
