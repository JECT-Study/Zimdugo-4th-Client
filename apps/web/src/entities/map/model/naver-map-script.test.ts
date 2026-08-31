import { describe, expect, it } from "vitest";

import { getNaverMapScriptSrc } from "./naver-map-script";

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
