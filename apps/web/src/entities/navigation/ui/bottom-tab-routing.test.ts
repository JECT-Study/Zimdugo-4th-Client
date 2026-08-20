import { describe, expect, it } from "vitest";
import { BOTTOM_TAB_LINKS, getActiveBottomTab } from "./bottom-tab-routing";

describe("bottom-tab-routing", () => {
  it("홈 탭 링크는 search params 없이 루트로 이동한다", () => {
    expect(BOTTOM_TAB_LINKS.home).toBe("/");
  });

  it("기존 마이페이지 링크는 통합 설정 페이지를 가리킨다", () => {
    expect(BOTTOM_TAB_LINKS.my).toBe("/settings");
  });

  it("active tab은 pathname 기준으로 계산한다", () => {
    expect(getActiveBottomTab("/")).toBe("home");
    expect(getActiveBottomTab("/my")).toBe("settings");
    expect(getActiveBottomTab("/my/favorites")).toBe("settings");
    expect(getActiveBottomTab("/settings")).toBe("settings");
    expect(getActiveBottomTab("/report")).toBe("report");
  });

  it("locale prefix가 있어도 active tab을 계산한다", () => {
    expect(getActiveBottomTab("/en")).toBe("home");
    expect(getActiveBottomTab("/en/my")).toBe("settings");
    expect(getActiveBottomTab("/ja/settings")).toBe("settings");
  });
});
