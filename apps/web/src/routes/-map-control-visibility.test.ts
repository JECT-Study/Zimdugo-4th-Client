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
        windowHeightPx: 812,
      }),
    ).toBe(70);
  });

  it("시트 위로 컨트롤을 올린다", () => {
    // 상세 미니 시트 111px + 간격 12px. 기본 70px 이면 시트 뒤로 들어간다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        sheetVisibleHeightPx: 111,
        windowHeightPx: 812,
      }),
    ).toBe(123);
  });

  it("시트가 기본 위치보다 낮으면 기본 위치를 유지한다", () => {
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        sheetVisibleHeightPx: 40,
        windowHeightPx: 812,
      }),
    ).toBe(70);
  });
});

describe("shouldShowHomeHeader", () => {
  it("지도 오류에도 헤더를 유지한다", () => {
    // 오류 화면에는 재시도 버튼뿐이고 하단 탭도 없어서, 헤더가 사라지면
    // 설정·프로필·언어로 갈 방법이 없다.
    expect(
      shouldShowHomeHeader({
        isSearchContextActive: false,
        hasMapError: false,
      }),
    ).toBe(true);
  });

  it("검색 컨텍스트에서는 헤더를 숨긴다", () => {
    expect(
      shouldShowHomeHeader({ isSearchContextActive: true, hasMapError: false }),
    ).toBe(false);
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

describe("resolveMapControlBottomPx 상단 경계", () => {
  it("낮은 화면에서는 검색 바를 덮지 않도록 잘라 낸다", () => {
    // 390px 화면 + 상세 하프 191px => 그대로면 bottom 203px 라 스택이 검색 바 위로
    // 올라온다. 상단 경계 120px, 스택 높이 96px => 390 - 120 - 96 = 174px 로 제한.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        sheetVisibleHeightPx: 191,
        windowHeightPx: 390,
      }),
    ).toBe(174);
  });

  it("밀어 올릴 단계가 아니어도 자리가 없으면 null 을 준다", () => {
    // 낮은 화면에서 상세가 full 로 올라가면 시트 쪽이 null 을 준다. 예전에는 이때
    // 상단 경계를 아예 안 보고 기본 70px 을 그대로 써서, 스택 상단이 94px 에 놓여
    // 검색 바를 덮은 채 시트 뒤에 깔렸다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        sheetVisibleHeightPx: null,
        windowHeightPx: 260,
      }),
    ).toBeNull();
  });

  it("배치할 자리가 없으면 null 을 준다", () => {
    // 260px 화면이면 상단 경계를 지키는 bottom 이 44px 라 기본 70px 보다 낮다.
    // 기본 위치로 되돌리면 시트 뒤에 깔린 채 검색 바만 가리므로 숨기는 편이 낫다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        sheetVisibleHeightPx: 191,
        windowHeightPx: 260,
      }),
    ).toBeNull();
  });
});

describe("로딩 스켈레톤과 실제 컨트롤의 위치 일치", () => {
  it("같은 입력이면 같은 값을 준다", () => {
    // 스켈레톤은 이 값을 bottomPx 로 그대로 받는다. 예전에는 70px 로 하드코딩돼
    // 있어서 지도가 준비되는 순간 실제 컨트롤 위치로 튀었다.
    const options = {
      baseBottomPx: 70,
      sheetVisibleHeightPx: 191,
      windowHeightPx: 812,
    };

    expect(resolveMapControlBottomPx(options)).toBe(203);
  });

  it("배치 불가면 null 이라 스켈레톤도 렌더하지 않는다", () => {
    // 실제 컨트롤이 숨겨지는 조건과 같아야 한다. 스켈레톤만 남기면 지도가
    // 준비되는 순간 버튼이 사라진다.
    expect(
      resolveMapControlBottomPx({
        baseBottomPx: 70,
        sheetVisibleHeightPx: 191,
        windowHeightPx: 260,
      }),
    ).toBeNull();
  });
});

describe("shouldShowHomeHeader 지도 오류", () => {
  it("검색 컨텍스트여도 지도 오류 중에는 헤더를 유지한다", () => {
    // /?q=... 딥링크는 첫 컨텍스트가 검색이라, 오류와 겹치면 검색 바도 헤더도
    // 사라져 설정·언어로 갈 방법이 없어진다.
    expect(
      shouldShowHomeHeader({ isSearchContextActive: true, hasMapError: true }),
    ).toBe(true);
  });
});
