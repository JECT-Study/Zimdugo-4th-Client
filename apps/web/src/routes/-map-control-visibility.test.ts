import { describe, expect, it } from "vitest";
import { resolveDetailSheetVisibleHeight } from "#/composites/locker-detail/LockerDetailBottomSheet";
import { resolveSearchListStageVisibleHeight } from "#/composites/search/SearchListBottomSheet";
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
  it("밀어 올릴 단계가 아니면 기본 하단 위치를 쓴다", () => {
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        sheetVisibleHeightPx: null,
      }),
    ).toBe(70);
  });

  it("시트 위로 컨트롤을 올린다", () => {
    // 상세 미니 시트 111px + 간격 12px. 기본 70px 이면 시트 뒤로 들어간다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        sheetVisibleHeightPx: 111,
      }),
    ).toBe(123);
  });

  it("시트가 기본 위치보다 낮으면 기본 위치를 유지한다", () => {
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        sheetVisibleHeightPx: 40,
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

describe("resolveDetailSheetVisibleHeight", () => {
  it("미니와 하프까지 컨트롤이 따라 올라갈 높이를 준다", () => {
    expect(resolveDetailSheetVisibleHeight("mini")).toBe(111);
    expect(resolveDetailSheetVisibleHeight("half")).toBe(191);
  });

  it("full·dismiss 는 따라 올릴 단계가 아니다", () => {
    expect(resolveDetailSheetVisibleHeight("full")).toBeNull();
    expect(resolveDetailSheetVisibleHeight("dismiss")).toBeNull();
  });
});

describe("resolveSearchListStageVisibleHeight", () => {
  it("화면 높이에 따라 단계별 높이를 계산한다", () => {
    // mini: min(242, round(812 * 0.22)) = 179 / half: min(481, round(812 * 0.42)) = 341
    expect(resolveSearchListStageVisibleHeight("mini", 812)).toBe(179);
    expect(resolveSearchListStageVisibleHeight("half", 812)).toBe(341);
  });

  it("full·dismiss 는 따라 올릴 단계가 아니다", () => {
    expect(resolveSearchListStageVisibleHeight("full", 812)).toBeNull();
    expect(resolveSearchListStageVisibleHeight("dismiss", 812)).toBeNull();
  });
});
