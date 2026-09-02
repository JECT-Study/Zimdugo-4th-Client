import { describe, expect, it } from "vitest";

import {
  canReuseNaverMapScript,
  getNaverMapScriptSrc,
} from "./naver-map-script";

describe("naver-map-script", () => {
  it("서브모듈 구분자를 인코딩하지 않는다", () => {
    const src = getNaverMapScriptSrc({
      clientId: "key",
      language: "ko",
      submodules: ["geocoder", "gl"],
    });

    expect(src).toContain("submodules=geocoder,gl");
    expect(src).not.toContain("%2C");
  });

  it("언어가 없으면 파라미터를 붙이지 않는다", () => {
    const src = getNaverMapScriptSrc({
      clientId: "key",
      submodules: ["geocoder"],
    });

    expect(src).toBe(
      "https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=key&submodules=geocoder",
    );
  });
});

describe("canReuseNaverMapScript", () => {
  const withSubmodules = (submodules: string[]) =>
    getNaverMapScriptSrc({ clientId: "key", language: "ko", submodules });

  it("필요한 서브모듈을 다 갖췄으면 다시 싣지 않는다", () => {
    expect(
      canReuseNaverMapScript(
        withSubmodules(["geocoder", "gl"]),
        withSubmodules(["geocoder"]),
      ),
    ).toBe(true);
  });

  it("필요한 서브모듈이 빠져 있으면 다시 싣는다", () => {
    expect(
      canReuseNaverMapScript(
        withSubmodules(["geocoder"]),
        withSubmodules(["geocoder", "gl"]),
      ),
    ).toBe(false);
  });

  it("키나 언어가 다르면 다시 싣는다", () => {
    expect(
      canReuseNaverMapScript(
        getNaverMapScriptSrc({
          clientId: "other",
          language: "ko",
          submodules: ["geocoder"],
        }),
        withSubmodules(["geocoder"]),
      ),
    ).toBe(false);
    expect(
      canReuseNaverMapScript(
        getNaverMapScriptSrc({
          clientId: "key",
          language: "en",
          submodules: ["geocoder"],
        }),
        withSubmodules(["geocoder"]),
      ),
    ).toBe(false);
  });

  it("주소로 읽을 수 없으면 다시 싣는다", () => {
    expect(canReuseNaverMapScript("", withSubmodules(["geocoder"]))).toBe(
      false,
    );
  });
});
