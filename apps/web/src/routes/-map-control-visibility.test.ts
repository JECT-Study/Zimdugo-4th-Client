import { describe, expect, it } from "vitest";
import {
  resolveMapControlBottomPx,
  shouldShowHomeHeader,
  shouldShowHomeSearchBar,
  shouldShowMapControls,
} from "./-map-control-visibility";

describe("shouldShowHomeSearchBar", () => {
  it("hides home search bar when map loading failed", () => {
    expect(shouldShowHomeSearchBar({ hasMapError: true })).toBe(false);
  });
});

describe("shouldShowMapControls", () => {
  it("hides map controls when map loading failed", () => {
    expect(
      shouldShowMapControls({
        isMapLoading: false,
        hasMapError: true,
        hasMapInstance: false,
      }),
    ).toBe(false);
  });
});

describe("resolveMapControlBottomPx", () => {
  it("시트가 없으면 기본 하단 위치를 쓴다", () => {
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        miniSheetVisibleHeightPx: null,
      }),
    ).toBe(70);
  });

  it("미니 시트 위로 컨트롤을 올린다", () => {
    // 상세 미니 시트 111px + 간격 12px. 기본 70px 이면 시트 뒤로 들어간다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        miniSheetVisibleHeightPx: 111,
      }),
    ).toBe(123);
  });

  it("미니 시트가 기본 위치보다 낮으면 기본 위치를 유지한다", () => {
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        miniSheetVisibleHeightPx: 40,
      }),
    ).toBe(70);
  });
});

describe("shouldShowHomeHeader", () => {
  it("지도 오류에도 헤더를 유지한다", () => {
    // 오류 화면에는 재시도 버튼뿐이고 하단 탭도 없어서, 헤더가 사라지면
    // 설정·프로필·언어로 갈 방법이 없다.
    expect(shouldShowHomeHeader({ isSearchContextActive: false })).toBe(true);
  });

  it("검색 컨텍스트에서는 헤더를 숨긴다", () => {
    expect(shouldShowHomeHeader({ isSearchContextActive: true })).toBe(false);
  });
});
